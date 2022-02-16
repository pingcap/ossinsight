import 'koa'
import {Consola} from "consola";

declare module 'koa' {

  interface Context {
    logger: Consola
  }
}