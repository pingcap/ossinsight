import {MySQLPromisePool} from "@fastify/mysql";
import {FastifyBaseLogger, FastifyPluginAsync} from 'fastify'
import {DateTime, DurationLike} from "luxon";
import {APIError} from "../../../../errors";
import {Pipeline} from "../../../../plugins/pipelines";
import {PipelineJobRepository, PipelineJobStatus} from "../../../../plugins/repositories/PipelineJobRepository";
import {splitTimeRange} from "../../../../utils/time";

export interface IParams {
  name: string;
}

export interface IBody {
  from?: string;
  to?: string;
  interval: DurationLike;
}

export const schema = {
  params: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string'
      }
    }
  } as const,
  body: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
      },
      to: {
        type: 'string',
      },
      interval: {
        type: 'object',
        default: {
          day: 1
        },
      }
    }
  }
}

const index: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.post<{
    Params: IParams,
    Body: IBody
  }>('/', {
    schema
  }, async (req, reply) => {
    const pipelineName = req.params.name;
    const pipeline = app.pipelines[pipelineName];
    if (!pipeline) {
      throw new APIError(404, 'Pipeline not found.')
    }

    const {from, to, interval} = req.body;
    const specifiedFrom = from ? DateTime.fromISO(from) : undefined;
    const specifiedTo = to ? DateTime.fromISO(to) : undefined;

    fullSyncPipeline(app.log, app.mysql, app.pipelineJobRepository, pipelineName, pipeline, specifiedFrom, specifiedTo, interval).catch((err) => {
      app.log.error(err, `❌  Failed to finish full sync for pipeline <${pipelineName}>.`);
    });

    return {
      ok: true,
      message: 'Trigger success!'
    }
  });
}


async function fullSyncPipeline(
  log: FastifyBaseLogger, tidb: MySQLPromisePool, pipelineJobRepository: PipelineJobRepository, pipelineName: string, pipeline: Pipeline,
  from: DateTime = DateTime.fromSQL('2012-01-01'),
  to: DateTime = DateTime.fromSQL(DateTime.utc().toFormat('yyyy-MM-dd')),
  interval: DurationLike = {day: 1}
) {
  // Get the time ranges need to sync.
  const needProcessed = splitTimeRange(from, to, interval);
  const processed = await pipelineJobRepository.getProcessedTimeRanges(pipelineName, from, to);
  const timeRanges = needProcessed.filter((needProcessedTimeRange) => {
    return !processed.find((processedTimeRange) => {
      return needProcessedTimeRange.tTo === processedTimeRange.tTo && needProcessedTimeRange.tFrom === processedTimeRange.tFrom;
    });
  });
  log.info(`🚀 Starting the full sync for pipeline <${pipelineName}>, processed: ${processed.length}/${needProcessed.length}.`);

  // Sync range by range.
  let success = 0;
  let fail = 0;

  for (const { tFrom, tTo } of timeRanges) {
    log.info(`⚡️ Start to execute query for pipeline <${pipelineName}>, from: ${tFrom}, to: ${tTo}.`);
    const jobId = await pipelineJobRepository.createProcessedTimeRange(pipelineName, tFrom, tTo, PipelineJobStatus.RUNNING);
    const startAt = DateTime.now();

    try {
      /**
       * Notice:
       *
       * If the SQL mode of the current session is strict
       * (which means the sql_mode value contains either STRICT_TRANS_TABLES or STRICT_ALL_TABLES),
       * the SELECT subquery in INSERT INTO SELECT cannot be pushed down to TiFlash.
       *
       * Reference: https://docs.pingcap.com/zh/tidb/v7.1/tiflash-results-materialization
       */
      await tidb.execute(`SET SQL_MODE = 'ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';`);
      await tidb.execute(pipeline.processSQL, {
        from: tFrom.toSQL(),
        to: tTo.toSQL()
      });
    } catch (err: any) {
      const endAt = DateTime.now();
      const duration = endAt.diff(startAt , 'seconds').seconds;
      fail++;
      await pipelineJobRepository.finishProcessedTimeRange(jobId, PipelineJobStatus.FAILED, err.message, duration);
      log.error(err, `❌  Failed to execute query for pipeline <${pipelineName}>, from: ${tFrom}, to: ${tTo}, duration: ${duration} s.`);
      return;
    }

    const endAt = DateTime.now();
    const duration = endAt.diff(startAt , 'seconds').seconds;
    success++;
    await pipelineJobRepository.finishProcessedTimeRange(jobId, PipelineJobStatus.SUCCEED, 'Query OK!', duration);
    log.info(`✅  Finished to execute query for pipeline <%s>, from: %s, to: %s, duration: %d s.`, pipelineName, tFrom.toISO(), tTo.toISO(), duration);
  }

  log.info(`🎉 Finished full sync for pipeline <${pipelineName}>, success: ${success}, fail: ${fail}, process: ${success + processed.length}/${needProcessed.length}.`)
}

export default index;
