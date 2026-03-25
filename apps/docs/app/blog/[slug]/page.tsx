import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ShareButtons } from '@/components/share-buttons';
import { formatDisplayDate, getBlogPost, getBlogPosts } from '@/lib/content';
import { BlogPostJsonLd, LearningResourceJsonLd } from '@/components/json-ld';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  return {
    title: post?.title,
    description: post?.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post?.title,
      description: post?.description,
      ...(post?.image ? { images: [{ url: post.image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post?.title,
      description: post?.description,
      ...(post?.image ? { images: [post.image] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-[820px]">
      <BlogPostJsonLd
        title={post.title}
        description={post.description ?? ''}
        slug={post.slug}
        date={post.date ?? ''}
        authors={post.authors.map((a) => a.name)}
        image={post.image}
        keywords={post.tags}
      />
      <LearningResourceJsonLd
        title={post.title}
        description={post.description ?? ''}
        slug={post.slug}
        date={post.date ?? ''}
        image={post.image}
        keywords={post.tags}
      />
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#7c7c7c] transition hover:text-[#fceeb4]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <ShareButtons title={`${post.title} | OSS Insight`} sharePath={`/blog/${post.slug}`} hashtags={post.tags} />
      </div>

      <header className="mb-10 border-b border-white/[0.08] pb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#7c7c7c]">
          {post.date && <span>{formatDisplayDate(post.date)}</span>}
          <span>{post.readingTime}</span>
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <h1 className="mt-5 text-[30px] font-semibold leading-tight text-[#e9eaee] sm:text-[40px]">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-5 max-w-[760px] text-[15px] leading-7 text-[#7c7c7c]">
            {post.description}
          </p>
        )}

        {post.authors.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
            {post.authors.map((author) => (
              <div key={author.name} className="flex items-center gap-3">
                {author.imageUrl && (
                  <img
                    src={author.imageUrl}
                    alt={author.name}
                    className="h-10 w-10 rounded-full"
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-[#e9eaee]">{author.name}</div>
                  {author.title && <div className="text-xs text-[#7c7c7c]">{author.title}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {post.image && (
        <div className="mb-10">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="prose prose-invert max-w-none blog-prose">
        {post.content}
      </div>

      <div className="mt-10 border-t border-white/[0.08] pt-6">
        <ShareButtons title={`${post.title} | OSS Insight`} sharePath={`/blog/${post.slug}`} hashtags={post.tags} />
      </div>
    </article>
  );
}
