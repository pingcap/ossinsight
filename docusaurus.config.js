// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Open Source Software Insight',
  tagline: ' Explore deep insights from 4,500,000,000+ GitHub Events',
  url: 'https://ossinsight.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'pingcap', // Usually your GitHub org/user name.
  projectName: 'ossinsight', // Usually your repo name.
  scripts: [
    'https://api.ossinsight.io/qo/repos/groups/osdb?format=global_variable'
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        pages: {
          exclude: [
            '**/_*/**',
          ]
        },
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/pingcap/ossinsight/edit/main/',
          routeBasePath: '/',
        },
        blog: {
          feedOptions: {
            type: 'all',
          },
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/pingcap/ossinsight/edit/main/',
          blogSidebarCount: 0,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-KW4FDPBLLJ',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/gharchive-title-img.png',
      metadata: [{name: 'twitter:card', content: 'summary_large_image'}, {name: 'keywords', content: 'tidb, gharchive'}],
      hideableSidebar: true,
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
//       announcementBar: {
//         id: 'announcement-20220414',
//         content:
//           'TiDB 6.0 is released, go to read the <a target="_blank" rel="noopener noreferrer" href="https://docs.pingcap.com/tidb/v6.0/release-6.0.0-dmr">release notes</a> 🎉🎉🎉',
//         backgroundColor: '#fafbfc',
//         textColor: '#091E42',
//         isCloseable: false,
//       },
      navbar: {
        title: 'OSS Insight',
        logo: {
          alt: 'OSS Insight',
          src: 'img/logo.svg',
        },
        style: 'dark',
        items: [
          {to: '/blog/about', label: 'About', position: 'left'},
          {
            type: 'doc',
            docId: 'database/realtime',
            position: 'left',
            label: 'Insight',
          },
          {to: '/compare', label: 'Compare Projects', position: 'left'},
          {to: '/blog/try-it-yourself/', label: '🔧 Try It Yourself', position: 'left'},
          {to: '/blog/how-it-works', label: 'How It Works', position: 'left'},
          {
            href: 'https://tidbcloud.com',
            label: 'Sign In',
            position: 'right',
          },
          {
            href: 'https://github.com/pingcap/ossinsight',
            className: 'navbar-item-github',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'OSS Insight',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Insight',
                to: '/database/realtime',
              },
              {
                label: 'Try it yourself',
                to: '/blog/try-it-yourself/',
              },
              {
                label: 'How It Works',
                to: '/blog/how-it-works',
              },
            ],
          },
          {
            title: 'Sponsored By',
            items: [
              {
                label: 'TiDB Community',
                href: 'https://en.pingcap.com/community',
              },
              {
                label: 'PingCAP',
                href: 'https://en.pingcap.com',
              },
            ],
          },
          {
            title: 'Built With',
            items: [
              {
                label: 'GH Archive - Data Source',
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
                label: 'TiDB Cloud',
                href: 'https://tidbcloud.com',
              },
              {
                label: 'TiDB',
                href: 'https://github.com/pingcap/tidb',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Github',
                href: 'https://github.com/pingcap/ossinsight',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/pingcap',
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/pingcap',
              },
              {
                label: 'RSS',
                to: '/blog/rss.xml',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} PingCAP`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        autoCollapseSidebarCategories: true,
      },
    }),
};

module.exports = config;
