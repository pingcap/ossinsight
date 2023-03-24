import { Constructor, AbstractCommand, AccuracyEnum, QueryInterface, AbstractLocationTransformer } from '@goparrot/geocoder';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { NominatimProvider } from '../../nominatim.provider';
import { NominatimLocationTransformer } from '../../transformer';

export function NominatimCommonCommandMixin<TBase extends Constructor<AbstractCommand>>(Base: TBase): TBase {
    abstract class NominatimCommonCommand extends Base {

        protected constructor(...args: any[]) {
            const [httpClient]: [AxiosInstance] = args as any;

            super(httpClient);
        }

        static getMaxAccuracy(): AccuracyEnum {
            return AccuracyEnum.HOUSE_NUMBER;
        }

        protected async validateResponse(_response: AxiosResponse): Promise<void> {

        }

        protected async parseResponse(response: AxiosResponse, query: QueryInterface): Promise<AbstractLocationTransformer<NominatimProvider>[]> {
            let locations: any[] = [];
            if (Array.isArray(response.data)) {
                locations = response.data;
            } else {
                locations.push(response.data);
            }

            return Promise.all<AbstractLocationTransformer<NominatimProvider>>(
                locations.map(async (raw: any): Promise<AbstractLocationTransformer<NominatimProvider>> => new NominatimLocationTransformer(raw)),
            );
        }

    }

    return NominatimCommonCommand;
}
