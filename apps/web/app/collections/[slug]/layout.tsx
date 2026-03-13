import { fetchCollections } from '@/utils/api';
import { CollectionSidebar } from './sidebar';

export default async function CollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collections = await fetchCollections();

  return (
    <div className="flex min-h-screen">
      <CollectionSidebar collections={collections} currentSlug={slug} />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
