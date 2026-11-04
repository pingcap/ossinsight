import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sqlite3 from "sqlite3";
import Cryptr from "cryptr";

/** Run only against an offline copy, retaining its original rollback database. */
export async function rekeyConnections({
  database,
  sourceKey,
  targetKey,
  expectedCount,
  apply = false,
}) {
  assert(
    typeof sourceKey === "string" && sourceKey.length > 0,
    "Source key is required"
  );
  assert(
    typeof targetKey === "string" && targetKey.length >= 32,
    "Target key must have at least 32 characters"
  );
  assert(sourceKey !== targetKey, "Source and target keys must differ");
  assert(
    Number.isInteger(expectedCount) && expectedCount >= 0,
    "Expected connection count is required"
  );
  assert.equal(typeof apply, "boolean", "Apply must be an explicit boolean");
  const source = new Cryptr(sourceKey);
  const target = new Cryptr(targetKey);
  const db = await new Promise((resolve, reject) => {
    const connection = new sqlite3.Database(
      database,
      sqlite3.OPEN_READWRITE,
      (error) => (error ? reject(error) : resolve(connection))
    );
  });
  const all = (sql, parameters = []) =>
    new Promise((resolve, reject) =>
      db.all(sql, parameters, (error, rows) =>
        error ? reject(error) : resolve(rows)
      )
    );
  const run = (sql, parameters = []) =>
    new Promise((resolve, reject) =>
      db.run(sql, parameters, function (error) {
        error ? reject(error) : resolve(this.changes);
      })
    );
  let transaction = false;
  try {
    await run("PRAGMA busy_timeout = 5000");
    const integrity = await all("PRAGMA integrity_check");
    assert(
      integrity.length === 1 && Object.values(integrity[0])[0] === "ok",
      "Database integrity check failed"
    );
    await run("BEGIN IMMEDIATE");
    transaction = true;
    const rows = await all("SELECT id, data FROM connections ORDER BY id");
    assert.equal(rows.length, expectedCount, "Unexpected connection count");
    for (const row of rows) {
      let encrypted;
      try {
        assert(typeof row.data === "string" && row.data.length > 0);
        const plaintext = source.decrypt(row.data);
        const decoded = JSON.parse(plaintext);
        assert(
          decoded && typeof decoded === "object" && !Array.isArray(decoded)
        );
        encrypted = target.encrypt(plaintext);
        assert.equal(target.decrypt(encrypted), plaintext);
      } catch {
        throw new Error(
          "Connection decryption or round-trip verification failed; no plaintext is logged"
        );
      }
      if (apply) {
        assert.equal(
          await run(
            "UPDATE connections SET data = ? WHERE id = ? AND data = ?",
            [encrypted, row.id, row.data]
          ),
          1,
          "Connection changed during migration"
        );
      }
    }
    await run(apply ? "COMMIT" : "ROLLBACK");
    transaction = false;
    return {
      checked: rows.length,
      updated: apply ? rows.length : 0,
      applied: apply,
    };
  } finally {
    try {
      if (transaction) await run("ROLLBACK");
    } finally {
      await new Promise((resolve, reject) =>
        db.close((error) => (error ? reject(error) : resolve()))
      );
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    assert.equal(
      process.env.SQLPAD_REKEY_OFFLINE_COPY,
      "1",
      "Explicit offline-copy confirmation is required"
    );
    const mode = process.env.SQLPAD_REKEY_MODE || "check";
    assert(["check", "apply"].includes(mode), "Invalid rekey mode");
    assert(process.env.SQLPAD_DB_PATH, "Database directory is required");
    assert(
      process.env.SQLPAD_REKEY_EXPECTED_CONNECTIONS !== undefined,
      "Expected connection count is required"
    );
    const result = await rekeyConnections({
      database: path.join(process.env.SQLPAD_DB_PATH, "sqlpad.sqlite"),
      sourceKey: process.env.SQLPAD_REKEY_SOURCE_PASSPHRASE,
      targetKey: process.env.SQLPAD_PASSPHRASE,
      expectedCount: Number(process.env.SQLPAD_REKEY_EXPECTED_CONNECTIONS),
      apply: mode === "apply",
    });
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
