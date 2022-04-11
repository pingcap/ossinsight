import {MysqlQueryExecutor} from "../core/MysqlQueryExecutor";

interface Repo {
  id: any;
  name: string;
  group_name: string;
}

export default class RepoGroupService {

  constructor(readonly executor: MysqlQueryExecutor<unknown>) {
  }

  async getRepoGroups() {
    const repos = await this.executor.execute('select id, name, group_name from osdb_repos;') as Repo[];

    if (Array.isArray(repos)) {
      const repoGroupMap = new Map();
      for (const repo of repos) {
        if (repoGroupMap.has(repo.group_name)) {
          const repoGroup = repoGroupMap.get(repo.group_name);
          repo.id = parseInt(repo.id);
          repoGroup.repos.push(repo);
        } else {
          repo.id = parseInt(repo.id);
          repoGroupMap.set(repo.group_name, {
            group_name: repo.group_name,
            repos: [repo]
          });
        }
      }

      const repoGroups = []
      for (const repoGroup of repoGroupMap.values()) {
        repoGroups.push(repoGroup);
      }
      return repoGroups;
    } else {
      return [];
    }
  }

}
