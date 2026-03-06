import {LocationCacheItem, PrismaClient} from "@prisma/client";
import {DEFAULT_COUNTRY_CODE, DEFAULT_REGION_CODE, LocationProvider} from "@libs/locator/Locator";

export class LocationCacheDao {

  constructor(readonly prisma: PrismaClient) {
  }

  async findFirstByAddress(address: string): Promise<LocationCacheItem | null> {
    return await this.prisma.locationCacheItem.findFirst({
      where: {
        address: address
      }
    });
  }

  async updateLocationCache(location: LocationCacheItem) {
    const {
      address,
      valid = false,
      formattedAddress = '',
      countryCode = DEFAULT_COUNTRY_CODE,
      regionCode = DEFAULT_REGION_CODE,
      state = '',
      city = '',
      longitude = null,
      latitude = null,
      provider = LocationProvider.UNKNOWN
    } = location;

    this.prisma.locationCacheItem.upsert({
      create: location,
      update: {
        valid: valid,
        formattedAddress: formattedAddress,
        countryCode: countryCode,
        regionCode: regionCode,
        state: state,
        city: city,
        longitude: longitude,
        latitude: latitude,
        provider: provider
      },
      where: {
        address: address
      }
    });
  }
}