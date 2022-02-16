import App from 'koa'
import Router from 'koa-router';
import server from "./app/server";
import dotenv from 'dotenv';
import consola from 'consola';

const logger = consola.withTag('app')


const { parsed } = dotenv.config()

if(parsed) {
  logger.info('loaded env:', Object.keys(parsed).join(', '))
}

consola.wrapConsole()

const app = new App()
const router = new Router()

server(app, router)

app.use(router.routes())
  .use(router.allowedMethods())

const port = parseInt(process.env.SERVER_PORT || '3450')
app.listen(port, () => {
  logger.info(`start at ${port}`)
})

