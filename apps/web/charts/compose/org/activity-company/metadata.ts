import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const main = getOrg(parseInt(owner_id));
  return {
    title: `Company Affiliation of ${main?.login}`,
  };
};

export default generateMetadata;
