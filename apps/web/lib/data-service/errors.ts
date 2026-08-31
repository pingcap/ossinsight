import { STAR_DATA_INCIDENT, type DataQualityUnavailableMarker } from '@/lib/data-quality';
import { APIError } from './executor/utils';

/**
 * Signals that a query is blocked by the star-data incident
 * (see `@/lib/data-quality`).
 *
 * Deliberately serialized as **HTTP 200** with an empty result set plus this
 * marker, not as an error status. `api.ossinsight.io` is referenced by ~470
 * public repositories; returning 5xx would break those integrations, trigger
 * retry storms and fire their alerting for what is a known, explained data
 * condition rather than an outage.
 *
 * The envelope carries `status: "unavailable"` precisely so that the empty
 * `data` array cannot be mistaken for "there are no results", and points the
 * caller at an endpoint that still returns accurate numbers.
 *
 * It remains an Error subclass because server components catch it to render
 * `<DataQualityNotice />` in place of a ranking.
 */
export class DegradedDataError extends APIError {
  readonly dataQuality: DataQualityUnavailableMarker = STAR_DATA_INCIDENT.unavailableMarker;

  /** HTTP status the query routes serialize this as. */
  static readonly RESPONSE_STATUS = 200;

  constructor(readonly queryName: string) {
    super(
      `Query "${queryName}" is paused: it ranks by star/PR/issue event counts, and our capture of ` +
      `those events collapsed (see data_quality). An empty result here means the metric cannot be ` +
      `computed, not that there are no matching results.`,
      200,
    );
  }

  /** The response body served for a blocked query. */
  toResponseBody() {
    return {
      data: [] as unknown[],
      message: this.message,
      data_quality: this.dataQuality,
    };
  }
}
