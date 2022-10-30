import * as dotenv from "dotenv";
import * as path from 'path'
import consola from "consola";
import { getConnectionOptions } from "../../app/utils/db";
import { createPool, Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import async from "async";
import schedule from 'node-schedule';
import { DateTime } from "luxon";
import { Command } from "commander";

// Init logger.
const logger = consola.withTag('calc-repo-milestones');

// Load environments.
dotenv.config({ path: path.resolve(__dirname, '../../.env.template') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

enum EventType {
    WATCH_EVENT = 'WatchEvent',
    ISSUES_EVENT = 'IssuesEvent',
    PULL_REQUEST_EVENT = 'PullRequestEvent'
}

enum IssuesEventTypeAction {
    OPENED = 'opened',
    CLOSED = 'closed'
}

enum PullRequestEventTypeAction {
    OPENED = 'opened',
    CLOSED = 'closed'
}

enum MilestoneType {
    STARS_EARNED = 1,
    PULL_REQUEST_MERGED = 2,
    PULL_REQUEST_CREATORS_HAD = 3,
    ISSUES_RECEIVED = 4,
    SHOW_IN_TRENDING_REPOS = 5,
    ADDED_IN_COLLECTIONS = 6
}

const STARS_EARNED_STEPS = [100, 500, 1024, 2000, 5000, 10000, 20000, 50000, 100000, 200000];
const PULL_REQUESTS_MERGED_STEPS = [1, 100, 500, 1024, 2000, 5000, 10000, 20000, 50000, 100000];
const PULL_REQUEST_CREATORS_HAD_STEPS = [1, 50, 100, 500, 1024, 2000, 5000];
const ISSUES_RECEIVED_STEPS = [1, 20, 100, 500, 1024, 2000, 5000, 10000, 50000, 100000];

interface Event extends RowDataPacket{
    index: number,
    repoId: number,
    repoName: string,
    type: string,
    action: string
}

function main() {
    const program = new Command();
    program.name('calc-repo-milestones')
        .description('Calc repository milestones.')
        .version('0.1.0')
        .option<DateTime>(
            '--from [datetime]',
            'The start time of time range, which is followed SQL date time format.',
            (value) => DateTime.fromSQL(value),
            DateTime.fromSQL('2011-01-01')
        )
        .option<DateTime>(
            '--to [datetime]',
            'The end time of time range, which is followed SQL date time format.',
            (value) => DateTime.fromSQL(value),
            DateTime.now()
        )
        .option(
            '--once',
            'If only execute once.'
        )
        .requiredOption<string>(
            '--cron <cron>',
            'The cron expression to control the period of execution of computational tasks.',
            (value) => String(value),
            '0 0 * * * *'
        )
        .requiredOption<number>('--concurrent <num>', '', (value) => Number(value), 10)
        .action(async (options) => {
            // Handle the command arguments.
            let { from, to, once, cron, concurrent } = options;
            
            // Init TiDB client.
            const pool = createPool(getConnectionOptions({
                connectionLimit: concurrent
            }));

            if (once) {
                logger.info('mode: execute once');
                await calcRepoMilestonesInConcurrent(pool, concurrent, from, to);
            } else {
                logger.info(`mode: cron (${cron})`);
                schedule.scheduleJob(cron, async () => {
                    const to = DateTime.now();
                    const from = to.minus({ hours: 1 });

                    await calcRepoMilestonesInConcurrent(pool, concurrent, from, to);
                });
            }
        });

    program.parse();
};

main();

async function calcRepoMilestonesInConcurrent(pool: Pool, concurrent: number, from: DateTime, to: DateTime) {
    const queue = async.queue<Event>(async (event) => {
        const { index, repoId, repoName, type, action } = event;
        logger.info(`[${index}] Handle repo <${repoName}> with id ${repoId}.`);

        // Milestone: the number of issues received.
        if (type === EventType.ISSUES_EVENT && action === IssuesEventTypeAction.OPENED) {
            await checkIssueReceivedMilestones(pool, repoId, repoName)
        }

        // Milestone: the number of stars earned.
        if (type === EventType.WATCH_EVENT) {
            await checkStarsEarnedMilestones(pool, repoId, repoName);
        }

        // Milestone: the number of merged pull request.
        if (type === EventType.PULL_REQUEST_EVENT && action === PullRequestEventTypeAction.CLOSED) {
            await checkPullRequestMergedMilestones(pool, repoId, repoName);
        }

        // Milestone: the number of pull request creators.
        if (type === EventType.PULL_REQUEST_EVENT && action === PullRequestEventTypeAction.OPENED) {
            await checkPullRequestCreatorsMilestones(pool, repoId, repoName);
        }
    }, concurrent);

    let page = 1, pageSize = 20000, i = 0;
    while (true) {
        const offset = (page - 1) * pageSize;
        logger.info(`Fetching events for time range from ${from.toSQL()} to ${to.toSQL()}, page: ${page}.`);
        const [events] = await pool.execute<Event[]>(`
            SELECT repo_id AS repoId, ANY_VALUE(repo_name) AS repoName, type, action, COUNT(1) AS events
            FROM github_events ge
            WHERE type IN ('PullRequestEvent', 'WatchEvent', 'IssuesEvent')  AND created_at BETWEEN ? AND ?
            GROUP BY repo_id, type, action
            ORDER BY events DESC
            LIMIT ?, ?
        `, [from.toSQL(), to.toSQL(), offset, pageSize]);
    
        if (!Array.isArray(events) || events.length === 0) {
            break;
        } else {
            logger.info(`Fetched ${events.length} events for time range from ${from.toSQL()} to ${to.toSQL()}, page: ${page}.`);
        }
    
        for (const event of events) {
            event.index = i++;
            queue.push(event);
        }

        if (queue.started) {
            await queue.drain();
        }
    }
}

async function checkIssueReceivedMilestones(pool:Pool, repoId: number, repoName: string) {
    const [issueReceivedRS] = await pool.query<ResultSetHeader>(`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, created_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'IssuesEvent'
                AND repo_id = ?
                AND action = 'opened'
        ) AS sub
        WHERE row_num IN (?)
        ON DUPLICATE KEY UPDATE id = id;
    `, [MilestoneType.ISSUES_RECEIVED, repoId, ISSUES_RECEIVED_STEPS]);
    logger.info(`Insert or update ${issueReceivedRS.affectedRows} <issues_received> milestones for repo ${repoName} with ID ${repoId}.`);
}

async function checkStarsEarnedMilestones(pool:Pool, repoId: number, repoName: string) {
    const [starsEarnedRS] = await pool.query<ResultSetHeader>(`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, created_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'WatchEvent'
                AND repo_id = ?
        ) AS sub
        WHERE row_num IN (?)
        ON DUPLICATE KEY UPDATE id = id;
    `, [MilestoneType.STARS_EARNED, repoId, STARS_EARNED_STEPS]);
    logger.info(`Insert or update ${starsEarnedRS.affectedRows} <stars_earned> milestones for repo ${repoName} with ID ${repoId}.`);
}

async function checkPullRequestMergedMilestones(pool: Pool, repoId: number, repoName: string) {
    const [prMergedRS] = await pool.query<ResultSetHeader>(`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, created_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, created_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY created_at) AS row_num, created_at
            FROM github_events ge
            WHERE
                type = 'PullRequestEvent'
                AND repo_id = ?
                AND action = 'closed'
                AND pr_merged = true
        ) AS sub
        WHERE row_num IN (?)
        ON DUPLICATE KEY UPDATE id = id;
    `, [MilestoneType.PULL_REQUEST_MERGED, repoId, PULL_REQUESTS_MERGED_STEPS]);
    logger.info(`Insert or update ${prMergedRS.affectedRows} <pull_request_merged> milestones for repo ${repoName} with ID ${repoId}.`);
}

async function checkPullRequestCreatorsMilestones(pool: Pool, repoId: number, repoName: string) {
    const [prCreatorsRS] = await pool.query<ResultSetHeader>(`
        INSERT INTO repo_milestones(repo_id, milestone_type_id, milestone_number, payload, created_at)
        SELECT repo_id, ? AS milestone_type_id, row_num AS milestone_number, NULL, first_pr_at
        FROM (
            SELECT repo_id, ROW_NUMBER() OVER (ORDER BY first_pr_at) AS row_num, first_pr_at
            FROM (
                SELECT
                    repo_id,
                    actor_login,
                    MIN(created_at) AS first_pr_at
                FROM github_events ge
                WHERE
                    type = 'PullRequestEvent'
                    AND repo_id = ?
                    AND action = 'opened'
                GROUP BY repo_id, actor_login
            ) sub
        ) AS sub
        WHERE row_num IN (?)
        ON DUPLICATE KEY UPDATE id = id;
    `, [MilestoneType.PULL_REQUEST_CREATORS_HAD, repoId, PULL_REQUEST_CREATORS_HAD_STEPS]);
    logger.info(`Insert or update ${prCreatorsRS.affectedRows} <pull_request_creator_had> milestones for repo ${repoName} with ID ${repoId}.`);
}
