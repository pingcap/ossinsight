import Router from "koa-router";
import Query from "./core/Query";
import {DefaultState} from "koa";
import type {ContextExtends} from "../index";
import {register} from "prom-client";
import {measureRequests} from "./middlewares/measureRequests";
import { Socket, Server } from "socket.io";
import { Consola } from "consola";
import { TiDBQueryExecutor } from "./core/TiDBQueryExecutor";
import CacheBuilder from "./core/cache/CacheBuilder";
import GhExecutor from "./core/GhExecutor";
import CollectionService from "./services/CollectionService";
import UserService from "./services/UserService";
import GHEventService from "./services/GHEventService";

export default async function httpServerRoutes(
  router: Router<DefaultState, ContextExtends>,
  queryExecutor: TiDBQueryExecutor,
  cacheBuilder: CacheBuilder,
  ghExecutor: GhExecutor,
  collectionService: CollectionService,
  userService: UserService,
  ghEventService: GHEventService
) {

  router.get('/q/:query', measureRequests({ urlLabel: 'path' }), async ctx => {
    try {
      const query = new Query(ctx.params.query, cacheBuilder, queryExecutor, ghEventService, collectionService, userService)
      const res = await query.run(ctx.query, false, null, ctx.request.ip, true)
      ctx.response.status = 200
      ctx.response.body = res
    } catch (e) {
      ctx.logger.error('Failed to request %s: ', ctx.request.originalUrl, e)
      ctx.response.status = 500
      ctx.response.body = e
    }
  })

  router.get('/q/explain/:query', measureRequests({ urlLabel: 'path' }), async ctx => {
    try {
      const query = new Query(ctx.params.query, cacheBuilder, queryExecutor, ghEventService, collectionService, userService)
      const res = await query.explain(ctx.query)
      ctx.response.status = 200
      ctx.response.body = res
    } catch (e) {
      ctx.logger.error('Failed to request %s: ', ctx.request.originalUrl, e)
      ctx.response.status = 500
      ctx.response.body = e
    }
  })

  router.get('/collections', measureRequests({ urlLabel: 'path' }), async ctx => {
    try {
      const res = await collectionService.getCollections();
      ctx.response.status = 200
      ctx.response.body = res
    } catch (e) {
      ctx.logger.error('Failed to request %s: ', ctx.request.originalUrl, e)
      ctx.response.status = 500
      ctx.response.body = e
    }
  })

  router.get('/collections/:collectionId', measureRequests({ urlLabel: 'path' }), async ctx => {
    const { collectionId } = ctx.params
    try {
      const res = await collectionService.getCollectionRepos(parseInt(collectionId));
      ctx.response.status = 200
      ctx.response.body = res
    } catch (e) {
      ctx.logger.error('Failed to request %s: ', ctx.request.originalUrl, e)
      ctx.response.status = 500
      ctx.response.body = e
    }
  })

  // qo means query options.
  router.get('/qo/repos/groups/osdb', measureRequests({ urlLabel: 'path' }), async ctx => {
    try {
      const res = await collectionService.getOSDBRepoGroups();

      ctx.response.status = 200
      if (ctx.query.format === 'global_variable') {
        ctx.type = 'text/javascript'
        ctx.response.body = `var osdbgroup = (${JSON.stringify(res)});`
      } else {
        ctx.response.body = res
      }
    } catch (e: any) {
      ctx.logger.error('request failed %s', ctx.request.originalUrl, e)
      ctx.response.status = e?.response?.status ?? e?.status ?? 500
      ctx.response.body = e?.response?.data ?? e?.message ?? String(e)
    }
  })

  router.get('/gh/repo/:owner/:repo', measureRequests({ urlLabel: 'route' }), async ctx => {
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

  router.get('/gh/repos/search', measureRequests({ urlLabel: 'path' }), async ctx => {
    const { keyword } = ctx.query;

    try {
      if (keyword == null || keyword.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = "keyword can not be empty.";
        return
      }

      const res = await ghExecutor.searchRepos(String(keyword))

      ctx.response.status = 200
      ctx.response.body = res
    } catch (e: any) {
      ctx.logger.error('request failed %s', ctx.request.originalUrl, e)
      ctx.response.status = e?.response?.status ?? e?.status ?? 500
      ctx.response.body = e?.response?.data ?? e?.message ?? String(e)
    }
  })

  router.get('/gh/users/search', measureRequests({ urlLabel: 'path' }), async ctx => {
    const { keyword, type } = ctx.query as any;

    try {
      if (keyword == null || keyword.length === 0) {
        ctx.response.status = 400;
        ctx.response.body = "keyword can not be empty.";
        return
      }

      const res = await ghExecutor.searchUsers(String(keyword), type)

      ctx.response.status = 200
      ctx.response.body = res
    } catch (e: any) {
      ctx.logger.error('request failed %s', ctx.request.originalUrl, e)
      ctx.response.status = e?.response?.status ?? e?.status ?? 500
      ctx.response.body = e?.response?.data ?? e?.message ?? String(e)
    }
  })

  router.get('/metrics', async ctx => {
    ctx.body = await register.metrics()
  })

  router.get('/metrics/:name', async ctx => {
    ctx.body = await register.getSingleMetricAsString(ctx.params.name)
  })
}

export function socketServerRoutes(
  socket: Socket, io: Server, logger: Consola, queryExecutor: TiDBQueryExecutor, cacheBuilder: CacheBuilder, 
  collectionService: CollectionService, userService: UserService, ghEventService: GHEventService
) {
  // queryMsg example 1: events-increment?ts=1662519722
  // queryMsg example 2: events-increment-list
  // queryMsg example 3: events-total
  // queryMsg example 4: events-increment-intervals
  // Same with `/q/:query` in http router.
  socket.on("query", async (queryMsg: string) => {
    try {
      const queryType = queryMsg.split("?")[0];
      const searchString = queryMsg.split("?").pop() || "";
      const search = new URLSearchParams(searchString);
      const searchMap = [...search.keys()].reduce<{ [key: string]: string }>(
        (prev, item) => {
          prev[item] = search.get(item) as string;
          return prev;
        },
        {}
      );
      const q = new Query(
        queryType,
        cacheBuilder,
        queryExecutor,
        ghEventService,
        collectionService,
        userService
      );
      const res = await q.run(
        searchMap,
        false,
        null,
        socket.handshake.address,
        true
      );
      socket.emit(queryType, res);
    } catch (error) {
      logger.error("Failed to request %s[ws]: ", queryMsg, error);
    }
  });
}