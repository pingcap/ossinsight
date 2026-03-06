import { MetadataGenerator } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ repo_id: string }> = ({ parameters: { repo_id }, getRepo }) => {
  const repo = getRepo(Number(repo_id));

  return {
    title: `Activity Trends of ${repo.fullName} - Last 28 days`,
  };
};

export default generateMetadata;
