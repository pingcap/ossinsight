import 'reflect-metadata';
import { ChainProvider, GoogleMapsProvider } from '@goparrot/geocoder';
import axios, { AxiosInstance } from 'axios';
import consola, { Consola } from "consola";
import LRUCache from 'lru-cache';
import pinyin from 'pinyin';
import { Connection, createConnection } from "mysql2";
import { NominatimProvider } from './provider/nominatim';

const ADDRESS_MIN_LENGTH = 5;
const ADDRESS_MAX_LENGTH = 50;
const INVALID_ADDRESS_REGEXPS = [
    /http(s)*:\/\/.*/,
    /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/,
    /(-)*\d+.\d+,\s*(-)*\d+.\d+/,
];
const REPLACE_WITH_EMPTY_TOKENS = [/(\（|\().+(\）|\))/g, '省', '市', '区', '-', '，', '*', '#', '•', '.', ',', '·', '.', '/', '、'];
const CONTAIN_CHINESE_REGEXP = /.*[\u4e00-\u9fa5]+.*$/;

export enum LocationProvider {
    GOOGLE_MAPS = "GOOGLE_MAPS",
    NOMINATIM = "NOMINATIM",
    VALIDATOR = "VALIDATOR"
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
    countryCode?: string;
    state?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
    provider?: LocationProvider;
}

export class Locator {
    private logger: Consola;
    private geocoder: ChainProvider;
    private addressCache: LocationCache;

    constructor(addressCache: LocationCache) {
        // Init logger.
        this.logger = consola.withTag('locator');

        // Init GeoCoder.
        const axiosInstance: AxiosInstance = axios.create();
        const providers = [];
        providers.push(new NominatimProvider(axiosInstance));
        if (process.env.GOOGLE_MAPS_API_KEY !== undefined && process.env.GOOGLE_MAPS_API_KEY !== '') {
            providers.push(new GoogleMapsProvider(axiosInstance, process.env.GOOGLE_MAPS_API_KEY));
        }
        this.geocoder = new ChainProvider(providers);
        this.addressCache = addressCache;
    }

    async geocode(address?: string):Promise<LocationData | undefined> {
        if (address === undefined || address === null) {
            return undefined;
        }

        address = this.processAddress(address);
        const cacheAddress = await this.addressCache.get(address)
        if (cacheAddress !== undefined) {
            return cacheAddress;
        }
        
        if (!Locator.isAddressValid(address)) {
            this.recordInvalidAddress(address);
            return undefined;
        }

        try {
            // GeoCode address by API.
            const locations = await this.geocoder.geocode({
                address: address
            });

            if (!Array.isArray(locations) || locations.length < 1) {
                this.recordInvalidAddress(address);
                return undefined;
            }

            const { formattedAddress, countryCode, state, city, longitude, latitude, provider } = locations[0];
            const providerName = providerNameMap[provider];
            const result:LocationData = {
                address: address,
                valid: LocationState.VALID,
                formattedAddress: formattedAddress,
                countryCode: countryCode,
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
            this.recordInvalidAddress(address);
            return undefined;
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
            address = address.replaceAll(t, '');
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

    private recordInvalidAddress(address: string) {
        this.addressCache.set({
            address: address,
            valid: LocationState.INVALID,
            provider: LocationProvider.VALIDATOR
        });
    }

}

export class LocationCache {
    private logger: Consola;
    private dbClient: Connection;
    private memoryCache: LRUCache<string, LocationData>;

    constructor() {
        // Init logger.
        this.logger = consola.withTag('locator-cache');

        // Init TiDB client.
        this.dbClient = createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '4000'),
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            queueLimit: 10,
            decimalNumbers: true,
            timezone: 'Z'
        });

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

        return new Promise((resolve, reject) => {
            this.dbClient.query(`
                SELECT
                    address, valid, formatted_address AS formattedAddress, country_code AS countryCode, 
                    state, city, longitude, latitude, provider
                FROM
                    location_cache
                WHERE
                    address = ?
            `,
            address,
            (err, rows: any[]) => {
                if (err) {
                    this.logger.error(`Failed to get location '${address}' from database: `, err);
                    reject(err);
                } else {
                    if (Array.isArray(rows) && rows.length === 1) {
                        this.memoryCache.set(address, rows[0]);
                        resolve(rows[0]);
                    } else {
                        resolve(undefined);
                    }
                }
            });
        });
    }

    async set(location: LocationData):Promise<boolean> {
        const {
            address, valid, formattedAddress = null, countryCode = null, state = null, city = null, 
            longitude = null, latitude = null, provider = null
        } = location;
        this.memoryCache.set(address, location);

        return new Promise((resolve, reject) => {
            this.dbClient.execute(`
                INSERT IGNORE INTO location_cache (
                    address, valid, formatted_address, country_code, state, city, longitude, latitude, provider
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            `,
            [address, valid, formattedAddress, countryCode, state, city, longitude, latitude, provider],
            (err) => {
                if (err) {
                    this.logger.error(`Failed to save location '${address}' to database: `, err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            }) as any;
        });
    }

}
