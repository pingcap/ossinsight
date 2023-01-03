import {Job, WorkerOptions} from 'bullmq';
import {FastifyInstance} from "fastify";
import {Question} from "@ossinsight/api-server";

export default async (
    app: FastifyInstance,
    job: Job<Question, any, string>
) => {
  if (!job.data) {
    app.log.warn("No job data provided");
    return;
  }

  const question = job.data as Question;
  const conn = await app.mysql.getConnection();

  try {
    await app.explorerService.resolveQuestion(conn, job, question);
  } finally {
    conn.release();
  }
};

export const workerConfig: WorkerOptions = {
  autorun: true,
  concurrency: 2,
};