import { MetadataGenerator } from '@/lib/charts-types';

const generateMetadata: MetadataGenerator<{ collection_id: string, activity?: string }> = ({ parameters: { collection_id, activity }, getRepo, getCollection }) => {
  return {
    title: `Repository Annual Ranking in ${getCollection(Number(collection_id))?.name}`,
  };
};

export default generateMetadata;
