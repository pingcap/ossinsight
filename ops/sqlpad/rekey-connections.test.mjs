import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sqlite3 from "sqlite3";
import Cryptr from "cryptr";
import { rekeyConnections } from "./rekey-connections.mjs";

const sourceKey = "synthetic-old-encryption-key-for-tests";
const targetKey = "synthetic-new-encryption-key-for-tests";
const payload = JSON.stringify({
  host: "database.invalid",
  password: "fixture-password",
});

async function fixture(t, corruptSecond = false) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sqlpad-rekey-test-"));
  const database = path.join(directory, "sqlpad.sqlite");
  const db = new sqlite3.Database(database);
  t.after(async () => {
    await new Promise((resolve, reject) =>
      db.close((error) => (error ? reject(error) : resolve()))
    );
    await rm(directory, { recursive: true, force: true });
  });
  const run = (sql, params = []) =>
    new Promise((resolve, reject) =>
      db.run(sql, params, (error) => (error ? reject(error) : resolve()))
    );
  const read = () =>
    new Promise((resolve, reject) =>
      db.all("SELECT * FROM connections ORDER BY id", (error, rows) =>
        error ? reject(error) : resolve(rows)
      )
    );
  await run(
    "CREATE TABLE connections (id TEXT PRIMARY KEY, data TEXT NOT NULL, updatedAt TEXT)"
  );
  await run("CREATE TABLE users (id TEXT PRIMARY KEY, passhash TEXT)");
  await run("INSERT INTO users VALUES ('user-1', 'unchanged-fixture-hash')");
  const ciphertext = new Cryptr(sourceKey).encrypt(payload);
  await run(
    "INSERT INTO connections VALUES ('connection-1', ?, 'unchanged-date')",
    [ciphertext]
  );
  if (corruptSecond)
    await run(
      "INSERT INTO connections VALUES ('connection-2', 'invalid-ciphertext', 'unchanged-date')"
    );
  return { database, db, read, ciphertext };
}

test("dry run preserves ciphertext and all metadata", async (t) => {
  const f = await fixture(t);
  const before = await f.read();
  assert.deepEqual(
    await rekeyConnections({ ...f, sourceKey, targetKey, expectedCount: 1 }),
    { checked: 1, updated: 0, applied: false }
  );
  assert.deepEqual(await f.read(), before);
});

test("apply preserves plaintext, identities, timestamps, and user password hashes", async (t) => {
  const f = await fixture(t);
  assert.deepEqual(
    await rekeyConnections({
      ...f,
      sourceKey,
      targetKey,
      expectedCount: 1,
      apply: true,
    }),
    { checked: 1, updated: 1, applied: true }
  );
  const [row] = await f.read();
  assert.equal(row.id, "connection-1");
  assert.equal(row.updatedAt, "unchanged-date");
  assert.equal(new Cryptr(targetKey).decrypt(row.data), payload);
  assert.throws(() => new Cryptr(sourceKey).decrypt(row.data));
  const users = await new Promise((resolve, reject) =>
    f.db.all("SELECT * FROM users", (error, rows) =>
      error ? reject(error) : resolve(rows)
    )
  );
  assert.deepEqual(users, [
    { id: "user-1", passhash: "unchanged-fixture-hash" },
  ]);
});

test("a corrupt later row rolls back earlier updates", async (t) => {
  const f = await fixture(t, true);
  const before = await f.read();
  await assert.rejects(
    rekeyConnections({
      ...f,
      sourceKey,
      targetKey,
      expectedCount: 2,
      apply: true,
    }),
    /decryption or round-trip/
  );
  assert.deepEqual(await f.read(), before);
});

test("wrong source key leaves all rows unchanged", async (t) => {
  const f = await fixture(t);
  const before = await f.read();
  await assert.rejects(
    rekeyConnections({
      ...f,
      sourceKey: targetKey,
      targetKey: sourceKey,
      expectedCount: 1,
      apply: true,
    }),
    /decryption or round-trip/
  );
  assert.deepEqual(await f.read(), before);
});

test("unexpected database size fails before changing any row", async (t) => {
  const f = await fixture(t);
  const before = await f.read();
  await assert.rejects(
    rekeyConnections({
      ...f,
      sourceKey,
      targetKey,
      expectedCount: 2,
      apply: true,
    }),
    /Unexpected connection count/
  );
  assert.deepEqual(await f.read(), before);
});
