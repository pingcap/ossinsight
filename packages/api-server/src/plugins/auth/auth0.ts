import Axios from "axios";
import { Connection } from "mysql2/promise";
import { ResultSetHeader } from "mysql2";
import { DateTime } from "luxon";

import { UserService, UserRole } from "../services/user-service";
import { APIError } from "../../utils/error";

export interface Auth0UserInfo {
  sub: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
}

export async function fetchAuth0UserInfo(
  token: string
): Promise<Auth0UserInfo> {
  const URL = `https://${process.env.AUTH0_DOMAIN}/userinfo`;
  const bearerToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const response = await Axios.get(URL, {
    headers: {
      Authorization: bearerToken,
    },
  }).then((res) => res.data);
  return response as Auth0UserInfo;
}

export class Auth0UserService extends UserService {
  async findOrCreateUserByAuth0Sub(
    sub: string,
    token?: string
  ): Promise<number> {
    if (!token) throw new Error("token is required");

    let conn: Connection | undefined;

    const [provider, idString] = sub.split("|");

    try {
      conn = await this.mysql.getConnection();
      await conn.beginTransaction();

      // Check if how many users bound to this account.
      const [existedUserIds] = await this.mysql.query<any[]>(
        `
            SELECT su.id
            FROM sys_users su
            LEFT JOIN sys_accounts sa ON su.id = sa.user_id AND sa.provider = ?
            WHERE sa.provider_account_id = ?
            FOR UPDATE;
        `,
        [provider, idString]
      );

      if (existedUserIds.length > 1) {
        throw new APIError(409, "Failed to login, please contact admin.");
      } else if (existedUserIds.length === 1) {
        return existedUserIds[0].id;
      }

      // Create a new user if didn't exist any user bound to this account.
      const userInfo = await fetchAuth0UserInfo(token);
      const [rs] = await this.mysql.query<ResultSetHeader>(
        `
            INSERT INTO sys_users(name, email_address, email_get_updates, avatar_url, role, created_at, enable)
            VALUES(?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userInfo.name,
          userInfo.email,
          0,
          userInfo.picture,
          UserRole.USER,
          DateTime.utc().toJSDate(),
          true,
        ]
      );

      // Create a new account link to the new user.
      await this.mysql.query<ResultSetHeader>(
        `
            INSERT INTO sys_accounts(user_id, provider, provider_account_id)
            VALUES(?, ?, ?)
        `,
        [rs.insertId, provider, idString]
      );

      await conn.commit();
      return rs.insertId;
    } catch (err) {
      if (conn) {
        await conn.rollback();
      }
      if (err instanceof APIError) {
        throw err;
      }
      throw new APIError(
        500,
        "Failed to create new user, please try it again.",
        err as Error
      );
    }
  }
}
