import 'reflect-metadata';
import { ChainProvider, GoogleMapsProvider } from '@goparrot/geocoder';
import axios, { AxiosInstance } from 'axios';
import consola, { Consola } from "consola";
import LRUCache from 'lru-cache';
import pinyin from 'pinyin';
import { NominatimProvider } from './provider/nominatim';
import { getConnectionOptions } from '../utils/db';
import { createPool, Pool } from 'mysql2/promise';

const ADDRESS_MIN_LENGTH = 5;
const ADDRESS_MAX_LENGTH = 50;
const INVALID_ADDRESS_REGEXPS = [
    /http(s)*:\/\/.*/,
    /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
    /(-)*\d+.\d+,\s*(-)*\d+.\d+/,
];
const REPLACE_WITH_EMPTY_TOKENS = ['省', '市', '区', '-', '，', '*', '#', '•', '.', ',', '·', '.', '/', '、'];
const CONTAIN_CHINESE_REGEXP = /[\u4e00-\u9fa5]+/;
export const DEFAULT_COUNTRY_CODE = 'UND';
export const DEFAULT_REGION_CODE = 'UND';

export enum LocationProvider {
    GOOGLE_MAPS = "GOOGLE_MAPS",
    NOMINATIM = "NOMINATIM",
    VALIDATOR = "VALIDATOR",
    UNKNOWN = "UNKNOWN"
}

export const providerNameMap:Record<string, LocationProvider> = {
    'GoogleMapsProvider': LocationProvider.GOOGLE_MAPS,
    'NominatimProvider': LocationProvider.NOMINATIM
}

export enum LocationState {
    VALID = 1,
    INVALID = 0
}

export interface LocationData {
    address: string;
    valid: LocationState;
    formattedAddress?: string;
    countryCode?: string | null;
    regionCode?: string | null;
    state?: string;
    city?: string;
    longitude?: number | null;
    latitude?: number | null;
    provider?: LocationProvider;
}

export class Locator {
    private logger: Consola;
    private geocoder: ChainProvider;
    private addressCache: LocationCache;
    private regionCodeMap: Record<string, string>;

    constructor(addressCache: LocationCache, regionCodeMap?: Record<string, string>) {
        // Init logger.
        this.logger = consola.withTag('locator');

        // Init GeoCoder.
        const axiosInstance: AxiosInstance = axios.create();
        const providers = [];

        if (process.env.USE_NOMINATIM_API !== undefined && process.env.USE_NOMINATIM_API === '1') {
            providers.push(new NominatimProvider(axiosInstance));
            this.logger.info('Use Nominatim as geocoding provider.');
        }
        if (process.env.GOOGLE_MAPS_API_KEY !== undefined && process.env.GOOGLE_MAPS_API_KEY !== '') {
            providers.push(new GoogleMapsProvider(axiosInstance, process.env.GOOGLE_MAPS_API_KEY));
            this.logger.info('Use GoogleMap as geocoding provider.');
        }

        this.geocoder = new ChainProvider(providers);
        this.addressCache = addressCache;
        this.regionCodeMap = regionCodeMap ? regionCodeMap : {};
    }

    async geocode(address: string):Promise<LocationData> {
        if (address === undefined || address === null) {
            return this.recordInvalidAddress(address);
        }

        // First, try to get location info from cache.
        // Notice: The address must be preprocessed first, otherwise it may be directly 
        // considered as an invalid Location due to insufficient length.
        address = this.processAddress(address);
        const cacheAddress = await this.addressCache.get(address)
        if (cacheAddress !== undefined) {
            return cacheAddress;
        }

        // Second, try to judge it by validator. 
        if (!Locator.isAddressValid(address)) {
            return this.recordInvalidAddress(address);
        }

        try {
            // Third, Try to fetch location info by GeoCode API.
            const locations = await this.geocoder.geocode({
                address: address
            });

            if (!Array.isArray(locations) || locations.length < 1) {
                return this.recordInvalidAddress(address);
            }

            const { formattedAddress, countryCode: regionCode, state, city, longitude, latitude, provider } = locations[0];
            const countryCode = regionCode && this.regionCodeMap[regionCode] ? this.regionCodeMap[regionCode] : regionCode;
            const providerName = providerNameMap[provider];
            const result:LocationData = {
                address: address,
                valid: LocationState.VALID,
                formattedAddress: formattedAddress,
                countryCode: countryCode,
                regionCode: regionCode,
                state: state,
                city: city,
                longitude: longitude,
                latitude: latitude,
                provider: providerName
            };
            await this.addressCache.set(result);
            return result;
        } catch(err: any) {
            this.logger.error(`Failed to geocode for address ${address}:`, err);
            return this.recordInvalidAddress(address);
        }
    }

    private static isAddressValid(address: string):boolean {
        if (address.length < ADDRESS_MIN_LENGTH || address.length > ADDRESS_MAX_LENGTH) {
            return false;
        }

        for (const regexp of INVALID_ADDRESS_REGEXPS) {
            if (regexp.test(address)) {
                return false;
            }
        }

        return true;
    }

    private processAddress(address: string):string {
        for(const t of REPLACE_WITH_EMPTY_TOKENS) {
            address = address.replaceAll(t, ' ');
        }

        // Process for issue goparrot/geocoder#115, first convert chinese place names into pinyin, 
        // and then make a request through the API.
        // Link: https://github.com/goparrot/geocoder/issues/115
        if (CONTAIN_CHINESE_REGEXP.test(address)) {
            address = address.split(' ').map((part) => {
                return pinyin(part, {
                    style: pinyin.STYLE_NORMAL,
                }).join('');
            }).join(' ');
        }
        
        return address.trim();
    }

    private async recordInvalidAddress(address: string):Promise<LocationData>  {
        const location:LocationData = {
            address: address,
            valid: LocationState.INVALID,
            countryCode: DEFAULT_COUNTRY_CODE,
            regionCode: DEFAULT_REGION_CODE,
            state: '',
            city: '',
            formattedAddress: '',
            longitude: null,
            latitude: null,
            provider: LocationProvider.VALIDATOR
        };

        if (address) {
            this.addressCache.set(location);
        }

        return location;
    }

}

export class LocationCache {
    private logger: Consola;
    private pool: Pool;
    private memoryCache: LRUCache<string, LocationData>;

    constructor() {
        // Init logger.
        this.logger = consola.withTag('locator-cache');

        // Init TiDB client.
        this.pool = createPool(getConnectionOptions({
            connectionLimit: 3
        }));

        // Init Cache.
        this.memoryCache = new LRUCache<string, any>({
            max: 50000,
            maxSize: 50000,
            sizeCalculation: (value, key) => {
                return 1
            },
        });
    }

    async get(address: string): Promise<LocationData | undefined> {
        if (this.memoryCache.has(address)) {
            return this.memoryCache.get(address);
        }

        try {
            const [rows] = await this.pool.query<any[]>(`
                SELECT
                    address, valid, formatted_address AS formattedAddress, country_code AS countryCode, 
                    region_code AS regionCode, state, city, longitude, latitude, provider
                FROM
                    location_cache
                WHERE
                    address = ?
            `, address);
            if (Array.isArray(rows) && rows.length === 1) {
                this.memoryCache.set(address, rows[0]);
                return rows[0];
            }
        } catch (err) {
            this.logger.error(`Failed to get location '${address}' from database: `, err);
        }
    }

    async set(location: LocationData):Promise<boolean> {
        const {
            address, valid = 0, formattedAddress = '', countryCode = DEFAULT_COUNTRY_CODE, regionCode = DEFAULT_REGION_CODE, 
            state = '', city = '', longitude = null, latitude = null, provider = LocationProvider.UNKNOWN
        } = location;
        this.memoryCache.set(address, location);

        try {
            await this.pool.query(`
                INSERT IGNORE INTO location_cache (
                    address, valid, formatted_address, country_code, region_code, state, city, 
                    longitude, latitude, provider
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            `, [address, valid, formattedAddress, countryCode, regionCode, state, city, longitude, latitude, provider]);
            return false;
        } catch (err) {
            this.logger.error(`Failed to save location '${address}' to database: `, err);
            return false;
        }
    }

}
