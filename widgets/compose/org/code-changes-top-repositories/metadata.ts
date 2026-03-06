import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ owner_id: string }> = ({
  parameters: { owner_id },
  getOrg,
}) => {
  const main = getOrg(Number(owner_id));

  return {
    title: `Ranking of repos with the commit code changes in ${main.login}`,
  };
};

export default generateMetadata;
