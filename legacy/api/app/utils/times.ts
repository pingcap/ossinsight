import { DateTime, DurationLike } from "luxon";

export interface TimeRange {
    tFrom: DateTime,
    tTo: DateTime
}

export function splitTimeRange(from: DateTime, to: DateTime, chunkSize: DurationLike): TimeRange[] {
    const timeRanges: TimeRange[] = [];
    let curr = from;
    while (to.diff(curr, 'seconds').seconds >= 0) {
        const next = curr.plus(chunkSize);
        timeRanges.push({
            tFrom: curr,
            tTo: next
        });
        curr = next;
    }
    return timeRanges;
}