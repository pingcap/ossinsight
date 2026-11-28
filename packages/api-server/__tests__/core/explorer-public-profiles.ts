import {createConnection, Connection, RowDataPacket} from 'mysql2/promise';
import {enforceSQLPolicy} from '@ossinsight/sql-policy';
import {checkAnalyticsDatabase} from '../../src/core/playground/database-policy';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';

let reader: Connection;
beforeAll(async () => {
  await bootstrapTestDatabase();
  const db = getTestDatabase();
  const writer = await createConnection(db.rootUrl() + '/' + db.database);
  try {
    await writer.execute('INSERT INTO github_users (id,login,stars_total) VALUES (?,?,?)', [71019, 'fixture-profile', 0]);
  } finally {await writer.end();}
  reader = await createConnection(db.analyticsUrl());
});
afterAll(async () => {
  if (reader) await reader.end();
  await releaseTestDatabase();
});

test('reader grants, wildcard output and nested profile references use the public projection', async () => {
  await checkAnalyticsDatabase(reader);
  const [rows, fields] = await reader.query<RowDataPacket[]>(enforceSQLPolicy(
    'SELECT github_users.* FROM github_users WHERE github_users.id=71019'));
  expect(fields.map(field => field.name)).toEqual(['id','login','type','name','organization','country_code',
    'followers','followings','created_at','updated_at']);
  expect(rows).toHaveLength(1);
  expect(rows[0].login).toBe('fixture-profile');
  const [nested] = await reader.query<RowDataPacket[]>(enforceSQLPolicy(
    'WITH profiles AS (SELECT u.id,u.login FROM github_users AS u) SELECT login FROM profiles WHERE id=71019'));
  expect(nested).toEqual([{login:'fixture-profile'}]);
  const [grants] = await reader.query<RowDataPacket[]>('SHOW GRANTS FOR CURRENT_USER');
  expect(grants.map(row => Object.values(row)[0]).join(' ')).not.toMatch(/\.\x60?github_users\x60? TO/i);
});
