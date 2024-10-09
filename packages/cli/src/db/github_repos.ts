import {getDb} from "@db/index";

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