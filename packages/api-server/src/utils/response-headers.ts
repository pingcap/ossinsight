import {AxiosResponse} from 'axios';

// Axios null/false values suppress a header; they are not valid HTTP values.
// Preserve arrays (especially Set-Cookie) when forwarding to Fastify.
export function responseHeaders(headers: AxiosResponse['headers']): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value != null && value !== false) {
      result[name] = Array.isArray(value) ? value.map(String) : String(value);
    }
  }
  return result;
}
