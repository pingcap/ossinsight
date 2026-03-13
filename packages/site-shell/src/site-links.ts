import type { SiteApp, SiteHeaderConfig } from './types';
import ExploreIcon from './explore-icon';

type EnvMap = Partial<Record<string, string | undefined>>;

export interface SiteAppOrigins {
  web: string;
  docs: string;
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, '');
}

function getDefaultOrigin(app: SiteApp) {
  return app === 'web' ? 'http://127.0.0.1:3001' : 'http://127.0.0.1:3002';
}

export function getSiteAppOrigins(env: EnvMap = process.env): SiteAppOrigins {
  const webOrigin = env.NEXT_PUBLIC_WEB_HOST ?? env.NEXT_PUBLIC_SITE_HOST ?? getDefaultOrigin('web');
  const docsOrigin = env.NEXT_PUBLIC_DOCS_HOST ?? env.NEXT_PUBLIC_SITE_HOST ?? getDefaultOrigin('docs');

  return {
    web: normalizeOrigin(webOrigin),
    docs: normalizeOrigin(docsOrigin),
  };
}

export function getSiteAppOrigin(app: SiteApp, env: EnvMap = process.env) {
  return getSiteAppOrigins(env)[app];
}

export function getCrossAppHref(currentApp: SiteApp, targetApp: SiteApp, path: string, env: EnvMap = process.env) {
  // Web proxies /blog and /docs to docs app via rewrites, so always use relative paths
  // from web→docs. Only docs→web needs a full origin.
  if (currentApp === targetApp || (currentApp === 'web' && targetApp === 'docs')) {
    return path;
  }

  const origins = getSiteAppOrigins(env);
  return `${origins[targetApp]}${path}`;
}

export function createAppHeaderConfig(app: SiteApp, env: EnvMap = process.env): SiteHeaderConfig {
  return {
    homeHref: getCrossAppHref(app, 'web', '/', env),
    logo: {
      src: '/logo.png',
      width: (32 / 121) * 300,
      height: 32,
      alt: 'OSS Insight',
    },
    items: [
      {
        label: 'Data Explorer',
        href: getCrossAppHref(app, 'web', '/explore', env),
        matchPrefixes: app === 'web' ? ['/explore'] : [],
        icon: ExploreIcon as any,
      },
      {
        label: 'Collections',
        href: getCrossAppHref(app, 'web', '/collections', env),
        matchPrefixes: app === 'web' ? ['/collections'] : [],
      },
      {
        label: 'Blog',
        href: getCrossAppHref(app, 'docs', '/blog', env),
        matchPrefixes: app === 'docs' ? ['/blog'] : [],
      },
      {
        label: 'API',
        href: getCrossAppHref(app, 'docs', '/docs/api', env),
        matchPrefixes: app === 'docs' ? ['/docs/api'] : [],
      },
      {
        label: 'More',
        items: [
          {
            label: 'About OSS Insight',
            href: getCrossAppHref(app, 'docs', '/docs/about', env),
          },
          {
            label: 'FAQ',
            href: getCrossAppHref(app, 'docs', '/docs/faq', env),
          },
          {
            label: 'How do we implement OSS Insight?',
            href: getCrossAppHref(app, 'docs', '/blog/why-we-choose-tidb-to-support-ossinsight', env),
          },
{
            label: 'About TiDB Cloud',
            href: 'https://www.pingcap.com/tidb-serverless?utm_source=ossinsight&utm_medium=referral',
            newTab: true,
          },
          {
            label: 'Report an Issue',
            href: 'https://github.com/pingcap/ossinsight/issues',
            newTab: true,
          },
        ],
      },
      'spacer',
    ],
  };
}
