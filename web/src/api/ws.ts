import { AxiosAdapter, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { socket } from './client';

interface Resp {
  error?: boolean;
  payload: any;
  compact?: boolean;
}

class AxiosLikeError extends Error implements AxiosError {
  isAxiosError = true;
  request = undefined;

  originalError: any;

  constructor (error: any, public code: string, public config: AxiosRequestConfig, public response: AxiosResponse) {
    super(error);
  }

  toJSON (): object {
    return this.originalError;
  }
}

export const wsQueryApiAdapter = (query: string, params: any, wsApi: 'unique' | true): AxiosAdapter => async (config) => {
  let qid: string | undefined;
  if (wsApi === 'unique') {
    qid = Math.random().toString();
  }

  const [queryName, explain] = query.split('/');
  const queryPayload = {
    query: queryName,
    explain: !!explain,
    qid,
    params,
    excludeMeta: config.excludeMeta,
    format: config.format,
  };
  if (socket.connected) {
    socket.emit('q', queryPayload);
  } else {
    socket.once('connect', () => {
      socket.emit('q', queryPayload);
    });
  }
  return await new Promise((resolve, reject) => {
    const topic = `/q/${query}${qid ? `?qid=${qid}` : ''}`;
    const timeout = setTimeout(() => {
      socket.off(topic, listener);
      reject(new Error('Timeout'));
    }, 1000);

    const listener = (result: Resp) => {
      clearTimeout(timeout);
      if (result.error) {
        reject(new AxiosLikeError(result.payload, 'ERROR', config, {
          status: 500,
          statusText: 'ERROR',
          data: result.payload,
          headers: {},
          config,
        }));
      } else {
        resolve({
          status: 200,
          statusText: 'OK',
          headers: {
            'x-ws-api': 'true',
            'x-compact': result.compact ? 'true' : 'false',
          },
          data: result.payload,
          config,
        });
      }
    };
    socket.once(topic, listener);
  });
};

socket.on('fatal-error/q', error => {
  console.error('ws query error', error);
});
