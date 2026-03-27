import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@/lib/charts-types';
import { upperFirst } from '@/lib/charts-utils/utils';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const org = getOrg(Number(owner_id));

  return {
    title: `${upperFirst(activity)} trends of ${org?.login}`,
  };
};

export default generateMetadata;
