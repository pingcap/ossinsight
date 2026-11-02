import { validateAnalyticsGrants } from '../../src/core/playground/database-policy';

test('permits only table-specific public-data SELECT grants', () => {
  expect(() => validateAnalyticsGrants('analytics', [
    "GRANT USAGE ON *.* TO 'reader'@'%'",
    "GRANT SELECT ON `analytics`.`github_events` TO 'reader'@'%'",
    "GRANT SELECT ON analytics.github_repos TO 'reader'@'%'",
  ])).not.toThrow();
});
test.each([
  "GRANT ALL PRIVILEGES ON *.* TO 'reader'@'%'",
  "GRANT SELECT, INSERT ON analytics.github_events TO 'reader'@'%'",
  "GRANT SELECT ON analytics.* TO 'reader'@'%'",
  "GRANT SELECT ON analytics.sys_users TO 'reader'@'%'",
  "GRANT SELECT ON other.github_events TO 'reader'@'%'",
  "GRANT SELECT ON analytics.github_events TO 'reader'@'%' WITH GRANT OPTION",
  "GRANT 'administrator'@'%' TO 'reader'@'%'",
])('refuses overprivileged credentials: %s', grant => {
  expect(() => validateAnalyticsGrants('analytics',[grant])).toThrow();
});
