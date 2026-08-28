import { STAR_DATA_INCIDENT, type DataQualityMarker } from '@/lib/data-quality';
import { APIError } from './executor/utils';

/**
 * Thrown when a query is blocked by the star-data incident
 * (see `@/lib/data-quality`). Serialized by the query routes as a 503 with a
 * structured body: `{ message, data_quality }`.
 */
export class DegradedDataError extends APIError {
  readonly dataQuality: DataQualityMarker = STAR_DATA_INCIDENT.marker;

  constructor(queryName: string) {
    super(
      `Query "${queryName}" is temporarily unavailable: it ranks repositories by star events, ` +
      `and GitHub's public events firehose has been degraded since ${STAR_DATA_INCIDENT.suspectSince}. ` +
      'See the data_quality field for details.',
      503,
    );
  }
}
