import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const org = getOrg(Number(owner_id));

  return {
    title: `Active ${activity} of ${org?.login}`,
  };
};

export default generateMetadata;
