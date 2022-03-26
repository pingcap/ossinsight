import App from 'koa'
import Router from 'koa-router';
import server from "./app/server";
import dotenv from 'dotenv';
import consola, {Consola} from 'consola';
import cors from '@koa/cors';
import { validateProcessEnv } from './app/env';
import {requestCounter, requestProcessTimer} from "./app/metrics";

const RateLimit = require('koa2-ratelimit').RateLimit;
const Stores = require('koa2-ratelimit').Stores;

const logger = consola.withTag('app')
dotenv.config({ path: __dirname+'/.env.template', override: true });
dotenv.config({ path: __dirname+'/.env', override: true });

consola.wrapConsole()

validateProcessEnv()

export interface ContextExtends extends App.DefaultContext {
  logger: Consola
}

const app = new App<App.DefaultState, ContextExtends>()
const router = new Router<App.DefaultState, ContextExtends>()
const rateLimitInterval = parseInt(process.env.RATE_LIMIT_INTERVAL || '1');
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUEST || '60');
const limiter = RateLimit.middleware({
  interval: { min: rateLimitInterval },    // 1 minutes = 1 * 60 * 1000
  max: rateLimitMaxRequests,               // limit max requests per interval for each IP.
  store: new Stores.Redis({
    url: process.env.REDIS_URL
  })
});

app.use(async (ctx, next) => {
  ctx.logger = logger
  await next()
})
app.use(async (ctx, next) => {
  const url = ctx.request.url
  const stop = requestProcessTimer.startTimer({ url })
  try {
    requestCounter.labels({ url, phase: 'start' }).inc()
    await next()
    if (ctx.status < 400) {
      requestCounter.labels({ url, phase: 'success', status: ctx.status}).inc()
    } else {
      requestCounter.labels({ url, phase: 'error', status: ctx.status}).inc()
    }
  } catch (e) {
    requestCounter.labels({ url, phase: 'error' }).inc()
    throw e
  } finally {
    stop()
  }
})
app.use(cors({origin: '*'}))
app.use(limiter)

server(router)

app.use(router.routes())
  .use(router.allowedMethods())


const port = parseInt(process.env.SERVER_PORT || '3450')
app.listen(port, () => {
  logger.info(`start at ${port}`)
})

process.on("unhandledRejection", function(reason, p){
  console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
  throw reason; // optional, in case you want to treat these as errors
});
