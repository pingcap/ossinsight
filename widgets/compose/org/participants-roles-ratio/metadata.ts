import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
}> = ({ parameters: { owner_id }, getOrg }) => {
  const main = getOrg(Number(owner_id));

  return {
    title: `Participants roles of ${main.login}`,
  };
};

export default generateMetadata;
