import App from "koa";
import Router from "koa-router";
import httpServerRoutes, { socketServerRoutes } from "./app/server";
import consola from "consola";
import cors from "@koa/cors";
import koaJwt from 'koa-jwt';
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import CacheBuilder from "./app/core/cache/CacheBuilder";
import GhExecutor from "./app/core/GhExecutor";
import {
  TiDBQueryExecutor,
  TiDBPlaygroundQueryExecutor,
} from "./app/core/TiDBQueryExecutor";
import { getPlaygroundSessionLimits } from "./app/utils/playground";
import CollectionService from "./app/services/CollectionService";
import GHEventService from "./app/services/GHEventService";
import UserService from "./app/services/UserService";
import { getConnectionOptions } from "./app/utils/db";
import StatsService from "./app/services/StatsService";
import { getAllowedOrigins, getCorsOrigin } from "./app/origins";
import { BatchLoader } from "./app/core/BatchLoader";
import koaStatic from "koa-static";
import path from "path";
import { configEnv } from "./app/utils/env";
import { createPool } from "mysql2/promise";
import { ContextExtends, GitHubAuthOption } from "./app/types";

const logger = consola.withTag("app");

configEnv(__dirname);

const allowedOrigins = getAllowedOrigins();
const allowedOriginsWithPublic = getAllowedOrigins(true);
const githubAuthOption:GitHubAuthOption = {
  enableGitHubLogin: process.env.GH_OAUTH_CLIENT_ID !== undefined && process.env.JWT_SECRET !== undefined,
  jwtSecret: process.env.JWT_SECRET || 'ossinsight.io',
  cookieName: process.env.JWT_COOKIE_NAME || 'o_access_token',
  clientId: process.env.GH_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GH_OAUTH_CLIENT_SECRET || '',
  successCallback: process.env.GH_OAUTH_SUCCESS_CALLBACK || 'https://ossinsight.io/profile',
  errorCallback: process.env.GH_OAUTH_ERROR_CALLBACK || 'https://ossinsight.io',
};

const app = new App<App.DefaultState, ContextExtends>({
  proxy: true,
});

// Enable logs.
app.use(async (ctx, next) => {
  ctx.logger = logger;
  await next();
});

// Enable CORS.
app.use(cors({
  origin: (ctx) => {
    return getCorsOrigin(allowedOriginsWithPublic, ctx.request.header.origin);
  }
}));

// Enable JWT.
const jwtMiddleware = koaJwt({
  secret: githubAuthOption.jwtSecret,
  cookie: githubAuthOption.cookieName
});

// Init MySQL Executor.
const queryExecutor = new TiDBQueryExecutor(
  getConnectionOptions({
    connectionLimit: parseInt(process.env.CONNECTION_LIMIT || "10"),
    queueLimit: parseInt(process.env.QUEUE_LIMIT || "20"),
  })
);

// Enable static HTTP server.
app.use(koaStatic(path.resolve(__dirname, './static'), {
  setHeaders: headers =>
    headers
      .setHeader('content-type', 'application/vnd.oai.openapi')
      .setHeader('cache-control', 'no-cache')
    }
));

const playgroundQueryExecutor = new TiDBPlaygroundQueryExecutor(
  getConnectionOptions({
    connectionLimit: parseInt(process.env.CONNECTION_LIMIT || "10"),
    queueLimit: parseInt(process.env.QUEUE_LIMIT || "20"),
    user: process.env.WEB_SHELL_USER,
    password: process.env.WEB_SHELL_PASSWORD,
  }),
  getPlaygroundSessionLimits(),
);

// Init Cache Builder;
const enableCache = process.env.ENABLE_CACHE === "1" ? true : false;
const cacheBuilder = new CacheBuilder(enableCache);

// Init GitHub Executor.
const tokens = (process.env.GH_TOKENS || "").split(",").map((s) => s.trim()).filter(Boolean);
const ghExecutor = new GhExecutor(tokens, cacheBuilder);

// Init Access Log Batch Loader.
const pool = createPool(getConnectionOptions({
  connectionLimit: 2
}));
const insertAccessLogSQL = `INSERT INTO access_logs(
  remote_addr, origin, status_code, request_path, request_params
) VALUES ?`;
const accessRecorder = new BatchLoader(pool, insertAccessLogSQL);

// Init Services.
const collectionService = new CollectionService(queryExecutor, cacheBuilder);
const userService = new UserService(queryExecutor, cacheBuilder);
const ghEventService = new GHEventService(queryExecutor);
const statsService = new StatsService(queryExecutor, cacheBuilder);

// Init router.
const router = new Router<App.DefaultState, ContextExtends>();
httpServerRoutes(
  router,
  queryExecutor,
  playgroundQueryExecutor,
  cacheBuilder,
  ghExecutor,
  collectionService,
  userService,
  ghEventService,
  statsService,
  accessRecorder,
  jwtMiddleware,
  githubAuthOption
);
app.use(router.routes()).use(router.allowedMethods());

// Init HTTP server.
const httpServer = createServer(app.callback());

// Init WebSocket server.
const io = new SocketServer(httpServer, {
  cors: {
    origin: (requestOrigin, cb) => {
      try {
        cb(null, getCorsOrigin(allowedOrigins, requestOrigin))
      } catch(err: any) {
        cb(err, undefined);
      }
    },
  },
});

// Listen socket connection.
io.on("connection", (socket) => {
  logger.info("io connected");
  socketServerRoutes(socket, io, logger, queryExecutor, cacheBuilder, collectionService, userService, ghEventService);
  socket.on("disconnect", () => {
    logger.info("io disconnected");
  });
});

const port = parseInt(process.env.SERVER_PORT || "3450");
httpServer.listen(port, () => {
  logger.info(`start at ${port}`);
});

process.on("unhandledRejection", function (reason, p) {
  console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
  throw reason; // optional, in case you want to treat these as errors
});
