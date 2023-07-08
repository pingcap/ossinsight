import {GitHubRepo, GitHubRepoLanguage, GitHubRepoTopic, Prisma, PrismaClient} from '@prisma/client';
import {GitHubRepoNode} from "@typings/github";
import {DateTime} from "luxon";
import {Logger} from "pino";

const MAX_BIGINT_VALUE = 9223372036854775807;

export class GithubRepoDao {

  constructor(readonly logger: Logger, readonly prisma: PrismaClient) {}

  // Repo.

  async upsertRepoNode(repoNode: GitHubRepoNode) {
    await this.upsertRepoNodes([repoNode]);
  }

  async upsertRepoNodes(repoNodes: GitHubRepoNode[]): Promise<void> {
    const repos = this.mapRepoNodesToGitHubRepos(repoNodes);
    return await this.upsertRepos(repos);
  }

  async upsertRepos(repos: GitHubRepo[]) {
    if (!Array.isArray(repos) || repos.length === 0) {
      return;
    }

    const affectRows = await this.prisma.$executeRaw`
        INSERT INTO github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org,
                                  description, primary_language, license, size, stars, forks, is_fork, is_archived,
                                  latest_released_at, parent_repo_id, pushed_at, created_at, updated_at, refreshed_at)
        VALUES ${Prisma.join(repos.map(repo => Prisma.sql`(
        ${repo.repoId}, ${repo.repoName}, ${repo.ownerId}, ${repo.ownerLogin}, ${repo.ownerIsOrg},
        ${repo.description}, ${repo.primaryLanguage}, ${repo.license}, ${repo.size}, ${repo.stars}, ${repo.forks}, ${repo.isFork}, ${repo.isArchived},
        ${repo.latestReleasedAt}, ${repo.parentRepoId}, ${repo.pushedAt}, ${repo.createdAt}, ${repo.updatedAt}, ${repo.refreshedAt}
      )`))}
        ON DUPLICATE KEY UPDATE repo_id            = VALUES(repo_id),
                                repo_name          = VALUES(repo_name),
                                owner_id           = VALUES(owner_id),
                                owner_login        = VALUES(owner_login),
                                owner_is_org       = VALUES(owner_is_org),
                                description        = VALUES(description),
                                primary_language   = VALUES(primary_language),
                                license            = VALUES(license),
                                size               = VALUES(size),
                                stars              = VALUES(stars),
                                forks              = VALUES(forks),
                                is_fork            = VALUES(is_fork),
                                is_archived        = VALUES(is_archived),
                                latest_released_at = VALUES(latest_released_at),
                                parent_repo_id     = VALUES(parent_repo_id),
                                pushed_at          = VALUES(pushed_at),
                                created_at         = VALUES(created_at),
                                updated_at         = VALUES(updated_at),
                                refreshed_at       = VALUES(refreshed_at);
    `;

    if (affectRows > 0) {
      this.logger.info(`💾 Bulk upsert ${repos.length} GitHub repos.`);
    }
  }

  mapRepoNodesToGitHubRepos(nodes: GitHubRepoNode[]): GitHubRepo[] {
    return nodes.map((node) => this.mapRepoNodeToGitHubRepo(node));
  }

  mapRepoNodeToGitHubRepo(node: GitHubRepoNode): GitHubRepo {
    const latestReleasedAt = node?.latestRelease?.createdAt ? new Date(node?.latestRelease?.createdAt) : null;
    const pushedAt = node.pushedAt ? new Date(node.pushedAt) : null;
    const createdAt = new Date(node.createdAt);
    const updatedAt = new Date(node.updatedAt);

    let size = node.diskUsage || 0;
    if (size > MAX_BIGINT_VALUE) {
      this.logger.warn(`Repo ${node.databaseId} size ${node.diskUsage} is larger than ${MAX_BIGINT_VALUE}, set to ${MAX_BIGINT_VALUE}.`);
      size = MAX_BIGINT_VALUE;
    }

    return {
      repoId: node.databaseId,
      repoName: node.nameWithOwner,
      ownerId: node?.owner?.databaseId,
      ownerLogin: node.owner?.login,
      ownerIsOrg: node.isInOrganization,
      description: node.description ? node.description.substring(0, 512) : '',
      primaryLanguage: node?.primaryLanguage?.name || '',
      license: node?.licenseInfo?.key || '',
      size: size,
      stars: node.stargazerCount,
      forks: node.forkCount,
      parentRepoId: node?.parent?.databaseId || null,
      isFork: node.isFork,
      isArchived: node.isArchived,
      latestReleasedAt: latestReleasedAt,
      pushedAt,
      createdAt,
      updatedAt,
      isDeleted: false,
      refreshedAt: new Date(),
      lastEventAt: null,
    };
  }

  // Repo languages.

  async upsertRepoLanguageNodes(repoNodes: GitHubRepoNode[]) {
    const repoLanguages = this.mapRepoNodesToGitHubRepoLanguages(repoNodes);
    return await this.upsertRepoLanguages(repoLanguages);
  }

  async upsertRepoLanguages(repoLanguages: GitHubRepoLanguage[]): Promise<number> {
    if (!Array.isArray(repoLanguages) || repoLanguages.length === 0) {
      return 0;
    }

    const affectRows = await this.prisma.$executeRaw`
        INSERT INTO github_repo_languages (repo_id, language, size)
        VALUES ${Prisma.join(repoLanguages.map(repoLanguage => Prisma.sql`(
        ${repoLanguage.repoId}, ${repoLanguage.language}, ${repoLanguage.size}
      )`))}
        ON DUPLICATE KEY UPDATE repo_id  = VALUES(repo_id),
                                language = VALUES(language),
                                size     = VALUES(size);
    `;

    if (affectRows > 0) {
      this.logger.info(`💾 Bulk upsert ${repoLanguages.length} GitHub repo languages.`);
    }

    return affectRows;
  }

  mapRepoNodesToGitHubRepoLanguages(nodes: GitHubRepoNode[]): GitHubRepoLanguage[] {
    const repoLanguages: GitHubRepoLanguage[] = [];
    for (const node of nodes) {
      repoLanguages.push(...this.mapRepoNodeToGitHubRepoLanguages(node));
    }
    return repoLanguages;
  }

  mapRepoNodeToGitHubRepoLanguages(node: GitHubRepoNode): GitHubRepoLanguage[] {
    return node.languages.edges.map((edge: any) => ({
      repoId: node.databaseId,
      language: edge.node.name,
      size: edge.size
    }))
  }

  // Repo topics.

  async upsertRepoTopicNodes(repoNodes: GitHubRepoNode[]) {
    const repoTopics = this.mapRepoNodesToGitHubRepoTopics(repoNodes);
    return await this.upsertRepoTopics(repoTopics);
  }

  async upsertRepoTopics(repoTopics: GitHubRepoTopic[]): Promise<number> {
    if (!Array.isArray(repoTopics) || repoTopics.length === 0) {
      return 0;
    }

    const affectRows = await this.prisma.$executeRaw`
        INSERT INTO github_repo_topics (repo_id, topic)
        VALUES ${Prisma.join(repoTopics.map(repoTopic => Prisma.sql`(
        ${repoTopic.repoId}, ${repoTopic.topic}
      )`))}
        ON DUPLICATE KEY UPDATE repo_id = VALUES(repo_id),
                                topic   = VALUES(topic);
    `;

    if (affectRows > 0) {
      this.logger.info(`💾 Bulk upsert ${repoTopics.length} GitHub repo topics.`);
    }

    return affectRows;
  }

  mapRepoNodesToGitHubRepoTopics(nodes: GitHubRepoNode[]): GitHubRepoTopic[] {
    const repoTopics = [];
    for (const node of nodes) {
      repoTopics.push(...this.mapRepoNodeToGitHubTopics(node));
    }
    return repoTopics;
  }

  mapRepoNodeToGitHubTopics(node: GitHubRepoNode): GitHubRepoTopic[] {
    const repoTopics: GitHubRepoTopic[] = [];
    for (const topicNode of node.repositoryTopics.nodes) {
      repoTopics.push({
        repoId: node.databaseId,
        topic: topicNode.topic.name
      })
    }
    return repoTopics;
  }

  // Mark deleted repos.

  async markDeletedReposByRepoName(repoName: string, excludeRepoId: number): Promise<number> {
    const rs = await this.prisma.gitHubRepo.updateMany({
      where: {
        repoName: repoName,
        ...(excludeRepoId ? {repoId: {not: excludeRepoId}} : {})
      },
      data: {
        isDeleted: true,
        refreshedAt: new Date(),
      }
    });

    if (rs.count > 0) {
      this.logger.info(`Mark ${rs.count} GitHub repos as deleted by repo name ${repoName}, exclude repo id: ${excludeRepoId}.`);
    }

    return rs.count;
  }

  async markDeletedReposByOwnerId(ownerId: number): Promise<number> {
    const rs = await this.prisma.gitHubRepo.updateMany({
      where: {
        isDeleted: false,
        ownerId: ownerId
      },
      data: {
        isDeleted: true,
      }
    });

    if (rs.count > 0) {
      this.logger.info(`Mark ${rs.count} GitHub repos as deleted by owner ID ${ownerId}.`);
    }

    return rs.count;
  }

  // Pull repos from events.

  async pullOrgReposFromPushEvents(from: DateTime, to: DateTime) {
    const start = DateTime.now();
    await this.prisma.$executeRaw`
      INSERT github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, pushed_at)
      SELECT repo_id, repo_name, org_id, org_login, 1 AS owner_is_org, created_at
      FROM github_events
      WHERE
        type = 'PushEvent'
        AND org_id != 0
        AND created_at >= '${from.toSQL()}'
        AND created_at <= '${to.toSQL()}'
      ON DUPLICATE KEY UPDATE pushed_at = GREATEST(github_repos.pushed_at, github_events.created_at);
    `;
    const end = DateTime.now();
    this.logger.info(`Pull org repos from PushEvent from ${from.toISO()} to ${to.toISO()} in ${end.diff(start).toFormat('s')} seconds.`);
  }

  async pullUserReposFromPushEvents(from: DateTime, to: DateTime) {
    const start = DateTime.now();
    await this.prisma.$executeRaw`
      INSERT github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, pushed_at)
      SELECT repo_id, repo_name, org_id, org_login, 0 AS owner_is_org, created_at
      FROM github_events
      WHERE
        type = 'PushEvent'
        AND org_id = 0
        AND created_at >= '${from.toSQL()}'
        AND created_at <= '${to.toSQL()}'
      ON DUPLICATE KEY UPDATE pushed_at = GREATEST(github_repos.pushed_at, github_events.created_at);
    `;
    const end = DateTime.now();
    this.logger.info(`Pull user repos from PushEvent from ${from.toISO()} to ${to.toISO()} in ${end.diff(start).toFormat('s')} seconds.`);
  }

  async pullOrgReposFromPullRequestEvents(from: DateTime, to: DateTime) {
    const start = DateTime.now();
    await this.prisma.$executeRaw`
      INSERT github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, primary_language, last_event_at)
      SELECT repo_id, repo_name, org_id, org_login, 1 AS owner_is_org, language, created_at
      FROM github_events
      WHERE
        type = 'PullRequestEvent'
        AND org_id != 0
        AND created_at >= '${from.toSQL()}'
        AND created_at <= '${to.toSQL()}'
      ON DUPLICATE KEY UPDATE
        github_repos.primary_language = COALESCE(github_events.language, github_repos.primary_language),
        github_repos.last_event_at = GREATEST(github_repos.last_event_at, github_events.created_at);
    `;
    const end = DateTime.now();
    this.logger.info(`Pull org repos from PullRequestEvent from ${from.toISO()} to ${to.toISO()} in ${end.diff(start).toFormat('s')} seconds.`);
  }

  async pullUserReposFromPullRequestEvents(from: DateTime, to: DateTime) {
    const start = DateTime.now();
    await this.prisma.$executeRaw`
      INSERT github_repos (repo_id, repo_name, owner_id, owner_login, owner_is_org, primary_language, last_event_at)
      SELECT repo_id, repo_name, org_id, org_login, 0 AS owner_is_org, language, created_at
      FROM github_events
      WHERE
        type = 'PullRequestEvent'
        AND org_id = 0
        AND created_at >= '${from.toSQL()}'
        AND created_at <= '${to.toSQL()}'
      ON DUPLICATE KEY UPDATE
        github_repos.primary_language = COALESCE(github_events.language, github_repos.primary_language),
        github_repos.last_event_at = GREATEST(github_repos.last_event_at, github_events.created_at);
    `;
    const end = DateTime.now();
    this.logger.info(`Pull user repos from PullRequestEvent from ${from.toISO()} to ${to.toISO()} in ${end.diff(start).toFormat('s')} seconds.`);
  }


}