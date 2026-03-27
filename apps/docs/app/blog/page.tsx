import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDisplayDate, getBlogPosts, type BlogPostSummary } from '@/lib/content';
import { BreadcrumbListJsonLd, CollectionPageJsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Helping dev teams adopt OSS technologies and practices. Written by software engineers and community analysts.',
};

function PostImage({ post, className, priority }: { post: BlogPostSummary; className?: string; priority?: boolean }) {
  if (post.image) {
    return (
      <img
        src={post.image}
        alt={post.title}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(priority ? { fetchpriority: 'high' } as any : {})}
      />
    );
  }

  // Gradient placeholder based on slug hash
  const hash = post.slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradients = [
    'from-[#1a1a2e] to-[#16213e]',
    'from-[#0f3460] to-[#1a1a2e]',
    'from-[#1b1b2f] to-[#162447]',
    'from-[#1f1f38] to-[#2d2d5e]',
    'from-[#0d1b2a] to-[#1b2838]',
    'from-[#1a0a2e] to-[#16213e]',
  ];
  const gradient = gradients[hash % gradients.length];

  return (
    <div className={`bg-gradient-to-br ${gradient} flex items-end ${className ?? ''}`}>
      <span className="px-8 pb-6 text-left text-[clamp(28px,4vw,56px)] font-black leading-[1.05] tracking-tight text-white/20">
        {post.title}
      </span>
    </div>
  );
}

function AuthorAvatars({ post }: { post: BlogPostSummary }) {
  if (post.authors.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {post.authors.slice(0, 3).map((author) => (
          author.imageUrl ? (
            <img
              key={author.name}
              src={author.imageUrl}
              alt={author.name}
              className="h-6 w-6 rounded-full border-2 border-[#1a1a1a] object-cover"
            />
          ) : (
            <div
              key={author.name}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#333] text-[10px] font-bold text-white/60"
            >
              {author.name.charAt(0).toUpperCase()}
            </div>
          )
        ))}
      </div>
      <span className="text-[12px] text-[#8c8c8c]">
        {post.authors.map((a) => a.name).join(', ')}
      </span>
    </div>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-block rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-[#8c8c8c]">
      {tag}
    </span>
  );
}

function FeaturedPost({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#1a1a1a] transition hover:border-white/[0.12]">
        <div className="aspect-[2.2/1] w-full overflow-hidden">
          <PostImage
            post={post}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            priority
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#7c7c7c]">
            {post.date && <time>{formatDisplayDate(post.date)}</time>}
            <span>·</span>
            <span>{post.readingTime}</span>
            {post.tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1.5">
                  {post.tags.slice(0, 2).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </>
            )}
          </div>
          <h2 className="mt-3 text-[24px] font-semibold leading-tight text-[#e9eaee] transition group-hover:text-[#fbe593] sm:text-[28px]">
            {post.title}
          </h2>
          {post.description && (
            <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-[#7c7c7c]">
              {post.description}
            </p>
          )}
          <div className="mt-5">
            <AuthorAvatars post={post} />
          </div>
        </div>
      </article>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#1a1a1a] transition hover:border-white/[0.12]">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <PostImage
            post={post}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7c7c7c]">
            {post.date && <time>{formatDisplayDate(post.date)}</time>}
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <h2 className="mt-2.5 line-clamp-2 text-[17px] font-semibold leading-snug text-[#e9eaee] transition group-hover:text-[#fbe593]">
            {post.title}
          </h2>
          {post.description && (
            <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#7c7c7c]">
              {post.description}
            </p>
          )}
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              <AuthorAvatars post={post} />
              {post.tags.length > 0 && (
                <div className="flex gap-1.5">
                  {post.tags.slice(0, 1).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Blog' },
      ]} />
      <CollectionPageJsonLd
        title="Blog"
        description="Helping dev teams adopt OSS technologies and practices. Written by software engineers and community analysts."
        url="/blog"
        posts={posts}
      />
      <header className="mb-10 border-b border-white/[0.08] pb-8">
        <div className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#fbe593]">Blog</div>
        <h1 className="mt-4 text-[30px] font-semibold leading-tight text-[#e9eaee] sm:text-[38px]">
          Reports, tutorials, and product stories
        </h1>
        <p className="mt-4 max-w-[720px] text-[14px] leading-7 text-[#7c7c7c] sm:text-[15px]">
          Helping dev teams adopt OSS technologies and practices. Written by software engineers and community analysts.
        </p>
      </header>

      {featured && <FeaturedPost post={featured} />}

      {rest.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
