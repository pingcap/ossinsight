import Router from "koa-router";
import Query, { SimpleQuery } from "./core/Query";
import { DefaultState } from "koa";
import koaBody from "koa-body";
import type {ContextExtends} from "../index";
import {register} from "prom-client";
import {measureRequests, URLType} from "./middlewares/measureRequests";
import { Socket, Server } from "socket.io";
import { Consola } from "consola";
import { TiDBQueryExecutor, TiDBPlaygroundQueryExecutor } from "./core/TiDBQueryExecutor";
import CacheBuilder from "./core/cache/CacheBuilder";
import GhExecutor from "./core/GhExecutor";
import CollectionService from "./services/CollectionService";
import UserService from "./services/UserService";
import GHEventService from "./services/GHEventService";
import StatsService from "./services/StatsService";
import { BatchLoader } from "./core/BatchLoader";
import { SqlParser } from "./utils/playground";
import { toCompactFormat } from "./utils/compact";

export default async function httpServerRoutes(
  router: Router<DefaultState, ContextExtends>,
  queryExecutor: TiDBQueryExecutor,
  playgroundQueryExecutor: TiDBPlaygroundQueryExecutor,
  cacheBuilder: CacheBuilder,
  ghExecutor: GhExecutor,
  collectionService: CollectionService,
  userService: UserService,
  ghEventService: GHEventService,
  statsService: StatsService,
  accessRecorder: BatchLoader
) {

  router.get('/q/explain/:query(.*)', measureRequests(URLType.PATH, accessRecorder), async ctx => {
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

  router.get('/q/:query(.*)', measureRequests(URLType.PATH, accessRecorder), async ctx => {
    try {
      const queryName = ctx.params.query;
      const query = new Query(
        queryName, cacheBuilder, queryExecutor, ghEventService,
        collectionService, userService
      )
      const res: any = await query.execute(ctx.query, false, ctx.request.ip);
      const { sql, requestedAt, refresh } = res;
      statsService.addQueryStatsRecord(queryName, sql, requestedAt, refresh);

      ctx.response.status = 200
      ctx.response.body = res
    } catch (e) {
      ctx.logger.error('Failed to request %s: ', ctx.request.originalUrl, e)
      ctx.response.status = 500
      ctx.response.body = e
    }
  })

  router.get('/collections', measureRequests(URLType.PATH, accessRecorder), async ctx => {
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

  router.get('/collections/:collectionId', measureRequests(URLType.PATH, accessRecorder), async ctx => {
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
  router.get('/qo/repos/groups/osdb', measureRequests(URLType.PATH), async ctx => {
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

  router.get('/gh/repo/:owner/:repo', measureRequests(URLType.ROUTE, accessRecorder), async ctx => {
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

  router.get('/gh/repos/search', measureRequests(URLType.PATH, accessRecorder), async ctx => {
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

  router.get('/gh/users/search', measureRequests(URLType.PATH, accessRecorder), async ctx => {
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

  router.post(
    "/q/playground",
    koaBody(),
    measureRequests(URLType.PATH, accessRecorder),
    async (ctx) => {
      try {
        const {
          sql: sqlString,
          type,
          id,
        } = ctx.request.body as {
          sql: string;
          type: "repo" | "user";
          id: string;
        };
        const sqlParser = new SqlParser(type, id, sqlString);
        const sql = sqlParser.sqlify();
        const res = await (new SimpleQuery(sql, playgroundQueryExecutor)).run()
        ctx.response.status = 200;
        ctx.response.body = res;
      } catch (e) {
        ctx.logger.error("Failed to request %s: ", ctx.request.originalUrl, e);
        ctx.response.status = 500;
        ctx.response.body = e;
      }
    }
  );
}

export function socketServerRoutes(
  socket: Socket, io: Server, logger: Consola, queryExecutor: TiDBQueryExecutor, cacheBuilder: CacheBuilder,
  collectionService: CollectionService, userService: UserService, ghEventService: GHEventService
) {
  // Deprecated: use 'q' below instead.
  //
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
      const res = await q.execute(
        searchMap,
        false,
        socket.handshake.address
      );
      socket.emit(queryType, res);
    } catch (error) {
      logger.error("Failed to request %s[ws]: ", queryMsg, error);
    }
  });

  interface WsQueryRequest {
    qid?: string | number
    explain?: boolean
    excludeMeta?: boolean
    format?: 'compact'
    query: string
    params: Record<string, any>
  }

  interface WsQueryResponse {
    qid?: string | number
    explain?: boolean
    error?: true
    compact?: boolean
    payload: any
  }
  /*
   * This ws entrypoint provide a method to visit HTTP /q/:query and /q/explain/:query equally.
   * Client side should send a json message "{ qid?, explain, query, params }" to request a query.
   *
   * - Param `qid`: If `qid` exists, server will emit response into '/q/{query}?qid={qid}' topic. Otherwise,
   * server will emit response directly to '/q/{query}' which is reusable across different
   * subscribers.
   *
   * - Param `explain`: If `explain` is true, server will execute '/q/explain/{query}' instead, and to response topic
   * would be `/q/explain/{query}?qid={qid}`
   *
   * - Param `excludeMeta`: If `excludeMeta` is true, server will only return `data` field in response payload.
   *
   * - Param `format`: If `format` is compact, result will contain two parts: `fields` list and `data` array list.
   * Example:
   * ```json
   * {
   *    payload: {
   *      fields: ['field name 1', 'field name 2', ...],
   *      data: [['string field', <number>, ...], ...] },
   *    compact: true
   * }
   * ```
   *
   * - Error handling: If error occurs in Query.run phase, response.error would set to true, and payload
   * will be the error data.
   */
  socket.on("q", async (request: WsQueryRequest) => {
    try {
      const { explain, query, qid, params, format, excludeMeta } = request;
      const isCompact = format === 'compact';
      const topic = `/q/${explain ? 'explain/' : ''}${query}${qid ? `?qid=${qid}` : ''}`
      let response: WsQueryResponse

      try {
        const remoteAddr = socket.handshake.address;
        const q = new Query(
          query,
          cacheBuilder,
          queryExecutor,
          ghEventService,
          collectionService,
          userService
        );
        let res
        if (explain) {
          res = await q.explain(params, false, remoteAddr);
        } else {
          res = await q.execute(params, false, remoteAddr);
        }

        if (isCompact) {
          res.data = toCompactFormat(res.data as any, res.fields)
        }

        if (excludeMeta) {
          res = {
            data: res.data,
            fields: isCompact ? res.fields : undefined,
          }
        }

        response = {
          qid: qid,
          explain: explain,
          payload: res,
          compact: explain ? undefined : isCompact,
        }
      } catch (e) {
        response = {
          error: true,
          qid: request.qid,
          explain: request.explain,
          payload: e
        }
      }
      socket.emit(topic, response);
    } catch (error) {
      logger.error("Failed to request %s[ws]: ", request, error);
      socket.emit('fatal-error/q', {
        request,
        error,
      });
    }
  });
}