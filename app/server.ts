import Router from "koa-router";
import Query from "./core/Query";
import {MysqlQueryExecutor} from "./core/MysqlQueryExecutor";
import {DefaultState} from "koa";
import type {ContextExtends} from "../index";
import GhExecutor from "./core/GhExecutor";
import {createClient} from "redis";

export default async function server(router: Router<DefaultState, ContextExtends>) {

  const redisClient = createClient({
    url: process.env.REDIS_URL
  });
  await redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();

  const executor = new MysqlQueryExecutor({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(process.env.CONNECTION_LIMIT || '10'),
    queueLimit: parseInt(process.env.QUEUE_LIMIT || '20'),
  })
  const tokens = (process.env.GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ghExecutor = new GhExecutor(tokens, redisClient)

  router.get('/q/:query', async ctx => {
    const query = new Query(ctx.params.query, redisClient, executor)
    try {
      const res = await query.run(ctx.query)
      ctx.response.status = 200
      ctx.response.body = res
    } catch (e) {
      ctx.logger.error('request failed %s', ctx.request.originalUrl, e)
      ctx.response.status = 500
      ctx.response.body = e
    }
  })

  router.get('/gh/repo/:owner/:repo', async ctx => {
    const { owner, repo } = ctx.params
    try {
      const res = await ghExecutor.getRepo(owner, repo)

      ctx.response.status = 200
      ctx.response.body = res
    } catch (e: any) {

      ctx.logger.error('request failed %s', ctx.request.originalUrl, e)
      ctx.response.status = e?.response?.status ?? e?.status ?? 500
      ctx.response.body = e?.response?.data ?? e?.message ?? String(e)
    }
  })

  router.get('/gh/repos/search', async ctx => {
    const { keyword } = ctx.query;

    try {
      if (keyword == null || keyword.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = "keyword can not be empty.";
        return
      }

      const res = await ghExecutor.searchRepos(keyword)

      ctx.response.status = 200
      ctx.response.body = res
    } catch (e: any) {

      ctx.logger.error('request failed %s', ctx.request.originalUrl, e)
      ctx.response.status = e?.response?.status ?? e?.status ?? 500
      ctx.response.body = e?.response?.data ?? e?.message ?? String(e)
    }
  })

}
