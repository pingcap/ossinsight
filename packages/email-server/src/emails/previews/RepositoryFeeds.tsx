import RepoMilestoneFeeds from '../RepositoryFeeds';

export function repositoryFeeds () {
  return (
    <RepoMilestoneFeeds
      name="Mini256"
      repoMilestones={[
        {
          repoId: 41986369,
          repoName: 'pingcap/tidb',
          milestoneId: 1,
          milestoneTypeId: 1,
          milestoneTypeName: 'star-earned',
          milestoneNumber: 1,
          watchedUserId: 1,
        },
      ]}
    />
  );
}
