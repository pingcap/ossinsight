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
      <main className="flex-1 block min-w-0 overflow-x-hidden">
        <div className="px-6 py-4 pr-[10%] md:px-8 md:py-4 md:pr-[10%]">{children}</div>
      </main>
    </div>
  );
}
