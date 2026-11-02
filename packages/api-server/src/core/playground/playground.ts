import { BadParamsError } from '../runner/query/QueryParser';
import { enforceSQLPolicy, positiveId } from './sql-policy';

export class SqlParser {
  constructor(private readonly type: 'repo' | 'user', private readonly id: string, private readonly sql: string) {}

  public sqlify(): string {
    if (this.type !== 'repo' && this.type !== 'user') {
      throw new BadParamsError('playground', 'Invalid scope type');
    }
    return enforceSQLPolicy(this.sql, {
      scope: { field: this.type === 'repo' ? 'repo_id' : 'actor_id', id: positiveId(this.id) },
      maxRows: 100,
    });
  }
}
