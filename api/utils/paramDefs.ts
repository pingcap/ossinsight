import type { ConditionalHours } from "../params.schema";

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
