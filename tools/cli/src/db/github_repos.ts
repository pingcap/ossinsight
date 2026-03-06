import {getDb, values} from "@db/index";
import {Insertable} from "kysely";
import {GithubRepos} from "@db/schema";

export async function findReposByNames(names: string[]) {
  return await getDb().selectFrom('github_repos')
    .selectAll()
    .where('repo_id', 'in', ({ selectFrom }) => {
      return selectFrom('github_repos')
        .select([
          (eb) => eb.fn.max<number>('repo_id').as('latest_repo_id')
        ])
        .where('repo_name', 'in', names)
        .groupBy('repo_name')
    })
    .execute();
}

export async function upsertGitHubRepo(repo: Insertable<GithubRepos>) {
  return await getDb().insertInto('github_repos')
    .values(repo)
    .onDuplicateKeyUpdate(({ ref }) => ({
      repo_name: values(ref('repo_name')),
      owner_id: values(ref('owner_id')),
      owner_login: values(ref('owner_login')),
    }))
    .executeTakeFirst();
}