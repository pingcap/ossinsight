import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
  period: string;
  activity: string;
}> = ({ parameters: { owner_id, activity }, getOrg }) => {
  const org = getOrg(Number(owner_id));

  return {
    title: `[Overview] ${activity} of ${org.login}`,
  };
};

export default generateMetadata;
