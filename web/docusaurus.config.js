// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');
const fs = require('fs');

const HOST = process.env.APP_HOST || 'https://ossinsight.io';
const API_BASE = process.env.APP_API_BASE || 'https://api.ossinsight.io';
const DATABASE_URL = process.env.DATABASE_URL || '';
const SENTRY_DSN = process.env.SENTRY_DSN || '';

const getPresets = (fn) => {
  return fs.readFileSync(fn, { encoding: 'utf-8' })
    .split('\n')
    .map(line => line.trim())
    .filter(s => s);
};

const getPrefetched = fn => {
  try {
    return JSON.parse(fs.readFileSync(fn, { encoding: 'utf-8' }));
  } catch (e) {
  }
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OSS Insight',
  tagline: ' Deep Insights into Billions of GitHub events',
  url: HOST,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon-1.png',
  organizationName: 'pingcap',
  projectName: 'ossinsight',

  customFields: {
    auth0_domain: process.env.AUTH0_DOMAIN || '',
    auth0_client_id: process.env.AUTH0_CLIENT_ID || '',
    tidbcloud_host: process.env.TIDBCLOUD_HOST || (process.env.NODE_ENV === 'production' ? 'tidbcloud.com' : 'staging.tidbcloud.com'),
    ga_measure_id: process.env.GA_MEASURE_ID || 'G-KW4FDPBLLJ',
  },

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  stylesheets: [
    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap'
  ],

  clientModules: [
    path.resolve(__dirname, './src/client/linkedin.js'),
    path.resolve(__dirname, './src/client/sentry.ts'),
  ],

  plugins: [
    [
      path.resolve(__dirname, 'plugins/define'),
      {
        'process.env.APP_API_BASE': JSON.stringify(API_BASE),
        'process.env.SENTRY_DSN': SENTRY_DSN ? JSON.stringify(SENTRY_DSN) : undefined,
      }
    ],
    [
      path.resolve(__dirname, 'plugins/alias'),
      {
        '@query': path.resolve(__dirname, '../configs/queries/')
      }
    ],
    [
      path.resolve(__dirname, 'plugins/prefetch'),
      {
        collections: '.prefetch/collections.json',
        eventsTotal: '.prefetch/events-total.json',
        '/q/events-total': 'prefetch',
        '/q/recent-hot-collections': 'prefetch',
      },
    ],
    [
      path.resolve(__dirname, 'plugins/experimental-features'),
      {
        defaultEnabled: [
          'ai-playground',
        ]
      }
    ],
    [
      path.resolve(__dirname, 'plugins/gtag'),
      {
        trackingID: 'GTM-WBZS43V',
        anonymizeIP: true,
      }
    ],
    [
      path.resolve(__dirname, 'plugins/dynamic-route'),
      {
        routes: [
          {
            path: '/analyze/:owner/:repo',
            exact: true,
            component: '@site/src/dynamic-pages/analyze',
            params: getPresets('.preset-analyze')
              .map(name => name.split('/'))
              .map(([owner, repo]) => ({ owner, repo }))
          },
          {
            path: '/analyze/:login',
            exact: true,
            component: '@site/src/dynamic-pages/analyze-user',
          },
          {
            path: '/collections/:slug',
            exact: true,
            component: '@site/src/dynamic-pages/collections',
            params: getPrefetched('.prefetch/collections.json')?.data.map(({ name }) => ({
              slug: require('param-case').paramCase(name)
            }))
          },
          {
            path: '/collections/:slug/trends',
            exact: true,
            component: '@site/src/dynamic-pages/collections/dynamic-trends',
            params: getPrefetched('.prefetch/collections.json')?.data.map(({ name }) => ({
              slug: require('param-case').paramCase(name)
            }))
          },
          {
            path: '/stats/tables/:slug',
            exact: true,
            component: '@site/src/dynamic-pages/stats/tables',
          },
          {
            path: '/stats',
            exact: true,
            component: '@site/src/dynamic-pages/stats',
          }
        ]
      }
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic', // e.g. "classic" or the plugin-content-docs id
        config: {
          public_api: { // "public" is considered the <id> that you will reference in the CLI
            specPath: '../configs/public_api/openapi.yaml', // path or URL to the OpenAPI spec
            baseUrl: `${API_BASE}/public`,
            outputDir: 'docs/api', // output directory for generated *.mdx and sidebar.js files
            sidebarOptions: {
              groupPathsBy: 'tag', // generate a sidebar.js slice that groups operations by tag
              categoryLinkSource: 'tag',
              sidebarCollapsed: false
            },
            template: path.resolve(__dirname, '../configs/public_api/doc.template.mustache'),
          }
        }
      },
    ],
    './plugins/mui',
    process.env.ENABLE_BUNDLE_ANALYZE === 'true' ? './plugins/analyze' : undefined,
  ].filter(Boolean),

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        pages: {
          exclude: [
            '**/_*/**',
            '**/_*'
          ]
        },
        docs: {
          id: 'docs',
          path: 'docs',
          routeBasePath: '/docs',
          editUrl: 'https://github.com/pingcap/ossinsight/tree/main/web/',
          sidebarPath: require.resolve('./sidebars.js'),
          docItemComponent: '@theme/ApiItem',
        },
        blog: {
          blogTitle: 'Blog',
          blogDescription: 'Helping dev teams adopt OSS technologies and practices. Written by software engineers and community analysts.',
          blogSidebarTitle: 'All Blog Posts',
          blogSidebarCount: 'ALL',
          postsPerPage: 10,
          showReadingTime: true,
          editUrl: 'https://github.com/pingcap/ossinsight/edit/main/web/',
          feedOptions: {
            type: ['rss'],
            copyright: `Copyright © ${new Date().getFullYear()} PingCAP`,
          },
        },
        theme: {
          customCss: [
            require.resolve('animate.css/source/_vars.css'),
            require.resolve('animate.css/source/_base.css'),
            require.resolve('animate.css/source/bouncing_entrances/bounceInRight.css'),
            require.resolve('animate.css/source/attention_seekers/tada.css'),
            require.resolve('./src/css/custom.css'),
            require.resolve('react-awesome-animated-number/dist/index.css'),
          ],
        }
      }),
    ],
  ],
  themes: ['docusaurus-theme-openapi-docs'],
  themeConfig:
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/screenshots/homepage.png',
      metadata: [
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'keywords',
          content: 'tidb, mysql, github events, github archive, github metrics, oss, compare oss, oss analysis, pingcap, insight tool, data visualization, rank, trend'
        }
      ],
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      announcementBar: {
        id: 'announcement-20230821',
        content:
          '<a target="_blank" href="https://next.ossinsight.io/widgets" style="font-weight:bold">✨ Spark Your GitHub Magic: Customize and Share with Your Personalized Widgets!</a>',
        backgroundColor: '#4C33B1',
        textColor: '#ffffff',
        isCloseable: true,
      },
      docs: {
        sidebar: {
          hideable: true,
        }
      },
      navbar: {
        logo: {
          alt: 'OSS Insight Logo',
          src: 'img/logo.svg',
        },
        style: 'dark',
        items: [
          {
            to: '/explore/',
            position: 'left',
            html: '<span id="nav-data-explorer"><span class="nav-explore-icon"></span> Data Explorer</span>'
          },
          {
            to: '/collections',
            position: 'left',
            label: 'Collections',
            activeBasePath: '/collections'
          },
          {
            type: 'dropdown',
            label: 'Live',
            position: 'left',
            items: [
              { label: '2D Version', to: 'https://live.ossinsight.io' },
              { label: '3D Version - GitHub City', to: 'https://live.ossinsight.io/3d' },
            ],
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          { to: '/docs/api', label: 'API', position: 'left' },
          { to: 'https://next.ossinsight.io/widgets', label: 'Widgets', position: 'left', target: '_self' },
          /* {
            type: 'dropdown',
            label: 'Workshop',
            position: 'left',
            items: [
              {label: '🗓️ Join Workshop!', to: '/docs/workshop'},
              {label: '└─ mini OSS Insight 🔥', to: '/docs/workshop/mini-ossinsight/introduction'},
              {label: '└─ NFT Insight', to: '/docs/workshop/nft-insight'},
              {label: '└─ Twitter Insight - not ready', to: '/docs/workshop/twitter-insight'},
              {label: '└─ Stack Overflow Insight - not ready', to: '/docs/workshop/stackoverflow-insight'},
            ]
          }, */
          /*
          {
            type: 'dropdown',
            label: 'Labs',
            position: 'left',
            items: [
              {label: '🏛️  Company Analytics [Beta]', to: '/analyze-company'},
            ]
          },
          */
          {
            type: 'dropdown',
            label: 'More',
            position: 'left',
            items: [
              { label: 'About OSS Insight', to: '/docs/about' },
              {
                label: 'About TiDB Cloud',
                to: 'https://www.pingcap.com/tidb-serverless?utm_source=ossinsight&utm_medium=referral'
              },
              { label: 'How do we implement OSS Insight?', to: '/blog/why-we-choose-tidb-to-support-ossinsight' },
              /* { label: 'Database Stats', to: '/stats' }, */
              { label: 'Report an Issue', to: 'https://github.com/pingcap/ossinsight/issues' },
            ]
          },
          {
            type: 'custom-search',
          },
          {
            type: 'custom-realtime-summary',
            position: 'right',
          },
          {
            href: 'https://twitter.com/OSSInsight',
            className: 'navbar-item-twitter',
            position: 'right',
            alt: 'Twitter Logo (Header)',
          },
          DATABASE_URL.indexOf('docker.internal') !== -1 && {
            type: 'dropdown',
            label: '⚙️ ',
            position: 'right',
            items: [
              { label: 'Database Overview', to: 'http://localhost:2379/dashboard/#/overview' },
              { label: '└─ Cluster Topology', to: 'http://localhost:2379/dashboard/#/cluster_info/store_topology' },
              { label: '└─ Host Info: CPU, Memory, Disk', to: 'http://localhost:2379/dashboard/#/cluster_info/instance' },
              { label: 'Database Diagnostic', to: 'http://localhost:2379/dashboard/#/system_report' },
              { label: '└─ All SQL Statements', to: 'http://localhost:2379/dashboard/#/statement' },
              { label: '└─ SQLs Cause High Load', to: 'http://localhost:2379/dashboard/#/topsql' },
              { label: '└─ Slow Queries', to: 'http://localhost:2379/dashboard/#/topsql' },
              { label: '└─ Traffic Hotspots', to: 'http://localhost:2379/dashboard/#/keyviz' },
              { label: 'Database Logs', to: 'http://localhost:2379/dashboard/#/search_logs' },
            ]
          },
          {
            type: 'custom-login',
            position: 'right',
          }
        ].filter(Boolean),
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'OSS Insight',
            items: [
              {
                label: 'Collections',
                to: '/collections',
              },
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Workshop',
                to: '/docs/workshop',
              },
              {
                label: 'API',
                to: '/docs/api',
              },
              {
                label: 'How do we implement OSS Insight?',
                to: '/blog/why-we-choose-tidb-to-support-ossinsight',
              },
              {
                label: 'About',
                to: '/docs/about',
              },
              {
                label: 'FAQ',
                to: '/docs/faq',
              },
            ],
          },
          {
            title: 'Sponsored By',
            items: [
              {
                label: 'TiDB Cloud',
                href: 'https://www.pingcap.com/tidb-serverless?utm_source=ossinsight&utm_medium=referral',
              },
            ],
          },
          {
            title: 'Built With',
            items: [
              {
                label: 'GitHub REST API',
                href: 'https://docs.github.com/en/rest',
              },
              {
                label: 'GH Archive',
                href: 'http://www.gharchive.org/',
              },
              {
                label: 'Docusaurus',
                href: 'https://github.com/facebook/docusaurus',
              },
              {
                label: 'Apache ECharts',
                href: 'https://echarts.apache.org/',
              },
              {
                label: 'React',
                href: 'https://github.com/facebook/react',
              },
              {
                label: 'TypeScript',
                href: 'https://www.typescriptlang.org/',
              },
            ],
          },
          {
            title: 'Contacts',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/OSSInsight',
              },
              {
                label: 'Email',
                href: 'mailto:ossinsight@pingcap.com',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/pingcap/ossinsight',
              },
              {
                html: '<br /><b>Location</b><p style="color:grey">PingCAP<br />440 N Wolfe Rd<br /> Sunnyvale, CA 94085<br />USA<br />☎️  +1 650 382 9973</p>',
              },
            ],
          },
        ],
        logo: {
          alt: 'TiDB Cloud Logo',
          src: '/img/tidb-cloud-logo-o.png',
          href: 'https://www.pingcap.com/tidb-serverless/?utm_source=ossinsight&utm_medium=referral',
          width: 200,
        },
        copyright: `Copyright &copy; ${new Date().getFullYear()} <a href="https://en.pingcap.com" target="_blank">PingCAP</a>. All Rights Reserved | <a href="https://en.pingcap.com/privacy-policy/" target="_blank">Privacy</a>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        autoCollapseSidebarCategories: true,
      },
      // hubspot: {
      //   accountId: '4466002',
      // },
    }),
};

module.exports = config;
