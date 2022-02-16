import {Consola} from "consola";

declare module 'koa' {

  export interface ExtendableContext {
    logger: Consola
  }
}