import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { upperFirst } from '@/lib/charts-utils/utils';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const main = getOrg(parseInt(owner_id));
  const title = getTitle(activity, main?.login ?? "");
  return {
    title,
  };
};

const getTitle = (activity: string, login: string) => {
  switch (activity) {
    case 'issues/issue-comments':
      return 'Which Repositories Are Actively Engaged in Issue Discussions?';
    case 'reviews/review-comments':
      return 'Which Repository Generates the Most Discussion during Pull Request Reviews?';
    default:
      const title = activity.split('/')[1].split('-').map(i => upperFirst(i)).join(' ');
      return `Ranking of Repos with the Most ${title} in ${
        upperFirst(login)
      }`;
  }
};

export default generateMetadata;
