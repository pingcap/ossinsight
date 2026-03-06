'use client';

import HTMLIcon from 'bootstrap-icons/icons/code-slash.svg';
import ImageIcon from 'bootstrap-icons/icons/image.svg';
import MarkdownIcon from 'bootstrap-icons/icons/markdown.svg';
import { useMemo } from 'react';
import { CodeBlock } from '../CodeBlock';
import { useColorScheme } from '../ColorScheme';
import { Tab, Tabs } from '../Tabs';
import { TwitterButton } from './TwitterButton';

export interface ShareBlockProps extends ShareOptions {
  themedImage?: boolean;
}

export interface ShareOptions {
  title: string;
  url: string;
  thumbnailUrl: string;
  keywords?: string[];
  imageWidth: number;
  imageHeight?: number;
}

export function ShareBlock ({
  title: blockTitle,
  url,
  thumbnailUrl: propThumbnailUrl,
  keywords,
  imageWidth,
  themedImage = false,
}: ShareBlockProps) {
  const { colorScheme } = useColorScheme();

  const thumbnailUrl = useMemo(() => {
    const url = new URL(propThumbnailUrl);

    if (colorScheme === 'auto') {
      url.searchParams.delete('color_scheme');
    } else {
      url.searchParams.set('color_scheme', colorScheme);
    }

    return url.toString();
  }, [propThumbnailUrl, colorScheme])

  return (
    <div>
      <Tabs className='mt-2'>
        <Tab value='Markdown' title='Markdown' icon={<MarkdownIcon />}>
          <CodeBlock
            language={themedImage ? 'html' : 'markdown'}
            code={markdownCode(
              colorScheme,
              blockTitle,
              url,
              thumbnailUrl,
              imageWidth
            )}
            wrap
            className='pt-8 lg:pt-0'
            copyButtonProps={{
              copyText: 'Copy and Paste it into README.md',
              copiedText: 'Copy and Paste it into README.md',
              className: 'lg:top-[-38px] lg:right-4 text-[var(--color-primary)] hover:text-[var(--color-primary-highlighted)] transition-colors'
            }}
          />
        </Tab>
        <Tab value='HTML' title='HTML' icon={<HTMLIcon />}>
          <CodeBlock
            code={htmlCode(
              colorScheme,
              blockTitle,
              url,
              thumbnailUrl,
              imageWidth
            )}
            language='html'
            wrap
          />
        </Tab>
        <Tab value='image' title='Thumbnail' icon={<ImageIcon />}>
          <CodeBlock code={`${thumbnailUrl}`} wrap />
        </Tab>
      </Tabs>
    </div>
  );
}


export function markdownCode (colorScheme: string, title: string, url: string, thumbnailUrl: string, width: number) {
  if (colorScheme !== 'auto') {
    return `[![${title}](${thumbnailUrl})](${url})`;
  }
  return `<!-- Copy-paste in your Readme.md file -->

<a href="${url}" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${thumbnailUrl}&color_scheme=dark" width="${width + 1}" height="auto">
    <img alt=${JSON.stringify(title)} src="${thumbnailUrl}&color_scheme=light" width="${width + 1}" height="auto">
  </picture>
</a>

<!-- Made with [OSS Insight](https://ossinsight.io/) -->`
}

export function htmlCode (colorScheme: string, title: string, url: string, thumbnailUrl: string, width: number) {
  if (colorScheme !== 'auto') {
    return `<a href="${url}" target="_blank">
  <img src="${thumbnailUrl}" width="${width}" height="auto" alt="${title}">
</a>`
  }
  return markdownCode(colorScheme, title, url, thumbnailUrl, width);
}
