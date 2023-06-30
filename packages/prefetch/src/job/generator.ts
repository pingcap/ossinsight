import {Params, QuerySchema, ConditionalRefreshCrons} from "@ossinsight/api-server";
import {DateTime, DurationLike} from "luxon";
import {Logger} from "pino";
import {DEFAULT_QUEUE_NAME} from "./scheduler";

export interface PrefetchJob {
  queryName: string;
  refreshQueue: string;
  refreshCron: string;
  params: {
    [key:string]: string;
  }
}

export type RefreshCron = string | ConditionalRefreshCrons;

/**
 * @class JobGenerator
 * @classdesc Responsible for generating jobs based on the query definition.
 */
export class JobGenerator {
  private offsetMap: Record<string, number> = {};

  constructor(
    private readonly logger: Logger,
    private presets: Record<string, string[]>,
    private queries: Record<string, QuerySchema>
  ) {
  }

  generate(queryName: string, onlyParams?: Record<string, any>): PrefetchJob[] {
    const queryJobs: PrefetchJob[] = [];
    const { params, refreshQueue = DEFAULT_QUEUE_NAME, refreshCron } = this.queries[queryName];
    const combines = this.calcAllParamCombines(params, onlyParams);

    this.logger.info(
      {
        cron: refreshCron
      },
      `📅 Schedule prefetch job <%s> in queue <%s> with %d params combines.`,
      queryName,refreshQueue, combines.length
    );

    for (const combine of combines) {
      // Resolve cron expression from query definition.
      const cron = this.resolveCrons(combine, refreshCron);
      if (!cron) {
        continue;
      }

      queryJobs.push({
        queryName: queryName,
        refreshQueue: refreshQueue,
        refreshCron: cron,
        params: combine
      })
    }

    return queryJobs;
  }

  private resolveCrons(params: any, crons?: RefreshCron): string | null {
    if (!crons) {
      return null;
    }

    if (typeof crons === "string") {
      return this.resolveCronExp(crons);
    }

    // Resolve conditional refresh cron.
    if (!params || !params[crons.param]) {
      return null;
    }
    const value = params[crons.param];
    for (const matcher in crons.on) {
      // Equals or matches
      if (value === matcher || (new RegExp(matcher)).test(value)) {
        return this.resolveCronExp(crons.on[matcher]);
      }
    }

    return null;
  }

  /**
   * @desc Resolve cron expression from query definition.
   *
   * Prefetch Cron expressions are based on UTC time.
   *
   * Because the query of prefetch is usually resource-sensitive, it is necessary
   * to avoid querying during peak hours when setting.
   *
   * Timezone table:
   *
   * | UTC    | PDT    | JST    |
   * | ------ | ------ | ------ |
   * | 07:00  | 00:00  | 16:00  |
   * | 08:00  | 01:00  | 17:00  | ⬅ @trending-repos
   * | 09:00  | 02:00  | 18:00  |
   * | 10:00  | 03:00  | 19:00  |
   * | 11:00  | 04:00  | 20:00  | ⬅ @collection-daily, @collection-monthly
   * | 12:00  | 05:00  | 21:00  | ⬅ @weekly
   * | 13:00  | 06:00  | 22:00  | ⬅ @monthly
   *
   * @param cron
   * @private
   */
  private resolveCronExp(cron: string): string | null {
    this.offsetMap[cron] = (this.offsetMap[cron] || 0) + 1;

    switch (cron) {
      case '@once':
        return null;
      case '@hourly':
        const hourlyInterval = { minutes: this.offsetMap[cron] };
        const hourlyOffset = this.getCronOffset(cron, '2006-01-01 00:00:00', hourlyInterval);
        return `10 ${hourlyOffset.minute || 0} */1 * * *`;
      case '@daily':
        const trendingInterval = { minutes: this.offsetMap[cron] * 2 };
        const trendingOffset = this.getCronOffset(cron, '2006-01-01 00:08:00', trendingInterval);
        return `20 ${trendingOffset.minute || 0} ${trendingOffset.hour || 8} * * *`;
      case '@collection-daily':
        const collectionInterval = { second: this.offsetMap[cron] * 10 };
        const collectionOffset = this.getCronOffset(cron, '2006-01-01 00:11:00', collectionInterval);
        return `${collectionOffset.second || 0} ${collectionOffset.minute || 0} ${collectionOffset.hour || 11} * * *`;
      case '@collection-monthly':
        const collectionMonthlyInterval = { second: this.offsetMap[cron] * 20 };
        const collectionMonthlyOffset = this.getCronOffset(cron, '2006-01-01 00:11:00', collectionMonthlyInterval);
        return `${collectionMonthlyOffset.second || 0} ${collectionMonthlyOffset.minute || 0} ${collectionMonthlyOffset.hour || 11} 1 * *`;
      case '@weekly':
        const weeklyInterval = { minute: this.offsetMap[cron] };
        const weeklyOffset = this.getCronOffset(cron, '2006-01-01 00:12:00', weeklyInterval);
        return `30 ${weeklyOffset.minute || 0} ${weeklyOffset.hour || 12} * * 1`;
      case '@monthly':
        const monthlyInterval = { minute: this.offsetMap[cron] };
        const monthlyOffset = this.getCronOffset(cron, '2006-01-01 00:13:00', monthlyInterval);
        return `40 ${monthlyOffset.minute || 0} ${monthlyOffset.hour || 13} 1 * *`;
      case '@yearly':
        return `0 0 6 1 1 *`;
      default:
        return cron;
    }
  }

  private getCronOffset(bucket: string, time: string, interval: DurationLike) {
    const originalTime = DateTime.fromSQL(time, { setZone: false });
    const newTime = originalTime.plus(interval);
    return newTime.toObject();
  }


  /**
   * @desc Calculate all possible parameter combinations.
   * @param params
   * @param onlyParams
   * @private
   */
  private calcAllParamCombines(params: Params[], onlyParams: Record<string, any> = {}) {
    if (params.length === 0) {
      return [{}];
    }

    return params.reduce((result: Record<string, any>[], param: Params) => {
      const key = param.name
      const enums = param.enums
      let options: any[] = [];

      if (onlyParams[key]) {
        options.push(onlyParams[key]);
      } else {
        if (typeof enums === 'string') {
          options = this.presets[enums];
        } else if (enums) {
          options = enums;
        }
      }

      return options.reduce((acc: any[], value: string) => {
        if (!result.length) {
          return acc.concat({[key]: value});
        }
        return acc.concat(
          result.map(ele => (
            Object.assign({}, ele, {[key]: value})
          ))
        );
      }, []);
    }, []);
  }

}