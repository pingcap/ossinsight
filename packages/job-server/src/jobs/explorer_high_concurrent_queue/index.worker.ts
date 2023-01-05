import {Job, WorkerOptions} from 'bullmq';
import {FastifyInstance} from "fastify";
import {Question} from "@ossinsight/api-server";
import {DateTime} from "luxon";

export default async (
    app: FastifyInstance,
    job: Job<Question, any, string>
) => {
  const logger = app.log.child({ queue: "high" });
  if (!job.data) {
    logger.warn("No job data provided");
    return;
  }

  const question = job.data as Question;
  const { id: questionId, title, querySQL } = question;
  const conn = await app.mysql.getConnection();

  try {
    logger.info({ questionId, querySQL }, "Resolving question: %s", title);
    const start = DateTime.now();
    await app.explorerService.resolveQuestion(conn, job, question);
    const end = DateTime.now();
    logger.info({ questionId }, "Resolved question: %s, cost: %s", title, end.diff(start).toFormat("hh:mm:ss.SSS"));
  } catch (err: any) {
    logger.error(err, `Failed to resolve the question ${questionId}: ${err.message}`);
  } finally {
    await conn.release();
  }
};

export const workerConfig: WorkerOptions = {
  autorun: true,
  concurrency: 10,
};