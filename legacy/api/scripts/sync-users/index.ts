import consola from 'consola';
import * as dotenv from "dotenv";
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import YAML from 'yaml';
import { Command } from 'commander';
import { DateTime, DurationLike } from 'luxon';
import { createPool } from 'mysql2/promise';
import { RegionCodeMapping } from './types';
import { syncUsersFromTimeRangeSearch } from './syncer';
import { formatAddressInBatch, formatOrgNamesInBatch, identifyBotsInBatch, loadOrgsToDatabase, Organization } from './processer';
import { getConnectionOptions } from '../../app/utils/db';
import { LocationCache, Locator } from '../../app/locator/Locator';
import { createSyncUsersWorkerPool } from './loader';

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('sync-users-data');

async function main() {
    const program = new Command();
    program.name('sync-users')
        .description('Sync GitHub users public data to database.')
        .version('0.1.0');

    program.command('sync-from-time-range-search')
        .description('Import the database in batches according to the user creation time with GitHub search API.')
        .requiredOption<DateTime>(
            '--from <datetime>',
            'The start time of time range, which is followed SQL date time format. Default: "2018-02-08".',
            (value) => DateTime.fromSQL(value),
            // GitHub was founded in 2008: https://en.wikipedia.org/wiki/GitHub
            DateTime.fromSQL('2008-02-08')
        )
        .requiredOption<DateTime>(
            '--to <datetime>',
            'The end time of time range, which is followed SQL date time format. Default: now.',
            (value) => DateTime.fromSQL(value),
            DateTime.now()
        )
        .requiredOption<DurationLike>(
            '--chunk-size <duration>',
            `The chunk size is used to spilt the large task to many small subtask, so that we can process them 
in concurrent. For example: --chunk-size='{ "days": 1 }'`,
            (value) => JSON.parse(value),
            { days: 1 }
        )
        .requiredOption<DurationLike>(
            '--step-size <duration>',
            `The step size is used to control what is the interval of repository creation time for a request 
to obtain data. For example: --step-size='{ "minutes": 10 }'
`,
            (value) => JSON.parse(value),
            { minutes: 10 }
        )
        .option('--filter [string]', `The query variable of GitHub GraphQL search API.
Reference: https://docs.github.com/en/search-github/searching-on-github/searching-users`)
        .action(async (options) => {
            // Handle the command arguments.
            let { from, to, chunkSize, stepSize, filter } = options;

            const gitHubTokens = (process.env.SYNC_GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
            if (gitHubTokens.length === 0) {
                logger.error('Must provide `SYNC_GH_TOKENS`.');
                process.exit();
            }

            // Init Worker Pool.
            const workerPool = createSyncUsersWorkerPool(gitHubTokens);

            logger.info(`Start sync users for time range from ${from} to ${to}.`);
            await syncUsersFromTimeRangeSearch(workerPool, from, to, chunkSize, stepSize, filter);
            logger.success(`Finished sync users for time range from ${from} to ${to}.`);

            workerPool.clear();
        });

    program.command('format-address-in-batch')
        .description('Format users address in batch.')
        .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 10)
        .action(async (options) => {
            const { concurrent } = options;

            // Init TiDB client.
            const pool = createPool(getConnectionOptions({
                connectionLimit: concurrent
            }));

            // Init Location Locator.
            const locationCache = new LocationCache();
            const geoLocator = new Locator(locationCache, loadRegionCodeMap());

            logger.success('Start address formatting in batch.');
            await formatAddressInBatch(logger, pool, geoLocator, concurrent);
            logger.success('Finished address formatting in batch.');

            pool.end();
        });

    program.command('identify-bots')
        .description('Identify bots and update the `is_bot` field.')
        .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 4)
        .action(async (options) => {
            const { concurrent } = options;

            // Init TiDB client.
            const pool = createPool(getConnectionOptions({
                connectionLimit: concurrent
            }));

            const botLogins = loadBotLoginsConfig();
            logger.info(`Found ${botLogins.length} bot logins.`);

            logger.success('Start bots identifying in batch.');
            await identifyBotsInBatch(logger, pool, concurrent, botLogins);
            logger.success('Finished bots identifying in batch.');

            pool.end();
        });

    program.command('load-orgs-from-file')
        .description('Load organization information from file.')
        .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 4)
        .action(async (options) => {
            const { concurrent } = options;

            // Init TiDB client.
            const pool = createPool(getConnectionOptions({
                connectionLimit: 2
            }));

            const organizations = loadOrganizationConfig();
            logger.info(`Found ${organizations.length} organizations.`);

            logger.success('Start organization name formatting.');
            await loadOrgsToDatabase(logger, pool, concurrent, organizations);
            logger.success('Finished organization name formatting.');

            pool.end();
        });

    program.command('format-orgs')
        .description('Format organization name of users in batch.')
        .action(async (options) => {
            // Init TiDB client.
            const pool = createPool(getConnectionOptions({
                connectionLimit: 2
            }));

            logger.success('Start organization\'s name formatting.');
            await formatOrgNamesInBatch(logger, pool);
            logger.success('Finished organization\'s name formatting.');

            pool.end();
        });

    program.parse();
}

function loadRegionCodeMap() {
    let regionCodeMap:Record<string, string> = {};
    // Please follow ISO 3166-1 alpha-2: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
    const configFile = path.resolve(__dirname, '../../region-code-mappings.yaml');
    if (existsSync(configFile)) {
        const originFile = readFileSync(configFile, 'utf8');
        const { mappings } = YAML.parse(originFile) as { mappings: RegionCodeMapping[]};

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

function loadBotLoginsConfig() {
    const configFile = path.resolve(__dirname, '../../bots.yaml');
    if (existsSync(configFile)) {
        const originFile = readFileSync(configFile, 'utf8');
        const { bot_github_logins } = YAML.parse(originFile) as { bot_github_logins: string[]};

        if (Array.isArray(bot_github_logins)) {
            return bot_github_logins;
        }
    } else {
        logger.info(`Didn't found bots.yaml file.`);
    }
    return [];
}

function loadOrganizationConfig() {
    const configFile = path.resolve(__dirname, '../../organizations.yaml');
    if (existsSync(configFile)) {
        const originFile = readFileSync(configFile, 'utf8');
        const { organizations } = YAML.parse(originFile) as { organizations: Organization[]};

        if (Array.isArray(organizations)) { 
            return organizations;
        }
    }
    return [];
}

main();
