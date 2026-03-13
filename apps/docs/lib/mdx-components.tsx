import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import { getSiteAppOrigin } from '../../../packages/site-shell/src/site-links';
const WEB_PATH_PREFIXES = ['/analyze', '/collections', '/explore'];

function getWebOrigin(env: NodeJS.ProcessEnv = process.env) {
  return getSiteAppOrigin('web', env);
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:');
}

function isWebAppHref(href: string) {
  return WEB_PATH_PREFIXES.some((prefix) => href === prefix || href.startsWith(`${prefix}/`));
}

function resolveContentHref(href: string) {
  if (href.startsWith('https://ossinsight.io/') || href.startsWith('http://ossinsight.io/')) {
    const url = new URL(href);
    return resolveContentHref(`${url.pathname}${url.search}${url.hash}`);
  }

  if (href.startsWith('/') && isWebAppHref(href)) {
    return `${getWebOrigin()}${href}`;
  }

  return href;
}

function joinClassName(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function MdxLink({
  className,
  href = '',
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  const resolvedHref = resolveContentHref(href);
  const linkClassName = joinClassName('site-link font-medium', className);

  if (resolvedHref.startsWith('/')) {
    return <Link href={resolvedHref} className={linkClassName} {...props} />;
  }

  const external = isExternalHref(resolvedHref);

  return (
    <a
      href={resolvedHref}
      className={linkClassName}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      {...props}
    />
  );
}

export function MdxImage({
  alt = '',
  className,
  ...props
}: ComponentPropsWithoutRef<'img'>) {
  const isPlainLogo = alt.trim().toLowerCase() === 'tidb cloud logo';

  return (
    <img
      alt={alt}
      className={joinClassName(
        isPlainLogo
          ? 'mx-auto my-4 block h-8 max-h-8 w-auto rounded-none border-0 bg-transparent object-contain shadow-none'
          : 'mx-auto my-6 block h-auto max-w-full rounded-none border-0 bg-transparent shadow-none',
        className,
      )}
      loading="lazy"
      {...props}
    />
  );
}

export function MdxTable({
  className,
  ...props
}: ComponentPropsWithoutRef<'table'>) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className={joinClassName('min-w-full text-sm', className)} {...props} />
    </div>
  );
}

export const docsMdxComponents = {
  a: MdxLink,
  code: ({ className, ...props }: ComponentPropsWithoutRef<'code'>) => {
    if (className || 'data-language' in props) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className={joinClassName(
          'bg-white/[0.04] px-1 py-0.5 text-[0.9em] text-[#fff1bf]',
          className,
        )}
        {...props}
      />
    );
  },
  details: ({ className, ...props }: ComponentPropsWithoutRef<'details'>) => (
    <details
      className={joinClassName(
        'my-6 border-y border-white/[0.08] py-3',
        className,
      )}
      {...props}
    />
  ),
  iframe: ({ className, ...props }: ComponentPropsWithoutRef<'iframe'>) => (
    <div className="my-8 overflow-hidden">
      <iframe
        className={joinClassName('aspect-video w-full bg-black', className)}
        {...props}
      />
    </div>
  ),
  img: MdxImage,
  pre: ({ className, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre className={joinClassName('overflow-x-auto text-[13px]', className)} {...props} />
  ),
  summary: ({ className, ...props }: ComponentPropsWithoutRef<'summary'>) => (
    <summary
      className={joinClassName(
        'cursor-pointer list-none py-2 text-sm font-semibold text-white marker:hidden',
        className,
      )}
      {...props}
    />
  ),
  table: MdxTable,
};
