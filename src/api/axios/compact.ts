import { AxiosResponse } from "axios";

export const transformCompactResponseInterceptor = (response: AxiosResponse): AxiosResponse => {
  if (!Boolean(response.headers['x-compact'])) {
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