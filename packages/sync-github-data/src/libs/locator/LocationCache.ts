import {LocationCacheDao} from "@dao/location-cache-dao";
import {LocationCacheItem} from "@prisma/client";
import LRUCache from "lru-cache";
import {Logger} from "pino";

export class LocationCache {
  private logger: Logger;
  private memoryCache: LRUCache<string, LocationCacheItem>;

  constructor(pLogger: Logger, readonly locationCacheDao: LocationCacheDao) {
    // Init logger.
    this.logger = pLogger.child({
      module: 'location-cache'
    });

    // Init Cache.
    this.memoryCache = new LRUCache<string, any>({
      max: 50000,
      maxSize: 50000,
      sizeCalculation: () => {
        return 1
      },
    });
  }

  async get(address: string): Promise<LocationCacheItem | undefined> {
    try {
      if (this.memoryCache.has(address)) {
        return this.memoryCache.get(address);
      }

      const location = await this.locationCacheDao.findFirstByAddress(address);
      if (location) {
        this.memoryCache.set(address, location);
        return location;
      } else {
        return undefined;
      }
    } catch (err) {
      this.logger.error(`Failed to get location '${address}' from database: `, err);
    }
  }

  async set(location: LocationCacheItem): Promise<boolean> {
    try {
      this.memoryCache.set(location.address, location);
      await this.locationCacheDao.updateLocationCache(location);
      return true;
    } catch (err) {
      this.logger.error(`Failed to save location '${location.address}' to database: `, err);
      return false;
    }
  }
}