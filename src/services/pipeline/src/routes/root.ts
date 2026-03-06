import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get('/', async function (request, reply) {
    return { root: true }
  })
}

export default root;
