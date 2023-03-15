import type { ConditionalHours, ConditionalRefreshCrons } from "../../params.schema";

export function resolveHours(params: any, hours: number | ConditionalHours | undefined): number {
  if (typeof hours === "number") {
    return hours;
  }
  if (!hours) {
    return -1;
  }
  if (!params || !params[hours.param]) {
    return -1;
  }
  const param = params[hours.param];
  for (const key in hours.on) {
    // equals or matches
    if (param === key || (new RegExp(key)).test(param)) {
      return hours.on[key];
    }
  }
  return -1;
}

export function resolveCrons(params: any, crons: string | ConditionalRefreshCrons | undefined): (string | undefined) {
  if (typeof crons === "string") {
    return crons;
  }
  if (!crons) {
    return undefined;
  }
  if (!params || !params[crons.param]) {
    return undefined;
  }
  const param = params[crons.param];
  for (const key in crons.on) {
    // equals or matches
    if (param === key || (new RegExp(key)).test(param)) {
      return crons.on[key];
    }
  }
  return undefined;
}
