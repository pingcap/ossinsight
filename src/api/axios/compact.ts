import { AxiosResponse } from 'axios';

export const transformCompactResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
  if (response.headers['x-compact'] !== 'true') {
    return response;
  }
  const { data, fields } = response.data;
  response.data.data = data.map((item: any[]) => {
    const res: Record<string, any> = {};
    fields.forEach(({ name }: { name: string }, i: number) => {
      res[name] = item[i];
    });
    return res;
  });
  delete response.data.fields;
  return response;
};
