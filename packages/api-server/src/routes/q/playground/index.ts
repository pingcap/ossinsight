import { FastifyPluginAsync } from 'fastify';
import { SqlParser } from '../../../core/playground/playground';

const root: FastifyPluginAsync = async (app, opts) => {
  app.post<{
    Body: {
      sql: string,
      type: 'repo' | 'user',
      id: string,
    }
  }>('/', async (request, reply) => {
    const {
      sql: sqlString,
      type,
      id,
    } = request.body;
    const sqlParser = new SqlParser(type, id, sqlString);
    const sql = sqlParser.sqlify();
    const res = await app.sqlRunner.run(sql);
    reply.send(res);
  });
};

export default root;
