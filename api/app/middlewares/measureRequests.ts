import {IMiddleware} from "koa-router";
import {limitedRequestCounter, measure, requestCounter, requestProcessTimer} from "../metrics";
import {Context, Next} from "koa";

export interface MeasureRequestsParams {
  urlLabel?: 'full' | 'path' | 'route'
}

export function measureRequests({urlLabel = 'path'}: MeasureRequestsParams): IMiddleware {
  return async (ctx, next) => {
    let url: string = ctx.path
    switch (urlLabel) {
      case 'full':
        url = ctx.url
        break
      case 'route':
        if (ctx._matchedRoute) {
          url = String(ctx._matchedRoute)
        }
        break
    }

    await measure(requestProcessTimer.labels({url}), async () => {
      try {
        requestCounter.labels({url, phase: 'start'}).inc()
        await next()
        if (ctx.status < 400) {
          requestCounter.labels({url, phase: 'success', status: ctx.status}).inc()
        } else {
          requestCounter.labels({url, phase: 'error', status: ctx.status}).inc()
        }
      } catch (e) {
        requestCounter.labels({url, phase: 'error'}).inc()
        throw e
      }
    })
  }
}

export async function measureLimitedRequests (ctx: Context, next: Next) {
  try {
    await next()
  } finally {
    if (ctx.status === 429) {
      limitedRequestCounter.inc()
    }
  }
}
