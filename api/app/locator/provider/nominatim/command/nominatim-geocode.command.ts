import {GeocodeCommand, GeocodeQuery} from '@goparrot/geocoder';
import type {AxiosInstance} from 'axios';
import type {NominatimGeocodeQueryInterface} from '../interface';
import {NominatimCommonCommandMixin as NominatimCommonCommandMixin} from './mixin';

/**
 * @api https://nominatim.org/release-docs/develop/api/Search/
 */
export class NominatimGeocodeCommand extends NominatimCommonCommandMixin(GeocodeCommand)<NominatimGeocodeQueryInterface> {
    constructor(httpClient: AxiosInstance) {
        super(httpClient);
    }

    static getUrl(): string {
        return 'https://nominatim.openstreetmap.org/search';
    }

    protected async buildQuery(query: GeocodeQuery): Promise<NominatimGeocodeQueryInterface> {
        return {
            q: query.address,
            format: 'json',
            addressdetails: 1,
            limit: 1
        };
    }
}
