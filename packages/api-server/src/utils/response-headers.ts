import {AxiosResponse} from 'axios';

// Axios null/false values suppress a header; they are not valid HTTP values.
// Public data-service responses cannot establish browser sessions.
export function responseHeaders(headers: AxiosResponse['headers']): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(headers)) {
    if (/^set-cookie2?$/i.test(name)) continue;
    if (value != null && value !== false) {
      result[name] = Array.isArray(value) ? value.map(String) : String(value);
    }
  }
  return result;
}
