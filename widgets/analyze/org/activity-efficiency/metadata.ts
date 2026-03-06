import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';
import { upperFirst } from '@/lib/widgets-utils/utils';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const main = getOrg(parseInt(owner_id));
  return {
    title: `Count of ${upperFirst(activity.split('-').join(' '))} Over Time`,
  };
};

export default generateMetadata;
