export class HttpRequestError extends Error {
  status: number;

  constructor (private readonly response: Response, responseBody: any) {
    const message = String(responseBody?.message ?? responseBody);
    super(message);
    this.status = response.status;
  }
}