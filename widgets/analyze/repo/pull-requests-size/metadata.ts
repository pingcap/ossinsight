import { MetadataGenerator, WidgetVisualizerContext } from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{ repo_id: string, vs_repo_id?: string }> = ({ parameters: { repo_id, vs_repo_id }, getRepo }) => {
  const main = getRepo(parseInt(repo_id));
  if (vs_repo_id) {
    const vs = getRepo(parseInt(vs_repo_id));
    return {
      title: `${main.fullName} vs ${vs.fullName} | Pull Request Size`,
    };
  } else {
    return {
      title: `Pull Request Size of ${main.fullName}`,
    };
  }
};

export default generateMetadata;
