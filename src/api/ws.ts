import { AxiosAdapter, AxiosError } from "axios";
import { socket } from "./client";

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
  };
  if (socket.connected) {
    socket.emit('q', queryPayload);
  } else {
    socket.once('connect', () => {
      socket.emit('q', queryPayload);
    });
  }
  return new Promise((resolve, reject) => {
    const topic = `/q/${query}${qid ? `?qid=${qid}` : ''}`;
    const timeout = setTimeout(() => {
      socket.off(topic, listener);
      reject(new Error('Timeout'));
    }, 1000);

    const listener = result => {
      clearTimeout(timeout);
      if (result.error) {
        reject({
          config,
          response: {
            status: 500,
            data: result.payload,
          },
          isAxiosError: true,
          toJSON() {
            return result.payload;
          },
        } as AxiosError);
      } else {
        resolve({
          status: 200,
          statusText: 'OK',
          headers: {
            'x-ws-api': 'true',
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
  console.error('ws query error', error)
})