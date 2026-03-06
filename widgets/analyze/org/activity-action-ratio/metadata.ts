import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

const generateMetadata: MetadataGenerator<{
  owner_id: string;
}> = ({ parameters: { owner_id }, getRepo }) => {
  // const main = getRepo(parseInt(repo_id));
  return {
    title: `Pull Request Merged Ratio of ${owner_id}`,
  };
};

export default generateMetadata;
