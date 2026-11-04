import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyRequest
} from "fastify";
import { MySQLPromisePool } from "@fastify/mysql";
import { ResultSetHeader } from "mysql2";
import fp from "fastify-plugin";
import {withTransaction} from "../../../utils/db";
import { APIError } from "../../../utils/error";
import { RowDataPacket } from "mysql2/promise";
import { DateTime } from "luxon";
import Axios from "axios";
import {Auth0User, Auth0UserInfo, Auth0UserMetadata, parseAuth0User} from "../../auth/auth0";

declare module "fastify" {
  interface FastifyInstance {
    userService: UserService;
  }
}

export interface UserProfile extends RowDataPacket {
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
  USER = "user",
  ADMIN = "admin",
}

export const GET_EMAIL_UPDATES_DEFAULT = false;

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

export interface UserGetUpdatesSetting
  extends Omit<UserProfile, "emailGetUpdates">,
    RowDataPacket {}

export interface Account {
  id: number;
  userId: number;
  provider: ProviderType;
  providerAccountId: string;
  providerAccountLogin: string;
  accessToken: string;
}

export enum ProviderType {
  GITHUB = "github",
}

export default fp(
  async (app) => {
    app.decorate(
      "userService",
      new UserService(app.config, app.log, app.mysql)
    );
  },
  {
    name: "@ossinsight/user-service",
    dependencies: ["@ossinsight/tidb"],
  }
);

export class UserService {
  private identityConstraintReady?: Promise<void>;
  constructor(
    readonly config: FastifyInstance["config"],
    readonly log: FastifyBaseLogger,
    readonly tidb: MySQLPromisePool
  ) {}

  async getUserById(userId: number): Promise<UserProfile> {
    const [users] = await this.tidb.query<any[]>(
      `
            SELECT
                su.id, su.name, su.role, su.avatar_url AS avatarURL, su.created_at AS createdAt, su.enable,
                su.email_address AS emailAddress, su.email_get_updates AS emailGetUpdates,
                CAST(sa.provider_account_id AS SIGNED) AS githubId, sa.provider_account_login AS githubLogin
            FROM sys_users su
            LEFT JOIN sys_accounts sa ON su.id = sa.user_id AND sa.provider = ?
            WHERE
                su.id = ?
            LIMIT 1
        `,
      [ProviderType.GITHUB, userId]
    );
    if (users.length === 0) {
      throw new APIError(404, "User not found");
    }
    const user = users[0];
    user.enable = Boolean(user.enable);
    user.emailGetUpdates = Boolean(user.emailGetUpdates);
    return users[0];
  }

  async getUserByGithubId(githubId: number): Promise<UserProfile> {
    const [users] = await this.tidb.query<UserProfile[]>(
      `
            SELECT
                su.id, su.name, su.role, su.avatar_url AS avatarURL, su.created_at AS createdAt, su.enable,
                su.email_address AS emailAddress, su.email_get_updates AS emailGetUpdates,
                CAST(sa.provider_account_id AS SIGNED) AS githubId, sa.provider_account_login AS githubLogin
            FROM sys_users su
            LEFT JOIN sys_accounts sa ON su.id = sa.user_id AND sa.provider = ?
            WHERE sa.provider_account_id = ?
            LIMIT 1
        `,
      [ProviderType.GITHUB, `${githubId}`]
    );
    if (users.length === 0) {
      throw new APIError(404, "User not found");
    }
    const user = users[0];
    user.enable = Boolean(user.enable);
    user.emailGetUpdates = Boolean(user.emailGetUpdates);
    return user;
  }

  async getUserIdOrCreate(req: FastifyRequest<any>): Promise<number> {
    const { sub, metadata } = parseAuth0User(req.user as Auth0User);
    const userId = await this.findOrCreateUserByAccount(
      { ...metadata, sub },
      req.headers.authorization,
    );
    req.securityActor = `user:${userId}`;
    return userId;
  }

  async findOrCreateUserByAccount(user: Auth0UserMetadata & { sub: string }, token?: string): Promise<number> {
    if (!token) throw new APIError(401, 'An authorization token is required.');
    const identity = typeof user?.sub === 'string' ? user.sub.split('|') : [];
    const [provider, idString] = identity;
    if (identity.length !== 2 || !/^[a-z0-9][a-z0-9_-]{0,19}$/.test(provider) ||
        !/^[\x21-\x7e]{1,128}$/.test(idString)) throw new APIError(401, 'Invalid account identity.');
    const githubLogin = user?.github_login || null;
    const lookupSQL = `SELECT sa.user_id AS userId, su.id
      FROM sys_accounts sa LEFT JOIN sys_users su ON su.id = sa.user_id
      WHERE sa.provider = ? AND sa.provider_account_id = ?`;
    const readBinding = (rows: Array<{id: number | null; userId: number}>): number | undefined => {
      // An orphan is not a new identity: recreating it could resurrect a deleted
      // account. Existing ambiguous or orphaned bindings require explicit repair.
      if (rows.length > 1 || (rows.length === 1 && rows[0].id == null)) {
        throw new APIError(409, 'Account binding requires administrator review.');
      }
      return rows[0]?.id ?? undefined;
    };
    const lookup = async () => {
      const [rows] = await this.tidb.query<any[]>(lookupSQL, [provider, idString]);
      return readBinding(rows);
    };
    const existing = await lookup();
    if (existing !== undefined) return existing;
    await this.requireUniqueAccountIdentity();

    // The external identity provider must never hold a database transaction open.
    const userInfo = await this.fetchAuth0UserInfo(this.config.AUTH0_DOMAIN, token);
    if (!userInfo || userInfo.sub !== user.sub) throw new APIError(401, 'Account profile does not match the authenticated identity.');
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const created = await withTransaction(this.tidb, async (conn) => {
          const [rows] = await conn.query<any[]>(lookupSQL + ' FOR UPDATE', [provider, idString]);
          const winner = readBinding(rows);
          if (winner !== undefined) return winner;
          const [rs] = await conn.query<ResultSetHeader>(`
            INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
            VALUES(?, ?, ?, ?, ?, ?, ?)
          `, [
            userInfo.name,
            userInfo.email,
            GET_EMAIL_UPDATES_DEFAULT,
            userInfo.picture,
            UserRole.USER,
            DateTime.utc().toSQL(),
            true,
          ]);

          // Create a new account link to the new user.
          await conn.query<ResultSetHeader>(`
            INSERT INTO sys_accounts(user_id, provider, provider_account_id, provider_account_login)
            VALUES(?, ?, ?, ?)
           `, [rs.insertId, provider, idString, githubLogin]);

          return rs.insertId;
        });
        if (created === undefined) throw new APIError(503, 'Account registration is temporarily unavailable.');
        return created;
      } catch (error) {
        if (error instanceof APIError) throw error;
        const errno = Number((error as {errno?: number})?.errno);
        // The losing transaction (including its provisional sys_users row) has
        // rolled back. Read the committed winner using a fresh transaction view.
        if ([1062, 1213, 9007].includes(errno)) {
          const winner = await lookup();
          if (winner !== undefined) return winner;
          continue;
        }
        throw new APIError(503, 'Account registration is temporarily unavailable.');
      }
    }
    throw new APIError(503, 'Account registration is busy, please retry.');
  }

  private async requireUniqueAccountIdentity(): Promise<void> {
    if (!this.identityConstraintReady) {
      this.identityConstraintReady = (async () => {
        const [rows] = await this.tidb.query<any[]>(`SELECT INDEX_NAME AS indexName,
          COLUMN_NAME AS columnName, SUB_PART AS prefixLength
          FROM information_schema.statistics
          WHERE table_schema=DATABASE() AND table_name='sys_accounts' AND NON_UNIQUE=0
          ORDER BY INDEX_NAME, SEQ_IN_INDEX`);
        const indexes = new Map<string, Array<{columnName: string; prefixLength: number | null}>>();
        for (const row of rows) indexes.set(row.indexName, [...(indexes.get(row.indexName) || []), row]);
        const constrained = [...indexes.values()].some(columns => columns.length === 2 &&
          columns.every(column => column.prefixLength === null) &&
          columns.map(column => column.columnName).sort().join(',') === 'provider,provider_account_id');
        if (!constrained) throw new Error('Required identity constraint is absent.');
      })().catch(() => {
        this.identityConstraintReady = undefined;
        throw new APIError(503, 'Account registration is not configured.');
      });
    }
    return this.identityConstraintReady;
  }

  async fetchAuth0UserInfo(
    domain: string,
    token: string
  ): Promise<Auth0UserInfo> {
    // https://auth0.com/docs/api/authentication#get-user-info
    const URL = `https://${domain}/userinfo`;
    const bearerToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    try {
      const response = await Axios.get(URL, {
        headers: {Authorization: bearerToken}, timeout: 5000,
        maxRedirects: 0, maxContentLength: 65536,
      });
      return response.data as Auth0UserInfo;
    } catch {
      // Axios errors contain authorization headers and must not reach logs.
      throw new APIError(502, 'Unable to load account profile.');
    }
  }

  async getEmailUpdates(userId: number): Promise<UserGetUpdatesSetting> {
    const [settings] = await this.tidb.query<UserGetUpdatesSetting[]>(
      `SELECT email_get_updates AS emailGetUpdates FROM sys_users WHERE id = ? LIMIT 1`,
      [userId]
    );
    if (settings.length === 0) {
      throw new APIError(404, "User not found");
    }
    return settings[0];
  }

  async settingEmailUpdates(userId: number, enable: boolean): Promise<boolean> {
    await this.tidb.query<ResultSetHeader>(
      `UPDATE sys_users SET email_get_updates = ? WHERE id = ?`,
      [enable, userId]
    );
    return enable;
  }
}
