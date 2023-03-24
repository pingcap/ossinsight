import { IMiddleware } from "koa-router";
import { measure, requestCounter, requestProcessTimer } from "../metrics";
import { BatchLoader } from "../core/BatchLoader";
import consola from "consola";

const logger = consola.withTag('measure-middleware');

export enum URLType {
  FULL = 'full',
  PATH = 'path',
  ROUTE = 'route'
}

export enum Phase {
  START = 'start',
  SUCCESS = 'success',
  ERROR = 'error'
}

export function measureRequests(urlType?: URLType, accessRecorder?: BatchLoader): IMiddleware {
  return async (ctx, next) => {
    let url: string;
    switch (urlType) {
      case URLType.FULL:
        url = ctx.url
        break
      case URLType.ROUTE:
        if (ctx._matchedRoute) {
          url = String(ctx._matchedRoute);
          break
        }
      default:
        url = ctx.path;
    }

    await measure(requestProcessTimer.labels({ url }), async () => {
      const { header } = ctx;
      try {
        requestCounter.labels({ url, origin: header.origin, phase: Phase.START }).inc();
        await next();

        const { status, ip, query, path } = ctx;
        if (accessRecorder) {
            accessRecorder.insert([ip, header.origin || '', status, path, JSON.stringify(query)]);
        }

        if (status < 400) {
          requestCounter.labels({ url, status, origin: header.origin, phase: Phase.SUCCESS }).inc();
        } else {
          requestCounter.labels({ url, status, origin: header.origin, phase: Phase.ERROR }).inc();
        }
      } catch (e) {
        requestCounter.labels({ url, origin: header.origin, phase: Phase.ERROR }).inc();
        throw e
      }
    });
  }
}