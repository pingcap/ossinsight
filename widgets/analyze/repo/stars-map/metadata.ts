import { MetadataGenerator } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ repo_id: string, vs_repo_id?: string, activity: 'stars' | 'pull-request-creators' | 'issue-creators' }> = ({ parameters: { repo_id, vs_repo_id, activity }, getRepo }) => {
  const main = getRepo(parseInt(repo_id));
  if (vs_repo_id) {
    const vs = getRepo(parseInt(vs_repo_id));
    return {
      title: `${main.fullName} vs ${vs.fullName} | ${TITLE[activity]} Geographical Distribution`,
    };
  } else {
    return {
      title: `${TITLE[activity]} Geographical Distribution of ${main.fullName}`,
    };
  }
};

const TITLE = {
  'stars': 'Star',
  'pull-request-creators': 'Pull Request Creator',
  'issue-creators': 'Issue Creator',
};

export default generateMetadata;
