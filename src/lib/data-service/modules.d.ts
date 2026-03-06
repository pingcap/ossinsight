declare module '@ossinsight/data-service/endpoints' {
  type Endpoint = { config: import('./src/config').EndpointConfig, sql: string };

  export default function loadEndpoint (name: string): Promise<Endpoint>

  export function hasEndpoint (name: string): boolean
}
