import React from 'react';
import clsx from 'clsx';
import { useBlogPost } from '@docusaurus/theme-common/internal';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import type { Props } from '@theme/BlogPostItem';
import ShareButtons from '@site/src/components/ShareButtons';

// apply a bottom margin in list view
function useContainerClassName () {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

export default function BlogPostItem ({
  children,
  className,
}: Props): JSX.Element {
  const containerClassName = useContainerClassName();
  const { metadata: { title }, isBlogPostPage } = useBlogPost();

  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      {isBlogPostPage && <ShareButtons title={`${title} | OSSInsight`} />}
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      {isBlogPostPage && <ShareButtons title={`${title} | OSSInsight`} />}
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
