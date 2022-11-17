import { FastifyPluginAsync } from 'fastify';

interface IParams {
  name: string;
}
const getJobByNameHandler: FastifyPluginAsync = async (
  app,
  opts,
): Promise<void> => {
  app.get<{
    Params: IParams;
  }>('/', async function (req, reply) {
    const { name } = req.params;
    const job = app.cron.getJobByName(name);
    if (!job) {
      void reply.status(404).send({
        message: `Job ${name} not found.`,
      });
      return;
    }
    const parameters = app.jobParameters.get(name) ?? {};
    const statuses = app.jobStatuses.get(name) ?? {};
    void reply.send({
      name: job?.name,
      running: job?.running,
      lastDate: job?.lastDate(),
      parameters,
      statuses,
    });
  });
};

export default getJobByNameHandler;
