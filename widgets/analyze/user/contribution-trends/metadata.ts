import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ user_id: string }> = ({
  parameters: { user_id },
  getUser,
}) => {
  const main = getUser(parseInt(user_id));

  return {
    title: `Contribution trends`,
  };
};

export default generateMetadata;
