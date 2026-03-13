import siteConfig from '@/site.config';
import { NextRequest, userAgent } from 'next/server';

export function serverSendGaMeasurementEvent (events: GaEvent[]) {
  const url = new URL(`https://www.google-analytics.com/mp/collect`);
  url.searchParams.set('api_secret', siteConfig.ga.measurementSecret);
  url.searchParams.set('measurement_id', siteConfig.ga.measurementId);
  void fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: siteConfig.ga.clientId,
      events: events,
    }),
  });
}

type GaEventParams = Record<string, string | number | boolean | undefined | null>;

interface GaEvent {
  name: string;
  params: GaEventParams;
}

export function apiEvent (name: string, params: GaEventParams, request: NextRequest): GaEvent {

  const ua = userAgent(request);

  const requestParams = {
    url: request.url,
    ip: request.ip,
    userAgent: ua.ua,
    os: `${ua.os.name} ${ua.os.version}`,
    browser: `${ua.browser.name} ${ua.browser.version}`,
    is_bot: ua.isBot,
    origin: request.headers.get('origin') ?? undefined,
    referer: request.headers.get('referer') ?? undefined,
    is_production: Boolean(process.env.IS_PRODUCTION_DEPLOYMENT),
  };

  return {
    name,
    params: {
      ...requestParams,
      ...params,
    },
  };
}

export function autoParams (prefix: string, params: any): GaEventParams {
  return Object.entries(params).reduce((res, [k, v]) => {
    if (v == null) {
      res[`${prefix}${k}`] = v;
    } else if (v instanceof Object) {
      res[`${prefix}${k}`] = String(v);
    } else {
      res[`${prefix}${k}`] = v as any;
    }
    return res;
  }, {} as GaEventParams);
}
