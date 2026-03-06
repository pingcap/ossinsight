declare module '@ossinsight/widgets' {
  type WidgetModule = {
    meta: import('./index').WidgetMeta;
    visualizer: () => Promise<import('./index').VisualizerModule<any, any, any, any>>
    datasourceFetcher: (context: import('./index').WidgetBaseContext, signal?: AbortSignal) => Promise<any>
    parameterDefinition: () => Promise<import('./index').ParameterDefinitions>
    metadataGenerator: () => Promise<import('./index').MetadataGenerator<any>>
  }

  /** @deprecated */
  const visualizers: Record<string, () => Promise<import('./index').VisualizerModule<any, any, any, any>>>;

  /** @deprecated */
  const datasourceFetchers: Record<string, (context: import('./index').WidgetBaseContext, signal?: AbortSignal) => Promise<any>>;

  /** @deprecated */
  const parameterDefinitions: Record<string, () => Promise<import('./index').ParameterDefinitions>>;

  /** @deprecated */
  const metadataGenerators: Record<string, () => Promise<import('./index').MetadataGenerator<any>>>;

  declare const widgets: Record<string, WidgetModule>;

  export default widgets;

  export { visualizers, datasourceFetchers, parameterDefinitions, metadataGenerators };
}

declare module '@geo-maps/countries-land-10km' {
  export default function (): any;
}
