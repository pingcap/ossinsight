import {DateTime, DurationLike} from "luxon";

export const MAX_TIME_RANGES = 10000;

export interface TimeRange {
  tFrom: DateTime,
  tTo: DateTime
}

export function splitTimeRange(from: DateTime, to: DateTime, chunkSize: DurationLike, desc: boolean = false): TimeRange[] {
  from = from.toUTC();
  to = to.toUTC();
  if (!from.isValid || !to.isValid || from >= to || from.year < 1000 || to.year > 9999 ||
      to.diff(from, 'days').days > 366 * 20 || from.millisecond || to.millisecond) {
    throw new Error('Invalid time range: require increasing UTC boundaries with whole-second precision and at most 20 years.');
  }
  const units = new Set(['year', 'years', 'quarter', 'quarters', 'month', 'months', 'week', 'weeks', 'day', 'days', 'hour', 'hours', 'minute', 'minutes', 'second', 'seconds']);
  if (!chunkSize || typeof chunkSize !== 'object' || Array.isArray(chunkSize)) throw new Error('Invalid time interval.');
  const entries = Object.entries(chunkSize);
  if (entries.length !== 1 || entries.some(([unit, value]) => !units.has(unit) || !Number.isSafeInteger(value) || value <= 0 || value > 10000)) {
    throw new Error('Time interval must contain exactly one positive integer unit.');
  }
  const fixedUnits: Record<string, number> = {week: 604800000, day: 86400000, hour: 3600000, minute: 60000, second: 1000};
  const [unit, amount] = entries[0];
  const step = fixedUnits[unit.replace(/s$/, '')];
  if (step && Math.ceil((to.toMillis() - from.toMillis()) / (step * amount)) > MAX_TIME_RANGES) {
    throw new Error('Time range contains too many chunks.');
  }
  const timeRanges: TimeRange[] = [];
  let curr = from;
  while (curr < to) {
    if (timeRanges.length >= MAX_TIME_RANGES) throw new Error('Time range contains too many chunks.');
    const next = curr.plus(chunkSize);
    if (!next.isValid || next <= curr) throw new Error('Time interval must advance.');
    timeRanges.push({
      tFrom: curr,
      tTo: next > to ? to : next
    });
    curr = next;
  }

  if (desc) {
    return timeRanges.reverse();
  } else {
    return timeRanges;
  }
}
