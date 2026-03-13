import type { WidgetBaseContext } from '@/lib/charts-types';

export default async function executeDatasource (config: any, ctx: WidgetBaseContext, signal?: AbortSignal) {
  try {
    if (config instanceof Array) {
      return Promise.all(config.map(c => executeDatasource(c, ctx, signal)));
    }

    switch (config.type) {
      case 'api':
        return import('./api').then(module => module.default(config, ctx, signal));
      case 'ref':
        throw new Error('ref datasource type is no longer supported');
      case 'endpoint':
        return import('./endpoint').then(module => module.default(config, ctx, signal));
    }
  } catch (e) {
    console.error(e)
    throw e;
  }

  throw new Error(`${config.type} datasource is not supported`);
}
