import { PUBLIC_ANALYTICS_TABLES } from './sql-policy';

/** Fail startup if the generated-SQL account can read app data or write data. */
export function validateAnalyticsGrants(database: string, grants: string[]): void {
  const identifier = '(\\*|`(?:``|[^`])+`|[A-Za-z0-9_]+)';
  const pattern = new RegExp(`^GRANT (USAGE|SELECT) ON ${identifier}\\.${identifier} TO .+$`, 'i');
  const unquote = (value: string) => value.replace(/^`|`$/g, '').replace(/``/g, '`');
  let hasSelect = false;
  for (const grant of grants) {
    const match = pattern.exec(grant);
    if (!match || /WITH GRANT OPTION/i.test(grant)) {
      throw new Error('Analytics credentials must have direct SELECT-only table grants, without roles or delegation');
    }
    const [, privilege, schema, table] = match;
    if (privilege.toUpperCase() === 'USAGE' && schema === '*' && table === '*') continue;
    if (privilege.toUpperCase() !== 'SELECT' || unquote(schema) !== database ||
        !PUBLIC_ANALYTICS_TABLES.has(unquote(table))) {
      throw new Error('Analytics credentials may read only the approved public tables in the configured database');
    }
    hasSelect = true;
  }
  if (!hasSelect) throw new Error('Analytics credentials have no public table SELECT grants');
}
