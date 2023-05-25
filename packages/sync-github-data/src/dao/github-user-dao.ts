import {GitHubUser, LocationCacheItem, Prisma, PrismaClient} from '@prisma/client';
import {BOT_LOGIN_REGEXP, GitHubUserNode, GitHubUserType} from "@typings/github";
import crypto from "crypto";
import {Logger} from "pino";
import {DEFAULT_COUNTRY_CODE, DEFAULT_REGION_CODE} from "@libs/locator/Locator";

export interface Location {
  address: string;
  countryCode: string;
  regionCode: string;
  state: string;
  city: string;
  longitude: number;
  latitude: number;
}

export interface AddressWithCnt {
  address: string;
  cnt: number;
}

export class GithubUserDao {

  private logger: Logger;

  constructor(parentLogger: Logger, readonly prisma: PrismaClient) {
    this.logger = parentLogger.child({
      component: 'github-repo-dao'
    });
  }

  async upsertUserNodes(userNodes: GitHubUserNode[]): Promise<boolean> {
    const users = this.mapUserNodesToGitHubUsers(userNodes);
    return await this.upsertUsers(users);
  }

  async upsertUsers(users: GitHubUser[]): Promise<boolean> {
    if (!Array.isArray(users) || users.length === 0) {
      return false;
    }

    const affectRows = await this.prisma.$executeRaw`
        INSERT INTO github_users(id, login, type, is_bot, name, email, organization, address,
                                 public_repos, followers, followings, created_at, updated_at)
        VALUES ${Prisma.join(users.map(u => Prisma.sql`(
        ${u.id}, ${u.login}, ${u.type}, ${u.isBot}, ${u.name}, ${u.email}, ${u.organization}, ${u.address}, 
        ${u.publicRepos}, ${u.followers}, ${u.followings}, ${u.createdAt}, ${u.updatedAt}
      )`))}
        ON DUPLICATE KEY UPDATE login        = VALUES(login),
                                type         = VALUES(type),
                                is_bot       = VALUES(is_bot),
                                name         = VALUES(name),
                                email        = VALUES(email),
                                organization = VALUES(organization),
                                address      = VALUES(address),
                                public_repos = VALUES(public_repos),
                                followers    = VALUES(followers),
                                followings   = VALUES(followings),
                                created_at   = VALUES(created_at),
                                updated_at   = VALUES(updated_at)
        ;
    `;

    if (affectRows > 0) {
      this.logger.info(`Bulk upsert ${users.length} GitHub users.`);
    }

    return true;
  }

  encodeEmail(email?: string | null): string {
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

  async updateUserLocationByAddress(address: string, location: LocationCacheItem) {
    const {
      countryCode = DEFAULT_COUNTRY_CODE,
      regionCode = DEFAULT_REGION_CODE,
      state = '',
      city = '',
      longitude = null,
      latitude = null
    } = location;
    return await this.prisma.$executeRaw`
        UPDATE github_users
        SET country_code = ${countryCode},
            region_code  = ${regionCode},
            state        = ${state},
            city         = ${city},
            longitude    = ${longitude},
            latitude     = ${latitude}
        WHERE address = ${address}
    `;
  }

  async getAddressWithCount(limit: number = 10000) {
    return await this.prisma.$queryRaw<AddressWithCnt[]>`
        SELECT address, COUNT(1) AS cnt
        FROM github_users
        WHERE address != ''
          AND (country_code = 'N/A' OR country_code = '')
        GROUP BY address
        ORDER BY cnt DESC
        LIMIT ${limit}
    `;
  }

  private mapUserNodesToGitHubUsers(userNodes: GitHubUserNode[]): GitHubUser[] {
    return userNodes.map(node => this.mapNodeToGitHubUser(node));
  }

  private mapNodeToGitHubUser(node: GitHubUserNode): GitHubUser {
    const type = node.__typename === 'Organization' ? GitHubUserType.ORG : GitHubUserType.USR;
    const isBot = BOT_LOGIN_REGEXP.test(node.login);
    const address = this.trimAddress(node.location);
    const organization = this.trimOrganizationName(node.company);
    const email = this.encodeEmail(node.email);

    return {
      id: node.databaseId,
      login: node.login,
      type,
      isBot,
      email: email,
      name: node?.name || '',
      organization,
      organizationFormatted: null,
      address,
      countryCode: null,
      regionCode: null,
      state: null,
      city: null,
      longitude: null,
      latitude: null,
      publicRepos: node?.repositories?.totalCount,
      followers: node?.followers?.totalCount || 0,
      followings: node?.following?.totalCount || 0,
      isDeleted: false,
      createdAt: new Date(node.createdAt),
      updatedAt: new Date(node?.updatedAt),
      refreshedAt: new Date()
    };
  }

  private trimOrganizationName(organizationName?: string | null): string {
    if (organizationName === undefined || organizationName === null) return '';
    return organizationName.trim()
  }

  private trimAddress(addressName?: string | null): string {
    if (addressName === undefined || addressName === null) return '';
    return addressName.trim()
  }

}