import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createConnection, Connection, RowDataPacket} from 'mysql2/promise';
import {bootstrapTestDatabase, getTestDatabase, releaseTestDatabase} from '../helpers/db';

const configRoot = resolve(__dirname, '../../../../configs');
const repo = 71033;
let db: Connection;

async function runPipeline(name: string) {
  const sql = await readFile(resolve(configRoot, 'pipelines', name, 'process.sql'), 'utf8');
  await db.query(sql, {from: '2024-01-01', to: '2024-02-01'});
}

beforeAll(async () => {
  await bootstrapTestDatabase();
  const fixture = getTestDatabase();
  db = await createConnection(fixture.rootUrl() + '/' + fixture.database + '?namedPlaceholders=true');
  await db.query(await readFile(resolve(configRoot, 'materialized_views/mv_repo_monthly_summary/ddl.sql'), 'utf8'));
  await db.query('INSERT INTO collection_items(repo_id,repo_name) VALUES (?,?)', [repo, 'fixture/project']);
  await db.query('INSERT INTO github_users(id,login,country_code,organization_formatted,stars_total) VALUES (?,?,?,?,0),(?,?,?,?,0)',
    [71031, 'fixture-commenter', 'DE', 'Comment Org', 71032, 'fixture-star', 'CA', 'Star Org']);
  await db.query('INSERT INTO mv_repo_pull_requests(repo_id,number) VALUES (?,11)', [repo]);
  const events = [
    ['IssueCommentEvent', 'created', 'fixture-commenter', 11],
    ['WatchEvent', 'started', 'fixture-star', 0],
    ['PullRequestEvent', 'opened', 'fixture-pr', 11],
    ['PullRequestEvent', 'opened', 'fixture-pr', 12],
    ['IssuesEvent', 'opened', 'fixture-issue-a', 21],
    ['IssuesEvent', 'opened', 'fixture-issue-a', 22],
    ['IssuesEvent', 'opened', 'fixture-issue-b', 23],
  ];
  for (const [type, action, login, number] of events) {
    await db.query(`INSERT INTO github_events(repo_id,org_id,type,action,actor_login,number,created_at,event_day,event_month,event_year)
      VALUES (?,1,?,?,?,?, '2024-01-12','2024-01-12','2024-01-01',2024)`, [repo,type,action,login,number]);
  }
});
afterAll(async () => {
  if (db) await db.end();
  await releaseTestDatabase();
});

test('role jobs populate their own views and preserve neighboring roles on replay', async () => {
  for (let pass = 0; pass < 2; pass++) {
    for (const job of ['countries_pr_commenter_role', 'organizations_pr_commenter_role', 'countries_stargazer_role'])
      await runPipeline('sync_org_repo_' + job);
    for (const [view, column, expected] of [
      ['countries_pr_commenter_role', 'country_code', ['DE']],
      ['organizations_pr_commenter_role', 'org_name', ['Comment Org']],
      ['countries_stargazer_role', 'country_code', ['CA']],
      ['countries_issue_commenter_role', 'country_code', []],
      ['organizations_issue_commenter_role', 'org_name', []],
      ['countries_pr_reviewer_role', 'country_code', []],
    ] as const) {
      const [rows] = await db.query<RowDataPacket[]>(`SELECT ${column} AS value FROM mv_repo_${view} WHERE repo_id=?`, [repo]);
      expect(rows.map(row => row.value)).toEqual(expected);
    }
  }
});

test('insert and replay retain separate monthly event and creator counts', async () => {
  for (let pass = 0; pass < 2; pass++) {
    await runPipeline('calc_collection_repo_monthly_summary');
    const [rows] = await db.query<RowDataPacket[]>(`SELECT stars,pull_requests,pull_request_creators,issues,issue_creators
      FROM mv_repo_monthly_summary WHERE repo_id=? AND month='2024-01-01'`, [repo]);
    expect(rows).toEqual([{stars: 1, pull_requests: 2, pull_request_creators: 1, issues: 3, issue_creators: 2}]);
  }
});
