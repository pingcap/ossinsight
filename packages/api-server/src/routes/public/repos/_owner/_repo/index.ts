import {FastifyPluginAsync} from "fastify";
import {APIError} from "../../../../../utils/error";

type IQueryString = Record<string, any>;

interface IParams {
  owner: string;
  repo: string;
}

const schema = {
  querystring: {
    type: 'object',
    properties: {},
    additionalProperties: true
  } as const,
  params: {
    type: 'object',
    required: ['owner', 'repo'],
    properties: {
      owner: {
        type: 'string',
        description: 'The owner of the repo.'
      },
      repo: {
        type: 'string',
        description: 'The name of the repo.'
      }
    }
  }
};

// TODO: remove the handler after Data Service supports path parameters.
const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  app.get<{
    Querystring: IQueryString,
    Params: IParams
  }>('/*', { schema }, async function (req, reply) {
    if (!app.tidbDataService) {
      throw new APIError(500, 'TiDB data service is not initialized.');
    }

    // Mapping the request path parameters to query string parameters.
    const { owner, repo } = req.params;
    const hasQueryString = Object.keys(req.query).length > 0;
    let url = req.url.replace(`/public/repos/${owner}/${repo}/`, '/repos/');
    if (!hasQueryString) {
      url += `?owner=${owner}&repo=${repo}`;
    } else {
      url += `&owner=${owner}&repo=${repo}`;
    }

    // Retrieve query result from TiDB data service.
    const res = await app.tidbDataService.request(url);
    const json = await res.json();
    reply
      .code(res.status)
      .headers(res.headers)
      .send(json);
  })
}

export default queryHandler;
