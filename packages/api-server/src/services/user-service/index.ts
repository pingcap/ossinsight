import { FastifyBaseLogger } from "fastify";
import{ FastifyJWTOptions } from "@fastify/jwt";
import { FastifyOAuth2Options } from "@fastify/oauth2";
import { MySQLPromisePool } from "@fastify/mysql";
import { ResultSetHeader } from "mysql2";
import fp from "fastify-plugin";
import {APIError} from "../../utils/error";
import {Connection, RowDataPacket} from "mysql2/promise";

declare module 'fastify' {
    interface FastifyInstance {
        userService: UserService;
    }
}

export interface UserProfile extends RowDataPacket{
    id: number;
    name: string;
    emailAddress: string;
    emailGetUpdates: boolean;
    githubId: number;
    githubLogin: string;
    avatarURL: string;
    role: UserRole;
    createdAt: Date;
    enable: boolean;
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export interface User {
    id: number;
    name: string;
    emailAddress: string | null;
    emailGetUpdates: boolean;
    avatarURL: string;
    role: UserRole;
    createdAt: Date;
    enable: boolean;
}

export interface UserGetUpdatesSetting extends Omit<UserProfile, 'emailGetUpdates'>, RowDataPacket {}

export interface Account {
    id: number;
    userId: number;
    provider: ProviderType;
    providerAccountId: string;
    providerAccountLogin: string;
    accessToken: string;
}

export enum ProviderType {
    GITHUB = 'github'
}

export default fp<FastifyOAuth2Options & FastifyJWTOptions>(async (fastify) => {
    fastify.decorate('userService', new UserService(fastify.log, fastify.mysql));
}, {
    name: 'user-service',
    dependencies: [
        '@fastify/mysql'
    ]
});

export class UserService {

    constructor(readonly log: FastifyBaseLogger, readonly mysql: MySQLPromisePool) {}

    async getUserById(userId: number): Promise<UserProfile> {
        const [users] = await this.mysql.query<any[]>(`
            SELECT
                su.id, su.name, su.role, su.avatar_url AS avatarURL, su.created_at AS createdAt, su.enable,
                su.email_address AS emailAddress, su.email_get_updates AS emailGetUpdates,
                CAST(sa.provider_account_id AS SIGNED) AS githubId, sa.provider_account_login AS githubLogin
            FROM sys_users su
            LEFT JOIN sys_accounts sa ON su.id = sa.user_id AND sa.provider = ?
            WHERE
                su.id = ?
            LIMIT 1
        `, [ProviderType.GITHUB, userId]);
        if (users.length === 0) {
            throw new APIError(404, 'User not found');
        }
        const user = users[0];
        user.enable = Boolean(user.enable);
        user.emailGetUpdates = Boolean(user.emailGetUpdates);
        return users[0];
    }

    async getUserByGithubId(githubId: number): Promise<UserProfile> {
        const [users] = await this.mysql.query<UserProfile[]>(`
            SELECT
                su.id, su.name, su.role, su.avatar_url AS avatarURL, su.created_at AS createdAt, su.enable,
                su.email_address AS emailAddress, su.email_get_updates AS emailGetUpdates,
                CAST(sa.provider_account_id AS SIGNED) AS githubId, sa.provider_account_login AS githubLogin
            FROM sys_users su
            LEFT JOIN sys_accounts sa ON su.id = sa.user_id AND sa.provider = ?
            WHERE sa.provider_account_id = ?
            LIMIT 1
        `, [ProviderType.GITHUB, `${githubId}`]);
        if (users.length === 0) {
            throw new APIError(404, 'User not found');
        }
        const user = users[0];
        user.enable = Boolean(user.enable);
        user.emailGetUpdates = Boolean(user.emailGetUpdates);
        return user;
    }

    async findOrCreateUserByAccount(user: Omit<User, 'id'>, account: Omit<Account, 'id' | 'userId'>):Promise<number> {
        let conn: Connection | undefined;

        try {
            conn = await this.mysql.getConnection();
            await conn.beginTransaction();

            // Check if how many users bound to this account.
            const [existedUserIds] = await this.mysql.query<any[]>(`
                SELECT su.id
                FROM sys_users su
                LEFT JOIN sys_accounts sa ON su.id = sa.user_id AND sa.provider = ?
                WHERE sa.provider_account_id = ?
                FOR UPDATE;
            `, [account.provider, `${account.providerAccountId}`]);

            if (existedUserIds.length > 1) {
                throw new APIError(409, 'Failed to login, please contact admin.');
            } else if (existedUserIds.length === 1) {
                return existedUserIds[0].id;
             }

            // Create a new user if didn't exist any user bound to this account.
            const [rs] = await this.mysql.query<ResultSetHeader>(`
                INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
                VALUES(?, ?, ?, ?, ?, ?, ?)
            `, [user.name, user.emailAddress, user.emailGetUpdates, user.avatarURL, user.role, user.createdAt, user.enable]);
            const newUser: User = {
                id: rs.insertId,
                ...user,
            };

            // Create a new account link to the new user.
            await this.mysql.query<ResultSetHeader>(`
                INSERT INTO sys_accounts(user_id, provider, provider_account_id, provider_account_login, access_token)
                VALUES(?, ?, ?, ?, ?)
            `, [newUser.id, account.provider, account.providerAccountId, account.providerAccountLogin, account.accessToken]);

            await conn.commit();
            return newUser.id;
        } catch (err) {
            if (conn) {
                await conn.rollback();
            }
            if (err instanceof APIError) {
                throw err;
            }
            throw new APIError(500, 'Failed to create new user, please try it again.', err as Error);
        }
    }

    async getEmailUpdates(userId: number): Promise<UserGetUpdatesSetting> {
        const [settings] = await this.mysql.query<UserGetUpdatesSetting[]>(
            `SELECT email_get_updates AS emailGetUpdates FROM sys_users WHERE id = ? LIMIT 1`, [userId]
        );
        if (settings.length === 0) {
            throw new APIError(404, 'User not found');
        }
        return settings[0];
    }

    async settingEmailUpdates(userId: number, enable: boolean): Promise<boolean> {
        await this.mysql.query<ResultSetHeader>(
            `UPDATE sys_users SET email_get_updates = ? WHERE id = ?`,
            [enable, userId]
        );
        return enable;
    }

}
