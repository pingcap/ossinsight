import * as dotenv from "dotenv";
import path from 'path';
import consola from "consola";
import { Command } from "commander";
import { createPool } from "mysql2/promise";
import { DateTime, DurationLike } from "luxon";
import { createWorkerPool } from "../../app/core/GenericJobWorkerPool";
import { getConnectionOptions } from "../../app/utils/db";
import {  pullReposWithLang, pullReposWithoutLang } from "./puller";
import { syncReposInConcurrent } from "./syncer";
import { createSyncReposWorkerPool } from "./loader";

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('sync-repos');

const DEFAULT_TIME_RANGE_FILED = 'created';

async function main() {
    const program = new Command();
    program.name('sync-repos')
        .description('Sync GitHub repositories public data to database (MySQL/TiDB).')
        .version('0.1.0');

    // Sync repos in batch by GitHub GraphQL API.
    program.command('sync-from-time-range-search')
        .description('Import the database in batches according to the repositories last pushed time with GitHub search API.')
        .requiredOption<String>(
            '--time-range-field <\'created\'|\'pushed\'>',
            'Search by when a repository was created or last updated. Default: "created".',
            (value) => value,
            DEFAULT_TIME_RANGE_FILED
        )
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
Reference: https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories`)
        .option<boolean>(
            '--skip-sync-repo-languages <bool>',
            `Skip sync the languages used in the repository.`,
            (value) => Boolean(value),
            false
        )
        .option<boolean>(
            '--skip-sync-repo-topics <bool>',
            `Skip sync the topics tagged for the repository.`,
            (value) => Boolean(value),
            false
        )
        .action(async (options) => {
            // Handle the command arguments.
            let { timeRangeField, from, to, chunkSize, stepSize, filter = null, skipSyncRepoLanguages, skipSyncRepoTopics } = options;

            const gitHubTokens = (process.env.SYNC_GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
            if (gitHubTokens.length === 0) {
                logger.error('Must provide `SYNC_GH_TOKENS`.');
                process.exit();
            }

            // Init Worker Pool.
            const workerPool = createSyncReposWorkerPool(gitHubTokens);

            await syncReposInConcurrent(workerPool, timeRangeField, from, to, chunkSize, stepSize, filter, skipSyncRepoLanguages, skipSyncRepoTopics);

            // Clear worker pool.
            workerPool.clear();
        });

    // Pull GitHub repositories with primary language from `github_events` table.
    program.command('pull-repos-with-language')
        .description('Pull repositories data from github_events table.')
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
        .action(async (options) => {
            // Handle the command arguments.
            let { from, to } = options;

            // Init Worker Pool.
            const pool = createPool(getConnectionOptions());

            await pullReposWithLang(pool, from, to);

            pool.end();
        });

    // Pull GitHub repositories without primary language from `github_events` table.
    program.command('pull-repos-without-language')
        .description('Pull repositories data from github_events table.')
        .requiredOption<number>(
            '--limit <number>',
            'The start time of time range, which is followed SQL date time format. Default: "2018-02-08".',
            (value) => Number(value),
            100000
        )
        .action(async (options) => {
            // Handle the command arguments.
            let { limit } = options;

            // Init Worker Pool.
            const pool = createPool(getConnectionOptions());
            const minRows = 1;

            await pullReposWithoutLang(pool, limit, minRows);

            pool.end();
        });

    program.parse();
}

main();
