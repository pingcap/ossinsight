import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ owner_id: string }> = ({
  parameters: { owner_id },
  getOrg,
}) => {
  const main = getOrg(parseInt(owner_id));
  return {
    title: `Which Repository Shows the Most Proactive Pull Request Review Responses?`,
  };
};

export default generateMetadata;
