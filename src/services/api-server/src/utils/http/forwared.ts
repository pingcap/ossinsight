import {forwarded} from "@fastify/forwarded";
import {FastifyRequest} from "fastify";
/**
 * @summary Get client IP from request object.
 * @description Get the real client IP from the request.
 *
 * **Note**: By default, ELB appends the client's IP to the end of the `X-Forwarded-For` Header value, separated by commas. However,
 * when the `forwarded` library parses the `X-Forwarded-For` Header, it is stored in the addresses array in reverse order.
 *
 * In addition, the `forwarded` library will insert the socket IP as the first element into the addresses array.
 *
 * So the element with index 1 in the addresses is the real client IP.
 *
 * **Reference**:
 * https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html
 *
 * @param req The fastify request object.
 */
export function getRealClientIP(req: FastifyRequest): string {
  if (typeof req.headers['x-real-ip'] === 'string') {
    return req.headers['x-real-ip'];
  }

  if (typeof req.headers['x-client-ip'] === 'string') {
    return req.headers['x-client-ip'];
  }

  if (typeof req.headers['x-forwarded-for'] === 'string') {
    const addresses = forwarded(req as any);
    if (addresses.length === 0) {
      return req.ip;
    } else if (addresses.length === 1) {
      return addresses[0];
    } else {
      return addresses[1];
    }
  }

  return req.ip;
}