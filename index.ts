import App, { Context } from 'koa'
import Router from 'koa-router';
import server from "./app/server";
import dotenv from 'dotenv';
import consola, {Consola, FancyReporter} from 'consola';
import cors from '@koa/cors';
import { validateProcessEnv } from './app/env';
import {measureLimitedRequests} from "./app/middlewares/measureRequests";
import { createRateLimiter } from './app/middlewares/rate-limit';

consola.setReporters([
  new FancyReporter({
    dateFormat: 'YYYY:MM:DD HH:mm:ss'
  }),
]);
consola.wrapConsole();
const logger = consola.withTag('app');

dotenv.config({ path: __dirname+'/.env.template', override: true });
dotenv.config({ path: __dirname+'/.env', override: true });

validateProcessEnv()

export interface ContextExtends extends App.DefaultContext {
  logger: Consola
}

const app = new App<App.DefaultState, ContextExtends>({
  proxy: true
})

// Enable logs.
app.use(async (ctx, next) => {
  ctx.logger = logger
  await next()
})

// Init global Rate Limit.
const globalRateLimiter = createRateLimiter('global', {
  skip: (ctx: Context) => {
    const apiPath = ctx.URL.pathname || '';

    if (apiPath.startsWith('/metrics')) {
      return true;
    } else if (apiPath.startsWith('/auth0/callback')) {
      return true;
    } else if (apiPath.startsWith('/signup')) {
      return true;
    } else if (apiPath.startsWith('/q/events-total')) {
      return true;
    }

    return false;
  }
});
app.use(measureLimitedRequests)
app.use(globalRateLimiter)

// Enable CORS.
app.use(cors({origin: '*'}))

// Init router.
const router = new Router<App.DefaultState, ContextExtends>()
server(router)
app.use(router.routes()).use(router.allowedMethods())

const port = parseInt(process.env.SERVER_PORT || '3450')
app.listen(port, () => {
  logger.info(`start at ${port}`)
})

process.on("unhandledRejection", function(reason, p){
  console.log("Unhandled", reason, p); // log all your errors, "unsuppressing" them.
  throw reason; // optional, in case you want to treat these as errors
});
