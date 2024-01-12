import { AxiosResponse } from 'axios';

export const transformCompactResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
  if (response.headers['x-compact'] !== 'true') {
    return response;
  }
  const { data, fields } = response.data;
  response.data.data = data.map(item => {
    const res = {};
    fields.forEach(({ name }, i) => {
      res[name] = item[i];
    });
    return res;
  });
  delete response.data.fields;
  return response;
};
