import type { ReactNode } from 'react';
import { getSiteAppOrigin } from '../../../packages/site-shell/src/site-links';

type ShareButtonsProps = {
  title: string;
  sharePath: string;
  hashtags?: string[];
};

function objectToGetParams(object: Record<string, string | undefined>) {
  const params = Object.entries(object)
    .flatMap(([key, value]) => {
      if (value == null || value === '') {
        return [];
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });

  return params.length > 0 ? `?${params.join('&')}` : '';
}

function twitterLink(url: string, { title, hashtags = [] }: { title: string; hashtags?: string[] }) {
  return `https://twitter.com/share${objectToGetParams({
    url,
    text: title,
    hashtags: hashtags.length > 0 ? hashtags.join(',') : undefined,
  })}`;
}

function linkedinLink(url: string, { title }: { title: string }) {
  return `https://linkedin.com/shareArticle${objectToGetParams({
    url,
    mini: 'true',
    title,
    source: 'OSS Insight',
  })}`;
}

function redditLink(url: string, { title }: { title: string }) {
  return `https://www.reddit.com/submit${objectToGetParams({
    url,
    title,
  })}`;
}

function telegramLink(url: string, { title }: { title: string }) {
  return `https://telegram.me/share/url${objectToGetParams({
    url,
    text: title,
  })}`;
}

const iconStyle = { width: '1rem', height: '1rem', fill: 'currentColor' };

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current" style={iconStyle}>
      <path d="M18.901 1.153h3.68l-8.037 9.188L24 22.847h-7.406l-5.8-7.584-6.637 7.584H.474l8.596-9.825L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.291 19.492h2.039L6.486 3.24H4.298L17.61 20.645Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current" style={iconStyle}>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.5 8h4V23h-4V8Zm7 0h3.83v2.05h.05C11.91 8.97 13.7 7.5 16.3 7.5 21.1 7.5 22 10.66 22 14.77V23h-4v-7.3c0-1.74-.03-3.97-2.42-3.97-2.43 0-2.8 1.9-2.8 3.84V23h-4V8Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current" style={iconStyle}>
      <path d="M9.04 15.47 8.66 20.8c.54 0 .77-.23 1.05-.5l2.52-2.41 5.22 3.82c.96.53 1.63.25 1.89-.88l3.43-16.08h.01c.31-1.46-.53-2.03-1.46-1.68L1.4 10.8c-1.36.53-1.34 1.29-.23 1.63l5.1 1.59L18.1 6.56c.56-.37 1.07-.16.65.21" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current" style={iconStyle}>
      <path d="M14.46 15.28a.96.96 0 1 1-1.92 0 .96.96 0 0 1 1.92 0Zm-4.92-.96a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92Zm9.4-2.13a1.7 1.7 0 0 0-2.89-1.2 7.93 7.93 0 0 0-3.78-1.17l.8-3.74 2.6.55a1.44 1.44 0 1 0 .24-1.13l-2.98-.63a.57.57 0 0 0-.67.44l-.92 4.33a7.9 7.9 0 0 0-4 1.16 1.7 1.7 0 1 0-1.03 3.03c0 .17-.01.34-.01.51 0 2.58 2.99 4.68 6.66 4.68s6.66-2.1 6.66-4.68c0-.16 0-.32-.02-.48a1.7 1.7 0 0 0 1.34-1.67Zm-1.98 2.15c0 1.96-2.31 3.55-5.16 3.55s-5.16-1.59-5.16-3.55 2.31-3.55 5.16-3.55 5.16 1.59 5.16 3.55Zm-2.02 2.22a.56.56 0 0 0-.79.08c-.52.67-1.51 1.02-2.35 1.02-.84 0-1.83-.35-2.35-1.02a.56.56 0 1 0-.88.7c.73.91 2 1.44 3.23 1.44 1.24 0 2.5-.53 3.24-1.44a.56.56 0 0 0-.1-.78Z" />
    </svg>
  );
}

function ShareButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#212122] transition hover:bg-[#fceeb4]"
    >
      {children}
    </a>
  );
}

export function ShareButtons({ title, sharePath, hashtags }: ShareButtonsProps) {
  const url = `${getSiteAppOrigin('docs')}${sharePath}`;

  return (
    <div className="flex items-center justify-end gap-4">
      <ShareButton href={twitterLink(url, { title, hashtags })} label="Share on X">
        <XIcon />
      </ShareButton>
      <ShareButton href={linkedinLink(url, { title })} label="Share on LinkedIn">
        <LinkedInIcon />
      </ShareButton>
      <ShareButton href={telegramLink(url, { title })} label="Share on Telegram">
        <TelegramIcon />
      </ShareButton>
      <ShareButton href={redditLink(url, { title })} label="Share on Reddit">
        <RedditIcon />
      </ShareButton>
    </div>
  );
}
