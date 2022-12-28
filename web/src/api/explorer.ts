import { clientWithoutCache } from '@site/src/api/client';
import { RemoteData } from '@site/src/components/RemoteCharts/hook';

export type WaitingAskResult = {
  sql: string;
  execution: {
    'engines': string[];
    'hitCache': boolean;
    'id': string;
    'queryDigest': null;
    'queryHash': string;
    'queueCurrentRank': number;
    'queueInitialRank': number;
    'status': 'waiting';
    'enqueue': boolean;
  };
};

export type ExecutedAskResult = Exclude<RemoteData<any, any>, 'query'> & {
  execution: {
    'engines': string[];
    'hitCache': boolean;
    'id': string;
    'queryDigest': null;
    'queryHash': string;
    'queueCurrentRank': number;
    'queueInitialRank': number;
    'status': 'success';
    'enqueue': boolean;
  };
};

export type AskResult = WaitingAskResult | ExecutedAskResult;

export type ChartResult = {
  chartName: string;
  title: string;
  [key: string]: any;
};

export async function ask (question: string): Promise<AskResult> {
  return await clientWithoutCache.post('/explorer/answer-question/', { question }, { withCredentials: true });
}

export async function getResult (executionId: string): Promise<AskResult> {
  // TODO: use ws api
  return await clientWithoutCache.get('/explorer/get-query-result/', { params: { executionId }, withCredentials: true, wsApi: true });
}

export async function guessChart (params: { question: string, data: any }): Promise<ChartResult> {
  return await clientWithoutCache.post('/explorer/generate-chart/', params, { withCredentials: true });
}

export function isWaiting (result: AskResult): result is WaitingAskResult {
  return result.execution.status === 'waiting';
}
