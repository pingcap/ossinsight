import * as dotenv from "dotenv";
import path from 'path';
import consola from "consola";
import { Command } from "commander";
import { createPool } from "mysql2/promise";
import { DateTime, DurationLike } from "luxon";
import { getConnectionOptions } from "../../app/utils/db";
import {  pullReposWithLang, pullReposWithoutLang } from "./puller";
import { syncReposInBatch, syncReposInConcurrent } from "./syncer";
import { createSyncReposWorkerPool } from "./loader";
import { createWorkerPool } from "../../app/core/GenericJobWorkerPool";
import { markDeletedRepos } from "./post-processer";

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

// Init logger.
const logger = consola.withTag('sync-repos');

const DEFAULT_TIME_RANGE_FILED = 'created';

const DEFAULT_SPECIFY_SYNC_REPOS_SQL = `
SELECT repo_id AS repoId, repo_name AS repoName
FROM github_repos
WHERE last_event_at != 0 AND (DATEDIFF(last_event_at, refreshed_at) > 5 OR refreshed_at = 0) AND is_deleted = 0
ORDER BY last_event_at DESC
LIMIT 1000
`;

async function main() {
    const program = new Command();
    program.name('sync-repos')
        .version('0.1.0')
        .description(`Sync GitHub repositories public data to database (MySQL/TiDB).
There is a common workflow: 
1. sync-repos sync-from-time-range-search
2. sync-repos pull-repos-with-language
3. sync-repos pull-repos-without-language
4. sync-repos mark-deleted-repos
5. sync-repos sync-repos-in-concurrent
`);

    // Sync repos in batch by GitHub GraphQL API.
    program.command('sync-from-time-range-search')
        .description('Sync repos in batch by GitHub search API.')
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

            await syncReposInBatch(workerPool, timeRangeField, from, to, chunkSize, stepSize, filter, skipSyncRepoLanguages, skipSyncRepoTopics);

            // Clear worker pool.
            workerPool.clear();
        });

    // Pull GitHub repositories with primary language from `github_events` table.
    program.command('pull-repos-with-language')
        .description('Pull repositories data from github_events table.')
        .requiredOption<DateTime>(
            '--from <datetime>',
            'The start time of time range, which is followed SQL date time format. Default: "2011-01-01".',
            (value) => DateTime.fromSQL(value),
            // GitHub was founded in 2008: https://en.wikipedia.org/wiki/GitHub
            DateTime.fromSQL('2011-01-01')
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
            'Specify how many repos that will be imported at once.',
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

    // Mark deleted repos.
    program.command('mark-deleted-repos')
        .description('Mark deleted repositories in th `github_repos` table.')
        .action(async (options) => {
            const gitHubTokens = (process.env.SYNC_GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
            if (gitHubTokens.length === 0) {
                logger.error('Must provide `SYNC_GH_TOKENS`.');
                process.exit();
            }

            // Init logger.
            logger.withTag('marked-deleted-repos');

            // Init Worker Pool.
            const workers = createWorkerPool<any>(gitHubTokens);
            const connections = createPool(getConnectionOptions({
                connectionLimit: 2
            }));

            await markDeletedRepos(logger, workers, connections, 4000);

            workers.clear();
            connections.end();
        });

    // Sync repos in concurrent by GitHub REST API.
    program.command('sync-repos-in-concurrent')
        .option<string>(
            '--sql <SQL>',
            `Specify which repositories need to be synchronized through SQL query results.`,
            (value) => String(value),
            DEFAULT_SPECIFY_SYNC_REPOS_SQL
        )
        .option<number>(
            '--concurrent-per-token <number>',
            `Specify how much concurrent per token.`,
            (value) => Number(value),
            4
        )
        .option<boolean>(
            '--skip-sync-repo-topics <bool>',
            `Skip sync the topics tagged for the repository.`,
            (value) => Boolean(value),
            false
        )
        .description('Sync repos in concurrent by GitHub REST API.')
        .action(async (options) => {
            // Handle the command arguments.
            let { sql, concurrentPerToken, skipSyncRepoLanguages, skipSyncRepoTopics } = options;

            const gitHubTokens = (process.env.SYNC_GH_TOKENS || '').split(',').map(s => s.trim()).filter(Boolean);
            if (gitHubTokens.length === 0) {
                logger.error('Must provide `SYNC_GH_TOKENS`.');
                process.exit();
            }

            // Init Worker Pool.
            const tokens = [];
            for (let i = 1; i <= concurrentPerToken; i++) {
                tokens.push(...gitHubTokens);
            }

            const workerPool = createSyncReposWorkerPool(tokens);
            const connections = createPool(getConnectionOptions({
                connectionLimit: 2
            }));

            await syncReposInConcurrent(workerPool, connections, sql, skipSyncRepoLanguages, skipSyncRepoTopics);

            // Clear worker pool.
            await workerPool.clear();
            await connections.end();
        });

    program.parse();
}

main();

