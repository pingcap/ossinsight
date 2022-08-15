import { AbstractLocationTransformer } from '@goparrot/geocoder';
import { NominatimProvider } from '../nominatim.provider';

export class NominatimLocationTransformer extends AbstractLocationTransformer<NominatimProvider> {
    constructor(raw: any) {
        super(NominatimProvider, raw);
    }

    async getFormattedAddress(): Promise<string> {
        return this.raw.display_name;
    }

    async getLatitude(): Promise<number> {
        return this.raw.lat;
    }

    async getLongitude(): Promise<number> {
        return this.raw.lon;
    }

    async getCountry(): Promise<string | undefined> {
        return this.raw.address.country;
    }

    async getCountryCode(): Promise<string | undefined> {
        return String(this.raw.address.country_code).toUpperCase()
    }

    async getState(): Promise<string | undefined> {
        return this.raw.address.state;
    }

    async getCity(): Promise<string | undefined> {
        return this.raw.address.city;
    }

    async getStreetName(): Promise<string | undefined> {
        return this.raw.address.suburb;
    }

    async getStateCode(): Promise<string | undefined> {
        return;
    }

    async getHouseNumber(): Promise<string | undefined> {
        return;
    }

    async getPostalCode(): Promise<string | undefined> {
        return;
    }

    async getPlaceId(): Promise<string | undefined> {
        return;
    }
}
