import { MetadataGenerator } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ owner_id: number }> = ({
  parameters: { owner_id },
  getOrg,
}) => {
  const main = getOrg(owner_id);
  return {
    title: `Most engaged people of ${main.login}`,
  };
};

export default generateMetadata;
