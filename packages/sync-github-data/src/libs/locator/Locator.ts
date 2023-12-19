import {LocationCacheDao} from "@dao/location-cache-dao";
import {ChainProvider, GoogleMapsProvider} from '@goparrot/geocoder';
import {LocationCache} from "@libs/locator/LocationCache";
import {LocationCacheItem, Prisma, PrismaClient} from "@prisma/client";
import axios, {AxiosInstance} from 'axios';
import {NominatimProvider} from 'libs/locator/provider/nominatim';
import {Logger} from "pino";
import { pinyin } from 'pinyin-pro';
import 'reflect-metadata';

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

export const providerNameMap: Record<string, LocationProvider> = {
  'GoogleMapsProvider': LocationProvider.GOOGLE_MAPS,
  'NominatimProvider': LocationProvider.NOMINATIM
}

export class Locator {
  private logger: Logger;
  private geocoder: ChainProvider;
  private addressCache: LocationCache;
  private readonly regionCodeMap: Record<string, string>;

  constructor(pLogger: Logger, prisma: PrismaClient, regionCodeMap?: Record<string, string>) {
    // Init logger.
    this.logger = pLogger.child({
      module: 'locator'
    });

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

    // Init address cache.
    const locationCacheDao = new LocationCacheDao(prisma);
    this.addressCache = new LocationCache(pLogger, locationCacheDao);

    // Init region code map.
    this.regionCodeMap = regionCodeMap ? regionCodeMap : {};
  }

  private static isAddressValid(address: string): boolean {
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

  async geocode(address: string): Promise<LocationCacheItem> {
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

      const {formattedAddress, countryCode: regionCode, state, city, longitude, latitude, provider} = locations[0];
      const countryCode = regionCode && this.regionCodeMap[regionCode] ? this.regionCodeMap[regionCode] : regionCode;
      const providerName = providerNameMap[provider];
      const result: LocationCacheItem = {
        address: address,
        valid: true,
        formattedAddress: formattedAddress || '',
        countryCode: countryCode || '',
        regionCode: regionCode || '',
        state: state || null,
        city: city || null,
        longitude: new Prisma.Decimal(longitude),
        latitude: new Prisma.Decimal(latitude),
        provider: providerName,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await this.addressCache.set(result);
      return result;
    } catch (err: any) {
      this.logger.error(`Failed to geocode for address ${address}:`, err);
      return this.recordInvalidAddress(address);
    }
  }

  private processAddress(address: string): string {
    for (const t of REPLACE_WITH_EMPTY_TOKENS) {
      address = address.replaceAll(t, ' ');
    }

    // Process for issue goparrot/geocoder#115, first convert chinese place names into pinyin,
    // and then make a request through the API.
    // Link: https://github.com/goparrot/geocoder/issues/115
    if (CONTAIN_CHINESE_REGEXP.test(address)) {
      address = this.convertToPinYin(address);
    }

    return address.trim();
  }

  private convertToPinYin(address: string): string {
    return address.split(' ').map((part) => {
      return pinyin(part, {
        toneType: 'none',
        type: 'array'
      }).join('');
    }).join(' ');
  }

  private async recordInvalidAddress(address: string): Promise<LocationCacheItem> {
    const location: LocationCacheItem = {
      address: address,
      valid: false,
      countryCode: DEFAULT_COUNTRY_CODE,
      regionCode: DEFAULT_REGION_CODE,
      state: '',
      city: '',
      formattedAddress: '',
      longitude: null,
      latitude: null,
      provider: LocationProvider.VALIDATOR,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (address) {
      await this.addressCache.set(location);
    }

    return location;
  }

}


