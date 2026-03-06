import { MetadataGenerator } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ user_id: string }> = ({ parameters: { user_id }, getUser }) => {
  const user = getUser(Number(user_id));

  return {
    title: `@${user.login}'s Recent Work - Last 28 days`,
  };
};

export default generateMetadata;
