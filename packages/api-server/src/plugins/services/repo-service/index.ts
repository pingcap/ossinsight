import {FastifyJWTOptions} from "@fastify/jwt";
import {FastifyOAuth2Options} from "@fastify/oauth2";
import {MySQLPromisePool} from "@fastify/mysql";
import {ResultSetHeader} from "mysql2";
import fp from "fastify-plugin";
import {APIError} from "../../../utils/error";
import {RowDataPacket} from "mysql2/promise";

declare module 'fastify' {
    interface FastifyInstance {
        repoService: RepoService;
    }
}

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (app) => {
    app.decorate('repoService', new RepoService(app.mysql));
}, {
    name: 'repo-service',
    dependencies: [
        '@fastify/mysql'
    ]
});

export interface SubscribedRepo extends RowDataPacket{
    userId: number;
    repoId: number;
    repoName: string;
    subscribed: boolean;
    subscribedAt: Date;
}

export interface RepoOnlyId extends RowDataPacket {
    repoId: number;
}

export class RepoService {

    constructor(readonly mysql: MySQLPromisePool) {}

    // Add repo into subscribed repo list.
    async subscribeRepo(userId: number, owner: string, repo: string): Promise<void> {
        const repoId = await this.getRepoId(owner, repo);
        const [rs] = await this.mysql.query<ResultSetHeader>(`
            INSERT INTO sys_subscribed_repos (user_id, repo_id) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE subscribed_at = CURRENT_TIMESTAMP(), subscribed = true;
        `, [userId, repoId]);

        // Notice: With ON DUPLICATE KEY UPDATE, the affected-rows value per row is 1 if the row is inserted as a
        // new row, 2 if an existing row is updated, and 0 if an existing row is set to its current values.
        // Reference: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html
        if (rs.affectedRows !== 2 && rs.affectedRows !== 1) {
            throw new APIError(500, `Failed to subscribe repo ${owner}/${repo} for user ${userId}`);
        }
    }

    // Mark repo as unsubscribed.
    async unsubscribeRepo(userId: number, owner: string, repo: string): Promise<void> {
        const repoId = await this.getRepoId(owner, repo);
        const [rs] = await this.mysql.query<ResultSetHeader>(`
            UPDATE sys_subscribed_repos
            SET subscribed = false
            WHERE user_id = ? AND repo_id = ? AND subscribed = true;
        `, [userId, repoId]);

        if (rs.affectedRows !== 1) {
            throw new APIError(409, `Repo ${owner}/${repo} has not been subscribed by user ${userId}`);
        }
    }

    // Get repository id by owner and repo name.
    async getRepoId(owner: string, repo: string): Promise<number> {
        const [repos] = await this.mysql.query<RepoOnlyId[]>(`
            SELECT repo_id AS repoId
            FROM github_repos
            WHERE repo_name = CONCAT(?, '/', ?) AND is_deleted = 0
            LIMIT 1;
        `, [owner, repo]);

        if (repos.length === 0) {
            throw new APIError(404, `Repo ${owner}/${repo} not found`);
        }
        return repos[0].repoId;
    }

    // TODO: support pagination.
    async getUserSubscribedRepos(userId: number): Promise<SubscribedRepo[]> {
        const [rows] = await this.mysql.query<SubscribedRepo[]>(`
            SELECT
                user_id AS userId,
                gr.repo_id AS repoId, gr.repo_name AS repoName,
                subscribed, subscribed_at AS subscribedAt
            FROM sys_subscribed_repos swr
            LEFT JOIN github_repos gr ON swr.repo_id = gr.repo_id
            WHERE user_id = ? AND subscribed = true
            ORDER BY subscribed_at DESC;
        `, [userId]);
        return rows.map((row) => {
            row.subscribed = Boolean(row.subscribed);
            return row;
        });
    }

}
