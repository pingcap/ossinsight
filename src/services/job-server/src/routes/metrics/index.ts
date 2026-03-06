import {FastifyPluginAsync} from "fastify";
import {register} from "../../metrics";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    reply.type(register.contentType).send(await register.metrics());
  })
}

export default root;
