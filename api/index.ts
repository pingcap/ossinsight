import App from "koa";
import Router from "koa-router";
import httpServerRoutes, { socketServerRoutes } from "./app/server";
import dotenv from "dotenv";
import consola, { Consola } from "consola";
import cors from "@koa/cors";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import CacheBuilder from "./app/core/cache/CacheBuilder";
import GhExecutor from "./app/core/GhExecutor";
import { TiDBQueryExecutor } from "./app/core/TiDBQueryExecutor";
import CollectionService from "./app/services/CollectionService";
import GHEventService from "./app/services/GHEventService";
import UserService from "./app/services/UserService";
import { getConnectionOptions } from "./app/utils/db";

const logger = consola.withTag("app");

dotenv.config({ path: __dirname + "/.env.template" });
dotenv.config({ path: __dirname + "/.env", override: true });

export interface ContextExtends extends App.DefaultContext {
  logger: Consola;
}

const app = new App<App.DefaultState, ContextExtends>({
  proxy: true,
});

// Enable logs.
app.use(async (ctx, next) => {
  ctx.logger = logger;
  await next();
});

// Enable CORS.
app.use(cors({ origin: "*" }));

// Init MySQL Executor.
const queryExecutor = new TiDBQueryExecutor(
  getConnectionOptions({
    connectionLimit: parseInt(process.env.CONNECTION_LIMIT || "10"),
    queueLimit: parseInt(process.env.QUEUE_LIMIT || "20"),
  })
);

// Init Cache Builder;
const enableCache = process.env.ENABLE_CACHE === "1" ? true : false;
const cacheBuilder = new CacheBuilder(enableCache);

// Init GitHub Executor.
const tokens = (process.env.GH_TOKENS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ghExecutor = new GhExecutor(tokens, cacheBuilder);

// Init Services.
const collectionService = new CollectionService(queryExecutor, cacheBuilder);
const userService = new UserService(queryExecutor, cacheBuilder);
const ghEventService = new GHEventService(queryExecutor);

// Init router.
const router = new Router<App.DefaultState, ContextExtends>();
httpServerRoutes(router, queryExecutor, cacheBuilder, ghExecutor, collectionService, userService, ghEventService);
app.use(router.routes()).use(router.allowedMethods());

// Init HTTP server.
const httpServer = createServer(app.callback());

// Init WebSocket server.
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*",
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
