import { BatchLoader } from "../../app/core/BatchLoader";
import { GitHubUser } from "./types";
import * as crypto from 'crypto';
import { Pool } from "mysql2/promise";
import { createWorkerPool } from "../../app/core/GenericJobWorkerPool";

export const BOT_LOGIN_REGEXP = /^(bot-.+|.+bot|.+\[bot\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$/i;

export interface WorkerPayload {
    userLoader: BatchLoader;
}

const INSERT_USERS_SQL = `INSERT INTO github_users(
    id, login, type, is_bot, name, email, organization, address, public_repos, followers, followings, created_at, updated_at
  ) VALUES ?
  ON DUPLICATE KEY UPDATE
    login = VALUES(login), type = VALUES(type), is_bot = VALUES(is_bot), name = VALUES(name), email = VALUES(email), organization = VALUES(organization),
    address = VALUES(address), public_repos = VALUES(public_repos), followers = VALUES(followers), 
    followings = VALUES(followings), created_at = VALUES(created_at), updated_at = VALUES(updated_at)
;`;

export function createSyncUsersWorkerPool(tokens: string[]) {
    return createWorkerPool<WorkerPayload>(tokens, (connections: Pool) => {
        return {
            userLoader: new BatchLoader(connections, INSERT_USERS_SQL, {
                batchSize: 2000
            }),              
        }
    }, async ({ userLoader }: WorkerPayload) => {
        await userLoader.flush();
    });
}

// Load GitHub users.
export async function loadGitHubUsers(userLoader: BatchLoader, users: GitHubUser[]): Promise<number> {
    for (const user of users) {
        await loadGitHubUser(userLoader, user);
    }
    return users.length;
}

export async function loadGitHubUser(userLoader: BatchLoader, user: GitHubUser) {
    let {
        id, login, type, name, email, organization, address, 
        public_repos, followers, following, createdAt, updatedAt
    } = user;

    const isBot = BOT_LOGIN_REGEXP.test(login);
    address = trimAddress(address);
    organization = trimOrganizationName(organization);
    email = encodeEmail(email);

    await userLoader.insert([
        id, login, type, isBot, name, email, organization, address, 
        public_repos, followers, following, createdAt, updatedAt
    ]);
}

// Utils.

function trimOrganizationName(organizationName?: string | null):string {
    if (organizationName === undefined || organizationName === null) return '';
    return organizationName.trim()
}

function trimAddress(addressName?: string | null):string {
    if (addressName === undefined || addressName === null) return '';
    return addressName.trim()
}

function encodeEmail(email?: string | null):string {
    if (email === undefined || email === null) return '';

    const parts = email.split('@');
    if (parts.length !== 2) {
        return '';
    }

    const unique = parts[0];
    const suffix = parts[1];

    const hmac = crypto.createHmac('sha256', process.env.ENCODE_EMAIL_SECRET_KEY || 'secret-key');
    hmac.update(unique);
    const encoded = hmac.digest('hex');

    return `${encoded}@${suffix}`; 
}