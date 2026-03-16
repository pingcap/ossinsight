import fp from "fastify-plugin";
import * as fs from "fs";
import {DateTime} from "luxon";
import path from "path";
import {CronJob, Task} from "toad-scheduler";
import {PipelineJobStatus} from "../repositories/PipelineJobRepository";

export const PIPELINE_PROCESS_FILE = 'process.sql';
export const PIPELINE_CONFIG_FILE = 'config.json';

export interface Pipeline {
  name: string;
  processSQL: string;
}

export enum PresetIncrementalTimeRange {
  LAST_MONTH = 'last_month',
  PAST_MONTH = 'past_month',
  YESTERDAY = 'yesterday',
  LAST_DAY = 'last_day',
  LAST_HOUR = 'last_hour',
  PAST_24_HOURS = 'past_24_hours',
  PAST_HOUR = 'past_hour',
}

export interface PipelineIncrementalConfig {
  timeRange: PresetIncrementalTimeRange;
}

export interface PipelineConfig {
  name: string;
  description?: string;
  cron?: string;
  incremental?: PipelineIncrementalConfig;
}

declare module 'fastify' {
  interface FastifyInstance {
    pipelines: Record<string, Pipeline>;
  }
}

export const timezone = 'UTC';

export default fp(async (app) => {
  const dir = path.join(app.config.CONFIGS_PATH, 'pipelines');
  const names = fs.readdirSync(dir);
  app.decorate('pipelines', {});

  // Load all pipelines config.
  names
    .filter(name => fs.statSync(path.join(dir, name)).isDirectory())
    .filter(name => {
      return fs.existsSync(path.join(dir, name, PIPELINE_PROCESS_FILE)) && fs.existsSync(path.join(dir, name, PIPELINE_CONFIG_FILE))
    })
    .forEach(name => {
      // Load the pipeline config.
      const processSQL = fs.readFileSync(path.join(dir, name, PIPELINE_PROCESS_FILE), 'utf-8');
      const config = JSON.parse(fs.readFileSync(path.join(dir, name, PIPELINE_CONFIG_FILE), 'utf-8')) as PipelineConfig;
      app.pipelines[name] = {
        ...config,
        processSQL
      };

      // Add a cron job for task.
      if (config.cron) {
        // Define a task.
        const task = new Task(name, async (taskId) => {
          const pipeline = app.pipelines[name];

          // Notice: The default time range is yesterday.
          const { from, to } = resolveTimeRange(config.incremental?.timeRange);

          app.log.info(`⚡️ Start to execute query for pipeline <%s>, from: %s, to: %s.`, name, from.toISO(), to.toISO());
          const jobId = await app.pipelineJobRepository.createProcessedTimeRange(name, from, to, PipelineJobStatus.RUNNING);
          const start = DateTime.now();

          try {
            await app.mysql.execute(pipeline.processSQL, {
              from: from.toSQL(),
              to: to.toSQL()
            });
          } catch (err: any) {
            const end = DateTime.now();
            const duration = end.diff(start, 'seconds').seconds;
            await app.pipelineJobRepository.finishProcessedTimeRange(jobId, PipelineJobStatus.FAILED, err.message, duration);
            app.log.error(err, `❌  Failed to execute query for pipeline ${name}, from: ${from.toISO()}, to: ${to.toISO()}, duration: ${duration}s.`);
            return;
          }

          const end = DateTime.now();
          const duration = end.diff(start, 'seconds').seconds;
          await app.pipelineJobRepository.finishProcessedTimeRange(jobId, PipelineJobStatus.SUCCEED, 'Query OK!', duration);
          app.log.info(`✅  Finished the execute query for pipeline <%s>, from: %s, to: %s, duration: ${duration}s.`, name, from.toISO(), to.toISO(), duration);
        }, (err) => {
          app.log.error(err, `❌  Failed to execute the scheduled task of pipeline ${name}, error: ${err.message}.`);
        });

        app.scheduler.addCronJob(new CronJob({
          cronExpression: config.cron,
          timezone: timezone,
        }, task, {
          id: name,
          preventOverrun: true,
        }));
        app.log.info(`⏰ Add a cron job for pipeline ${name}, cron: ${config.cron}.`);
      }
    });
}, {
  name: '@ossinsight/pipelines',
  dependencies: [
    '@ossinsight/scheduler',
    '@ossinsight/tidb',
    '@ossinsight/pipeline-job-repository'
  ]
});

export interface TimeRange {
  from: DateTime;
  to: DateTime;
}

export function resolveTimeRange(timeRange: PresetIncrementalTimeRange = PresetIncrementalTimeRange.YESTERDAY): TimeRange {
  const now = DateTime.now();
  switch (timeRange) {
    case PresetIncrementalTimeRange.PAST_MONTH:
      return {
        from: now.minus({month: 1}),
        to: now
      };
    case PresetIncrementalTimeRange.LAST_MONTH:
      return {
        from: now.startOf('month').minus({ month: 1 }),
        to: now.startOf('month')
      };
    case PresetIncrementalTimeRange.PAST_HOUR:
      return {
        from: now.minus({hours: 1}),
        to: now
      };
    case PresetIncrementalTimeRange.PAST_24_HOURS:
      return {
        from: now.minus({hours: 24}),
        to: now
      }
    case PresetIncrementalTimeRange.LAST_HOUR:
      return {
        from: now.minus({hours: 1}).startOf('hour'),
        to: now.startOf('hour')
      }
    case PresetIncrementalTimeRange.LAST_DAY:
    case PresetIncrementalTimeRange.YESTERDAY:
    default:
      return {
        from: now.minus({days: 1}).startOf('day'),
        to: now.startOf('day')
      };
  }
}