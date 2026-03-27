import {
  MetadataGenerator,
  WidgetVisualizerContext,
} from '@/lib/charts-types';

const generateMetadata: MetadataGenerator<{ owner_id: string }> = ({
  parameters: { owner_id },
  getOrg,
}) => {
  const main = getOrg(Number(owner_id));

  return {
    title: `Top repos by stars of ${main?.login}`,
  };
};

export default generateMetadata;
