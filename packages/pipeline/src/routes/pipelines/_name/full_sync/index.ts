import {FastifyBaseLogger, FastifyPluginAsync} from 'fastify';
import {DateTime, DurationLike} from 'luxon';
import {APIError} from '../../../../errors';
import type {Pipeline} from '../../../../plugins/pipelines';
import {PipelineJobRepository} from '../../../../plugins/repositories/PipelineJobRepository';
import {splitTimeRange, TimeRange} from '../../../../utils/time';

interface IBody { from?: string; to?: string; interval?: DurationLike }
const units = ['year', 'years', 'quarter', 'quarters', 'month', 'months', 'week', 'weeks', 'day', 'days', 'hour', 'hours', 'minute', 'minutes', 'second', 'seconds'];
export const schema = {
  params: {type: 'object', required: ['name'], additionalProperties: false,
    properties: {name: {type: 'string', maxLength: 100, pattern: '^[a-z0-9][a-z0-9_-]*$'}}},
  body: {type: 'object', additionalProperties: false, properties: {
    from: {type: 'string', maxLength: 35}, to: {type: 'string', maxLength: 35},
    interval: {type: 'object', minProperties: 1, maxProperties: 1, additionalProperties: false,
      properties: Object.fromEntries(units.map(unit => [unit, {type: 'integer', minimum: 1, maximum: 10000}])), default: {day: 1}},
  }},
};

const index: FastifyPluginAsync = async app => {
  const active = new Set<string>();
  app.post<{Params: {name: string}; Body: IBody}>('/', {schema}, async (request, reply) => {
    const name = request.params.name;
    if (!Object.prototype.hasOwnProperty.call(app.pipelines, name)) throw new APIError(404, 'Pipeline not found.');
    const pipeline = app.pipelines[name];
    if (!/:from\b/.test(pipeline.processSQL) || !/:to\b/.test(pipeline.processSQL)) {
      throw new APIError(400, 'This pipeline does not support historical backfill.');
    }
    if (active.has(name)) throw new APIError(409, 'A full sync for this pipeline is already active.');
    const {from, to, interval = {day: 1}} = request.body;
    let ranges: TimeRange[];
    try {
      ranges = splitTimeRange(from ? DateTime.fromISO(from, {zone: 'utc'}) : DateTime.utc(2012, 1, 1),
        to ? DateTime.fromISO(to, {zone: 'utc'}) : DateTime.utc().startOf('day'), interval);
    } catch { throw new APIError(400, 'Invalid time range or interval.'); }
    const audit = {actor: request.operatorActor, requestId: request.id, pipelineName: name};
    active.add(name);
    void fullSyncPipeline(app.log, app.pipelineJobRepository, name, pipeline, ranges, audit)
      .catch(() => app.log.error({...audit, event: 'pipeline_backfill_failed'}))
      .finally(() => active.delete(name));
    return reply.code(202).send({ok: true, message: 'Full sync accepted.', ranges: ranges.length});
  });
};

export async function fullSyncPipeline(log: FastifyBaseLogger, repository: PipelineJobRepository,
  name: string, pipeline: Pipeline, ranges: TimeRange[], audit: Record<string, unknown> = {}) {
  const processed = await repository.getProcessedTimeRanges(name, ranges[0].tFrom, ranges[ranges.length - 1].tTo);
  const key = (range: TimeRange) => `${range.tFrom.toMillis()}:${range.tTo.toMillis()}`;
  const completed = new Set(processed.map(key));
  let executed = 0;
  for (const range of ranges) {
    if (completed.has(key(range))) continue;
    if (await repository.executeRange(name, range.tFrom, range.tTo, pipeline.processSQL)) executed++;
  }
  log.info({...audit, event: 'pipeline_backfill_completed', pipelineName: name, executed, requested: ranges.length});
}

export default index;
