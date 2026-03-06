import { MetadataGenerator, WidgetVisualizerContext } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ user_id: number }> = ({ parameters: { user_id }, getUser }) => {
  const user = getUser(user_id);

  return {
    title: `Dashboard stats of @${user?.login}`,
  }
};

export default generateMetadata;
