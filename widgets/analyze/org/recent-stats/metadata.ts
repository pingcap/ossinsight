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
    title: `${upperFirst(activity)} trends of ${main.login}`,
  };
};

export default generateMetadata;
