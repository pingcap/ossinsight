import {
  CALC_REPO_MILESTONES_JOB_NAME,
  calcRepoMilestoneJobHandler,
} from '../../../jobs/calc-repo-milestones';
import {
  SEND_REPO_FEEDS_EMAILS_JOB_NAME,
  sendRepoFeedsEmailsJobHandler,
} from '../../../jobs/send-repo-feeds-emails';

import { DateTime } from 'luxon';
import { FastifyPluginAsync } from 'fastify';
import { JobHandler } from '../../../types/index';

interface IBody {
  name: string;
  parameters: Record<string, any>;
}

const handlers: Record<string, JobHandler> = {
  [CALC_REPO_MILESTONES_JOB_NAME]: calcRepoMilestoneJobHandler,
  [SEND_REPO_FEEDS_EMAILS_JOB_NAME]: sendRepoFeedsEmailsJobHandler,
};

const triggerJobHandler: FastifyPluginAsync = async (app): Promise<void> => {
  app.post<{
    Body: IBody;
  }>('/', async function (req, reply) {
    const { name, parameters = {} } = req.body;
    const handler = handlers[name];
    if (!handler) {
      await reply.status(404).send({
        message: `Job named ${name} not found.`,
      });
    }

    const newJobName = `${name}-${DateTime.now().toMillis()}`;
    const newJob = app.cron.createJob({
      name: newJobName,
      cronTime: DateTime.now().plus({ seconds: 3 }).toJSDate(),
      onTick: async function (server) {
        server.jobParameters.set(newJobName, parameters);
        server.jobStatuses.set(newJobName, {});
        await handler.bind(this)(newJobName, server);
      },
      onComplete: async (server) => {
        // Clear job parameters and statuses.
        if (server.jobParameters.has(newJobName)) {
          server.jobParameters.delete(newJobName);
        }
        if (server.jobStatuses.has(newJobName)) {
          server.jobStatuses.delete(newJobName);
        }
        const job = server.cron.getJobByName(newJobName);
        job?.stop();
        server.log.info('Job %s completed.', newJobName);
      },
      runOnInit: true,
    });

    await reply.send({
      name: newJob.name,
      running: newJob.running,
      lastDate: newJob.lastDate(),
      parameters: parameters || {},
    });
  });
};

export default triggerJobHandler;
