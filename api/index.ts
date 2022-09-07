import App from "koa";
import Router from "koa-router";
import server, { socketServer } from "./app/server";
import dotenv from "dotenv";
import consola, { Consola } from "consola";
import cors from "@koa/cors";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";

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

// Init router.
const router = new Router<App.DefaultState, ContextExtends>();
server(router);
app.use(router.routes()).use(router.allowedMethods());

// Init Socket.io
const httpServer = createServer(app.callback());
const io = new SocketServer(httpServer, {
  cors: {
    origin: "*",
  },
});

// Socket connection
io.on("connection", (socket) => {
  logger.info("io connected");
  socketServer(socket, io, logger);
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
