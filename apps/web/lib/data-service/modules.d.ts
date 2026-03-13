declare module '@/lib/data-service/endpoints' {
  type Endpoint = { config: import('./config').EndpointConfig, sql: string };

  export default function loadEndpoint (name: string): Promise<Endpoint>

  export function hasEndpoint (name: string): boolean
}
