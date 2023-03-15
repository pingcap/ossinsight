import { AbstractHttpProvider } from '@goparrot/geocoder';
import type { AxiosInstance } from 'axios';
import { NominatimGeocodeCommand } from './command';

/**
 * @api https://nominatim.org/release-docs/develop/api/Overview/
 */
export class NominatimProvider extends AbstractHttpProvider {
    constructor(httpClient: AxiosInstance) {
        super({
            geocode: new NominatimGeocodeCommand(httpClient),
            reverse: {} as any
        });
    }
}
