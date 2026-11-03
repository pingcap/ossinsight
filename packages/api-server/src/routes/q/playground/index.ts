import { FastifyPluginAsync } from 'fastify';
import { SqlParser } from '../../../core/playground/playground';

const root: FastifyPluginAsync = async (app, opts) => {
  app.post<{
    Body: {
      sql: string,
      type: 'repo' | 'user',
      id: string,
    }
  }>('/', {
    preValidation: app.authenticate,
    config: {rateLimit: {max: 60, timeWindow: '1 minute'}},
    schema: {body: {
      type: 'object', additionalProperties: false, required: ['sql', 'type', 'id'],
      properties: {
        sql: {type: 'string', minLength: 1, maxLength: 20000},
        type: {type: 'string', enum: ['repo', 'user']},
        id: {type: 'string', pattern: '^[1-9][0-9]{0,15}$'},
      },
    }},
  }, async (request, reply) => {
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
