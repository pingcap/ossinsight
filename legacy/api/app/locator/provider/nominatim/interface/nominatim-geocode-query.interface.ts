import type { NominatimQueryInterface } from './nominatim-query.interface';

export interface NominatimGeocodeQueryInterface extends NominatimQueryInterface {
    q: string;
    format?: string;
    addressdetails?: number;
    limit?: number;
}
