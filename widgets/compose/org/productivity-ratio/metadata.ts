import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import { upperFirst } from '@/lib/widgets-utils/utils';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const main = getOrg(Number(owner_id));

  return {
    title: `${upperFirst(activity.split('/').join(' '))} ratio of ${
      main.login
    }`,
  };
};

export default generateMetadata;
