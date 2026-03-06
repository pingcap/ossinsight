import { HttpRequestError } from './errors';

export async function handleOApi (response: Response): Promise<any> {
  if (response.ok) {
    const res = await response.json();
    return res.data;
  } else {
    throw new HttpRequestError(response, await response.json())
  }
}
