import { TiDBQueryExecutor } from "../core/TiDBQueryExecutor";
import { CachedData } from "../core/cache/Cache";
import { dataQueryTimer, measure, tidbQueryCounter } from "../metrics";
import { DateTime } from "luxon";
import CacheBuilder, { CacheProviderTypes } from "../core/cache/CacheBuilder";

interface UserItem {
  login: string;
  company: string;
}

export class BadParamsError extends Error {
  readonly msg: string
  constructor(public readonly name: string, message: string) {
    super(message);
    this.msg = message
  }
}

export default class UserService {

  constructor(
    readonly executor: TiDBQueryExecutor,
    public readonly cacheBuilder: CacheBuilder,
  ) {
  }

  async getCompanyEmployees(companyName: string): Promise<CachedData<UserItem[]>> {
    const cacheKey = `company:employees:${companyName}`;
    const cache = this.cacheBuilder.build(
      CacheProviderTypes.CACHED_TABLE, cacheKey, 1, false, true
    );

    const companyKey = companyName.toString()
    if (!/^[^"%_]+$/.test(companyKey)) {
      throw new BadParamsError('company name', 'bad param: ' + companyKey)
    }

    return cache.load(async () => {
      return await measure(dataQueryTimer, async () => {
        const sql = `
          SELECT login, company FROM users WHERE LOWER(company) LIKE CONCAT('%', LOWER('${companyKey}'), '%')
        `;

        try {
          const start = DateTime.now();
          const [rows, fields] = await this.executor.execute(cacheKey, sql);
          const end = DateTime.now();
          return {
            params: {},
            requestedAt: start,
            finishedAt: end,
            spent: end.diff(start).as('seconds'),
            sql,
            fields: fields,
            data: rows
          }
        } catch (e: any) {
          e.sql = sql
          throw e
        }
      })
    });
  }

}
