import { FastifyPluginAsync } from 'fastify';
import { Job } from 'fastify-cron';

const jobListHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get('/', async function (req, reply) {
    const jobs = app.cron.jobs.map((job: Job) => {
      return {
        name: job.name,
        running: job.running,
        lastDate: job.lastDate(),
      };
    });
    void reply.send(jobs);
  });
};

export default jobListHandler;
