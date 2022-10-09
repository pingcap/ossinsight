import { BatchLoader } from "../../app/core/BatchLoader";
import { GitHubUser } from "./types";
import * as crypto from 'crypto';

export const BOT_LOGIN_REGEXP = /^(bot-.+|.+bot|.+\[bot\]|.+-bot-.+|robot-.+|.+-ci-.+|.+-ci|.+-testing|.+clabot.+|.+-gerrit|k8s-.+|.+-machine|.+-automation|github-.+|.+-github|.+-service|.+-builds|codecov-.+|.+teamcity.+|jenkins-.+|.+-jira-.+)$/i;

// Load GitHub users.
export async function loadGitHubUsers(userLoader: BatchLoader, users: GitHubUser[]): Promise<number> {
    for (const user of users) {
        await loadGitHubUser(userLoader, user);
    }
    return users.length;
}

export async function loadGitHubUser(userLoader: BatchLoader, user: GitHubUser) {
    let { id, login, type, name, email, organization, address, public_repos, followers, following, createdAt, updatedAt } = user;

    const isBot = BOT_LOGIN_REGEXP.test(login);
    address = trimAddress(address);
    organization = trimOrganizationName(organization);
    email = encodeEmail(email);

    await userLoader.insert([
        id, login, type, isBot, name, email, organization, address, public_repos, followers, following, createdAt, updatedAt
    ]);
}

function trimOrganizationName(organizationName: string | undefined | null):(string | undefined) {
    if (organizationName === undefined || organizationName === null) return undefined;
    return organizationName.trim()
}

function trimAddress(addressName?: string | undefined | null):(string | undefined) {
    if (addressName === undefined || addressName === null) return undefined;
    return addressName.trim()
}

function encodeEmail(email?: string | null) {
    if (!email) {
        return null;
    }

    const parts = email.split('@');
    if (parts.length !== 2) {
        return null;
    }

    const unique = parts[0];
    const suffix = parts[1];

    const hmac = crypto.createHmac('sha256', process.env.ENCODE_EMAIL_SECRET_KEY || 'secret-key');
    hmac.update(unique);
    const encoded = hmac.digest('hex');

    return `${encoded}@${suffix}`; 
}