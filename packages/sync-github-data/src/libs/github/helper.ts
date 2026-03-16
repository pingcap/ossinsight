import {GitHubRepoNode, GitHubUserNode} from "@typings/github";
import {Pool as GenericPool} from "generic-pool";
import {DateTime} from "luxon";
import {Octokit} from "octokit";
import {Logger} from "pino";

export const GITHUB_MAX_SEARCH_NODES = 1000;

export function extractOwnerAndRepo(fullName: string) {
  const parts = fullName.split("/");

  if (parts.length !== 2) {
    throw new Error(`Got a wrong repo name: ${fullName}`);
  }

  return {
    owner: parts[0],
    repo: parts[1]
  }
}

export const DEFAULT_REPO_TIME_RANGE_FILED = 'created';

export enum RepoTimeRangeFiled {
  CREATED = 'created',
  PUSHED = 'pushed'
}

export const DEFAULT_USER_TIME_RANGE_FILED = 'created';

export enum UserTimeRangeFiled {
  CREATED = 'created',
}

export class GitHubHelper {

  constructor(readonly logger: Logger, readonly octokitPool: GenericPool<Octokit>) {}

  // TODO: Add metrics for rate limit and cost time.
  async queryWithGQL<R>(gql: any, variables?: Record<string, any>): Promise<R | null> {
    return await this.octokitPool.use(async (octokit) => {
      this.logger.debug({variables}, `Executing graphql query.`);
      const start = DateTime.now();
      const res = await octokit.graphql(gql, variables) as any;
      const end = DateTime.now();
      const costTime = end.diff(start).as('seconds');
      const costPoints = res.rateLimit?.cost || null;
      const remainPoints = res.rateLimit?.remaining || null;
      this.logger.debug({
        variables,
        costPoints,
        remainPoints,
        costTime
      }, `Finish graphql query, costTime: ${costTime}.`);
      return res;
    });
  }

  /**
   * Search nodes with graphql query.
   *
   * Example GQL:
   *
   * - The `search` part must be included, and three fields `nodeTotal`, `nodes`, `pageInfo` are provided in the search.
   * - provide `rateLimit` part for rate limit monitoring
   *
   * ```graphql
   * query SearchReposByTimeRange ($q: String!, $cursor: String) {
   *   search(type: REPOSITORY, query: $q, first: 100, after: $cursor) {
   *     nodeTotal: repositoryCount
   *     nodes {
   *       ...GitHubRepoNode
   *     }
   *     pageInfo {
   *       hasNextPage
   *       endCursor
   *     }
   *   }
   *   rateLimit {
   *     limit
   *     cost
   *     remaining
   *     resetAt
   *   }
   * }
   * ```
   *
   * @param gql
   * @param providedVariables
   */
  // TODO: Make sure the objects returned by the graphql query meet the definition of the TypeScript interface. (Just like golang's struct tag)
  async searchingNodesWithGQL<R>(gql: string, providedVariables: Record<string, any>): Promise<[boolean, R[]]> {
    let foundNodes = 0;
    let fetchedNodes = 0;

    const variables = {
      ...providedVariables,
      cursor: null
    };

    const searchResult: any[] = [];
    while (true) {
      const res = await this.queryWithGQL<any>(gql, variables);
      const search = res.search;
      const pageInfo = search?.pageInfo;

      foundNodes = search?.nodeTotal;
      fetchedNodes += search?.nodes.length;
      searchResult.push(...search?.nodes);

      this.logger.debug({variables}, `Fetched ${fetchedNodes}/${foundNodes} nodes.`);

      if (foundNodes > GITHUB_MAX_SEARCH_NODES) {
        return [true, searchResult];
      }

      // Switch to next page.
      if (pageInfo?.hasNextPage === true) {
        variables.cursor = pageInfo.endCursor;
      } else {
        break;
      }
    }
    return [false, searchResult];
  }

  async getBiggestUserId(): Promise<number> {
    const gql = `
      query {
        search(type: USER, first: 1, query: "sort:joined") {
          nodes {
            ... on User {
              databaseId
            }
          }
        }
      }
    `;

    const res = await this.queryWithGQL<any>(gql);
    return res?.data?.search?.nodes[0]?.databaseId;
  }

  async searchReposByTimeRange(timeRangeField: RepoTimeRangeFiled, from: DateTime, to: DateTime, filter: string = ''): Promise<[boolean, GitHubRepoNode[]]> {
    const fromISO = from.toISO();
    const toISO = to.toISO();
    const variables = {
      q: `${filter} ${timeRangeField}:${fromISO}..${toISO}`,
    };

    const gql = `
        fragment GitHubRepoNode on Repository {
            databaseId
            owner {
                ... on User {
                    databaseId
                    login
                    __typename
                }
                ... on Organization {
                    databaseId
                    login
                    __typename
                }
            }
            nameWithOwner
            licenseInfo {
                key
            }
            isInOrganization
            isFork
            isArchived
            description
            primaryLanguage {
                name
            }
            diskUsage
            stargazerCount
            forkCount
            latestRelease {
                createdAt
            }
            pushedAt
            createdAt
            updatedAt
            languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                    node {
                        name
                    }
                    size
                }
            }
            repositoryTopics(first: 20) {
                nodes {
                    topic {
                        name
                    }
                }
            }
            parent {
                databaseId
            }
        }
  
        query SearchReposByTimeRange ($q: String!, $cursor: String) {
          search(type: REPOSITORY, query: $q, first: 100, after: $cursor) {
              nodeTotal: repositoryCount
              nodes {
                  ...GitHubRepoNode
              }
              pageInfo {
                  startCursor
                  hasNextPage
                  endCursor
              }
          }
          rateLimit {
              limit
              cost
              remaining
              resetAt
          }
      }
    `;

    try {
      this.logger.info(`🔍 Begin searching repos by time range: ${fromISO} to ${toISO}...`);
      const start = DateTime.now();
      const [moreThan1k, nodes] = await this.searchingNodesWithGQL<GitHubRepoNode>(gql, variables);
      const end = DateTime.now();
      const duration = end.diff(start, 'seconds').seconds.toFixed(3);

      if (moreThan1k) {
        this.logger.warn(`🔍 Finished searching repos by time range: ${fromISO} to ${toISO}, found: >1k repos, costTime: ${duration}s.`);
      } else {
        this.logger.info(`🔍 Finished searching repos by time range: ${fromISO} to ${toISO}, found: ${nodes.length} repos, costTime: ${duration}s.`);
      }

      return [moreThan1k, nodes];
    } catch (err: any) {
      this.logger.error(err, `🔍Failed to searching repos by time range: ${fromISO} to ${toISO}.`);
      return [true, []];
    }
  }

  async searchUsersByTimeRange(timeRangeField: UserTimeRangeFiled, from: DateTime, to: DateTime, filter: string = ''): Promise<[boolean, GitHubUserNode[]]> {
    const fromISO = from.toISO();
    const toISO = to.toISO();
    const variables = {
      q: `${filter} ${timeRangeField}:${fromISO}..${toISO}`,
    }

    const searchUsersByTimeRange = `
      fragment GitHubUserNode on User {
        databaseId
        __typename
        login
        name
        email
        company
        location
        repositories {
            totalCount
        }
        followers {
            totalCount
        }
        following {
            totalCount
        }
        createdAt
        updatedAt
      }
      
      fragment GitHubOrganizationNode on Organization {
          databaseId
          __typename
          login
          name
          email
          location
          repositories {
              totalCount
          }
          createdAt
          updatedAt
      }
  
      query($q: String!, $cursor: String) {
        search(type: USER query: $q first: 100 after: $cursor) {
          nodeTotal: userCount
          nodes {
            ...GitHubUserNode
            ...GitHubOrganizationNode
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
        rateLimit {
          limit
          cost
          remaining
          resetAt
        }
      }
    `;

    try {
      this.logger.info(`🔍 Begin searching users by time range: ${fromISO} to ${toISO}...`);
      const start = DateTime.now();
      const [moreThan1k, nodes] = await this.searchingNodesWithGQL<GitHubUserNode>(searchUsersByTimeRange, variables);
      const end = DateTime.now();
      const duration = end.diff(start, 'seconds').seconds.toFixed(3);

      if (moreThan1k) {
        this.logger.warn(`🔍 Finished searching users by time range: ${fromISO} to ${toISO}, found: >1k users, costTime: ${duration}s.`)
      } else {
        this.logger.info(`🔍 Finished searching users by time range: ${fromISO} to ${toISO}, found: ${nodes.length} users, costTime: ${duration}s.`);
      }

      return [moreThan1k, nodes];
    } catch (err) {
      this.logger.error(err, `🔍Failed to search users by time range: ${fromISO} to ${toISO}.`);
      return [false, []];
    }
  }

  async getRepoByRepoName(repoName: string): Promise<GitHubRepoNode | null> {
    const {owner, repo: name} = extractOwnerAndRepo(repoName);
    const variables = {
      owner: owner,
      name: name
    };
    const gql = `
        fragment GitHubRepoNode on Repository {
            databaseId
            owner {
                ... on User {
                    databaseId
                    login
                    __typename
                }
                ... on Organization {
                    databaseId
                    login
                    __typename
                }
            }
            nameWithOwner
            licenseInfo {
                key
            }
            isInOrganization
            isFork
            isArchived
            description
            primaryLanguage {
                name
            }
            diskUsage
            stargazerCount
            forkCount
            latestRelease {
                createdAt
            }
            pushedAt
            createdAt
            updatedAt
            languages(first: 20, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                    node {
                        name
                    }
                    size
                }
            }
            repositoryTopics(first: 20) {
                nodes {
                    topic {
                        name
                    }
                }
            }
            parent {
                databaseId
            }
        }
  
        query ($owner: String!, $name: String!) {
            node: repository(owner: $owner name: $name) {
                ...GitHubRepoNode
            }
            rateLimit {
                limit
                cost
                remaining
                resetAt
            }
        }
    `;
    const res = await this.queryWithGQL<any>(gql, variables);
    return res.node;
  }

  async getUserRepoIds(login: string): Promise<number[]> {
    return await this.octokitPool.use(async (octokit) => {
      const repoIterator = await octokit.paginate.iterator(octokit.rest.repos.listForUser, {
        username: login,
      });

      const repoIds: any[] = [];
      for await (const repo of repoIterator) {
        repo.data.forEach((r) => {
          repoIds.push(r.id);
        });
      }
      return repoIds;
    });
  }

  async getOrgRepoIds(login: string): Promise<number[]> {
    return await this.octokitPool.use(async (octokit) => {
      const repoIterator = await octokit.paginate.iterator(octokit.rest.repos.listForOrg, {
        org: login,
      });

      const repoIds: any[] = [];
      for await (const repo of repoIterator) {
        repo.data.forEach((r) => {
          repoIds.push(r.id);
        });
      }

      return repoIds;
    });
  }

  async getUserById(userId: number): Promise<any> {
    return await this.octokitPool.use(async (octokit) => {
      return await octokit.rest.users.getByUsername({
        username: `${userId}`
      });
    });
  }

  async listUsers(since: number): Promise<any> {
    return await this.octokitPool.use(async (octokit) => {
      return await octokit.rest.users.list({
        since: since
      });
    });
  }

}