// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path')
const fs = require('fs')

const HOST = process.env.APP_HOST || 'https://ossinsight.io'
const API_BASE = process.env.APP_API_BASE || 'https://api.ossinsight.io'

const getPresets = (fn) => {
  return fs.readFileSync(fn, { encoding: 'utf-8' })
    .split('\n')
    .map(line => line.trim())
    .filter(s => s)
}

const getPrefetched = fn => {
  try {
    return JSON.parse(fs.readFileSync(fn, {encoding: 'utf-8'}))
  } catch (e) {}
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'OSS Insight',
  tagline: ' Deep Insights into Billions of GitHub events',
  url: HOST,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/cloud-o.png',
  organizationName: 'pingcap',
  projectName: 'ossinsight',
  scripts: [
    API_BASE + '/qo/repos/groups/osdb?format=global_variable',
    'https://www.google.com/recaptcha/api.js?render=6LcBQpkfAAAAAFmuSRkRlJxVtmqR34nNawFgKohC'
  ],
  clientModules: [path.resolve(__dirname, './src/client/linkedin.js')],
  plugins: [
    [
      path.resolve(__dirname, 'plugins/define'),
      {
        'process.env.APP_API_BASE': JSON.stringify(API_BASE),
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
      path.resolve(__dirname, 'plugins/prefetch'),
      {
        collections: '.prefetch/collections.json',
        eventsTotal: '.prefetch/events-total.json'
      }
    ],
    [
      "content-docs",
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: "workshop",
        path: "workshop",
        routeBasePath: "/workshop",
        editUrl: "https://github.com/pingcap/ossinsight/tree/main",
        sidebarPath: require.resolve("./sidebars.js"),
      }),
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
            params: getPrefetched('.prefetch/collections.json')?.data.map(({name}) => ({
              slug: require('param-case').paramCase(name)
            }))
          },
          {
            path: '/collections/:slug/trends',
            exact: true,
            component: '@site/src/dynamic-pages/collections/dynamic-trends',
            params: getPrefetched('.prefetch/collections.json')?.data.map(({name}) => ({
              slug: require('param-case').paramCase(name)
            }))
          }
        ]
      }
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: '_blog',
        routeBasePath: '_blog',
        path: './_blog',
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/database/deep-insight-into-open-source-databases',
            to: '/blog/deep-insight-into-open-source-databases',
          },
          {
            from: '/js-framework/deep-insight-into-js-framework-2021',
            to: '/blog/deep-insight-into-js-framework-2021',
          },
          {
            from: '/language/deep-insight-into-programming-languages-2021',
            to: '/blog/deep-insight-into-programming-languages-2021',
          },
          {
            from: '/low-code/deep-insight-into-lowcode-development-tools-2021',
            to: '/blog/deep-insight-into-lowcode-development-tools-2021',
          },
          {
            from: '/web-framework/deep-insight-about-web-framework-2021',
            to: '/blog/deep-insight-into-web-framework-2021',
          },
        ]
      }
    ]
  ],
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
        docs: false,
        blog: {
          blogTitle: 'Blog',
          blogSidebarTitle: 'All Blog Posts',
          blogSidebarCount: 'ALL',
          postsPerPage: 10,
          showReadingTime: true,
          editUrl: 'https://github.com/pingcap/ossinsight/edit/main/',
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
            require.resolve('./src/css/custom.css'),
            require.resolve('react-awesome-animated-number/dist/index.css'),
          ],
        }
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/screenshots/homepage.png',
      metadata: [
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'keywords', content: 'tidb, mysql, github events, github archive, github metrics, oss, compare oss, oss analysis, pingcap, insight tool, data visualization, rank, trend'}
      ],
      hideableSidebar: true,
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      announcementBar: {
        id: 'announcement-20220623',
        content:
        '💡 <a target="_blank" href="/blog/why-we-choose-tidb-to-support-ossinsight/" style="font-weight:bold">How we built a powerful insight tool in a week ?</a>',
        backgroundColor: '#6F6290',
        textColor: '#ffffff', 
        isCloseable: true,
      },
      navbar: {
        title: 'OSS Insight',
        logo: {
          alt: 'OSS Insight Logo',
          src: 'img/cloud-o.png',
        },
        style: 'dark',
        items: [
          {
            to: '/collections/open-source-database',
            position: 'left',
            label: 'Collections',
            activeBasePath: '/collections'
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            type: 'dropdown',
            label: 'Workshop',
            position: 'left',
            items: [
              {label: '🗓️ Join Workshop!', to: '/workshop/overview'},
              {label: '└─ mini OSS Insight', to: '/workshop/mini-ossinsight/introduction'},
              {label: '└─ NFT Insight', to: '/workshop/nft-insight'},
              {label: '└─ Twitter Insight - not ready', to: '/workshop/twitter-insight'},
              {label: '└─ Stack Overflow Insight - not ready', to: '/workshop/stackoverflow-insight'},
              {label: '└─ Cryptocurrency Insight - not ready', to: '/workshop/cryptocurrency-insight'},
            ]
          },
          {
            type: 'dropdown',
            label: 'Labs',
            position: 'left',
            items: [
              {label: '🏛️  Company Analytics [Beta]', to: '/analyze-company'},
            ]
          },
          {
            type: 'dropdown',
            label: 'More',
            position: 'left',
            items: [
              {label: 'About OSS Insight', to: '/about'},
              {label: 'About TiDB Cloud', to: 'https://en.pingcap.com/tidb-cloud?utm_source=ossinsight&utm_medium=referral'},
              {label: 'How we implement OSS Insight?', to: '/blog/why-we-choose-tidb-to-support-ossinsight'},
              {label: 'Report Issue', to: 'https://github.com/pingcap/ossinsight/issues'},
            ]
          },
          {
            href: 'https://twitter.com/OSSInsight',
            className: 'navbar-item-twitter',
            position: 'right',
            alt: 'Twitter Logo (Header)',
          },
          process.env.NODE_ENV == 'development' && {
            type: 'dropdown',
            label: '⚙️ ',
            position: 'right',
            items: [
              {label: 'Database Overview', to: 'http://localhost:2379/dashboard/#/overview'},
              {label: '└─ Cluster Topology', to: 'http://localhost:2379/dashboard/#/cluster_info/store_topology'},
              {label: '└─ Host Info: CPU, Memory, Disk', to: 'http://localhost:2379/dashboard/#/cluster_info/instance'},
              {label: 'Database Diagnostic', to: 'http://localhost:2379/dashboard/#/system_report'},
              {label: '└─ All SQL Statements', to: 'http://localhost:2379/dashboard/#/statement'},
              {label: '└─ SQLs Cause High Load', to: 'http://localhost:2379/dashboard/#/topsql'},
              {label: '└─ Slow Queries', to: 'http://localhost:2379/dashboard/#/topsql'},
              {label: '└─ Traffic Hotspots', to: 'http://localhost:2379/dashboard/#/keyviz'},
              {label: 'Database Logs', to: 'http://localhost:2379/dashboard/#/search_logs'},
            ]
          },
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
                to: '/collections/open-source-database',
              },
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Workshop',
                to: '/workshop/overview',
              },
              {
                label: 'How we implement OSS Insight?',
                to: '/blog/why-we-choose-tidb-to-support-ossinsight',
              },
              {
                label: 'About',
                to: '/about',
              },
            ],
          },
          {
            title: 'Sponsored By',
            items: [
              {
                label: 'TiDB Cloud',
                href: 'https://en.pingcap.com/tidb-cloud?utm_source=ossinsight&utm_medium=referral',
              },
            ],
          },
          {
            title: 'Built With',
            items: [
              {
                label: 'GitHub API',
                href: 'https://docs.github.com/en/rest',
              },
              {
                label: 'GH Archive',
                href: 'http://www.gharchive.org/',
              },
              {
                label: 'GHTorrent',
                href: 'https://ghtorrent.org/',
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
                html: '<br /><b>Location</b><p style="color:grey">California, USA<br />1250 Borregas Ave, Office 131<br />Sunnyvale, CA 94089<br />☎️  +1 650 382 9973</p>',
              },
            ],
          },
        ],
        logo: {
          alt: 'TiDB Cloud Logo',
          src: '/img/tidb-cloud-logo-o.png',
          href: 'https://en.pingcap.com/tidb-cloud/?utm_source=ossinsight&utm_medium=referral',
          width: 200,
        },
        copyright: `Copyright &copy; ${new Date().getFullYear()} <a href="https://en.pingcap.com" target="_blank">PingCAP</a>. All Rights Reserved | <a href="https://en.pingcap.com/privacy-policy/" target="_blank">Privacy</a>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        autoCollapseSidebarCategories: true,
      },
    }),
};

module.exports = config;
