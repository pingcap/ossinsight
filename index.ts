import App from 'koa'
import Router from 'koa-router';
import server from "./app/server";
import dotenv from 'dotenv';
import consola, {Consola} from 'consola';
import cors from '@koa/cors';

const logger = consola.withTag('app')


const {parsed} = dotenv.config()

if (parsed) {
  logger.info('loaded env:', Object.keys(parsed).join(', '))
}

consola.wrapConsole()

export interface ContextExtends extends App.DefaultContext {
  logger: Consola
}

const app = new App<App.DefaultState, ContextExtends>()
const router = new Router<App.DefaultState, ContextExtends>()

app.use(async (ctx, next) => {
  ctx.logger = logger
  await next()
})
app.use(cors({origin: '*'}))

server(router)

app.use(router.routes())
  .use(router.allowedMethods())


const port = parseInt(process.env.SERVER_PORT || '3450')
app.listen(port, () => {
  logger.info(`start at ${port}`)
})

