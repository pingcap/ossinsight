import {AddressWithCnt, GithubUserDao} from "@dao/github-user-dao";
import {AppConfig} from "@env";
import {Locator} from "@libs/locator/Locator";
import {PrismaClient} from "@prisma/client";
import {RegionCodeMapping} from "@typings/github";
import async from "async";
import {Command} from "commander";
import {existsSync, readFileSync} from "fs";
import path from "path";
import {Logger} from "pino";
import YAML from "yaml";

/**
 * @sub-command sync-github users format-address
 * @description Format users address in batch.
 */
export function initFormatAddressCommand(command: Command, config: AppConfig, logger: Logger) {
  command.command('format-address')
    .description('Format users address in batch.')
    .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 10)
    .action(async (options) => {
      const {concurrent} = options;

      // Init GitHub User DAO.
      const prisma = new PrismaClient();
      const githubUserDao = new GithubUserDao(logger, prisma);

      // Init Location Locator.
      const geoLocator = new Locator(logger, prisma, loadRegionCodeMap(logger));

      logger.info('Start address formatting in batch.');
      await formatAddressInBatch(logger, githubUserDao, geoLocator, concurrent);
      logger.info('Finished address formatting in batch.');
    });
}

export async function formatAddressInBatch(logger: Logger, githubUserDao: GithubUserDao, geoLocator: Locator, concurrent: number) {
  // Workers ready.
  const queue = async.queue<AddressWithCnt>(async (addressItem) => {
    const {address, cnt} = addressItem;
    try {
      const location = await geoLocator.geocode(address);
      const affectedRows = await githubUserDao.updateUserLocationByAddress(address, location);
      logger.info(
        `Formatted ${affectedRows} / ${cnt} addresses, address: ${address}, country code: ${location.countryCode}, region code: ${location.regionCode}.`
      );
    } catch (err) {
      logger.error(`Failed to format address ${address}`, err);
    }
  }, concurrent);

  // Generate jobs.
  let started = false;
  while (true) {
    if (started) {
      await queue.empty();
    }
    started = true;

    const addressItems = await githubUserDao.getAddressWithCount();
    if (!Array.isArray(addressItems) || addressItems.length === 0) {
      break;
    }

    logger.info(`Processing ${addressItems.length} address in ${concurrent} concurrent.`);
    for (let addressItem of addressItems) {
      await queue.push(addressItem);
    }
  }
}

export function loadRegionCodeMap(logger: Logger) {
  let regionCodeMap: Record<string, string> = {};
  // Please follow ISO 3166-1 alpha-2: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
  const configFile = path.resolve(__dirname, '@region-code-mappings.yaml');
  if (existsSync(configFile)) {
    const originFile = readFileSync(configFile, 'utf8');
    const {mappings} = YAML.parse(originFile) as { mappings: RegionCodeMapping[] };

    if (Array.isArray(mappings)) {
      for (let mapping of mappings) {
        regionCodeMap[mapping.region_code] = mapping.country_code
      }
      logger.info(`Found ${mappings.length} region code mappings:`, regionCodeMap);
    }
  } else {
    logger.info(`Didn't found region-code-mappings.yaml file.`);
  }
  return regionCodeMap;
}