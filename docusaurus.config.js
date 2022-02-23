// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'GH Archive Live',
  tagline: 'trends about oss database, js/web framework and more',
  url: 'https://gharchive.live/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'pingcap-inc', // Usually your GitHub org/user name.
  projectName: 'gharchive.live', // Usually your repo name.


  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/pingcap-inc/gharchive.live/edit/main/',
          routeBasePath: '_',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/pingcap-inc/gharchive.live/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-SBJ4WWDNV8',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/gharchive-title-img-en.png',
      metadata: [{name: 'twitter:card', content: 'summary'}],
      navbar: {
        title: 'GH Archive Live',
        logo: {
          alt: 'GH Archive Live',
          src: 'img/logo.svg',
        },
        items: [
          {to: '/blog/about', label: 'About', position: 'left'},
          {
            type: 'doc',
            docId: 'database/index',
            position: 'left',
            label: 'Insight',
          },
          {href: 'https://meta.gharchive.live/public/dashboard/1f3b4bc6-503f-4d25-9936-478902d8238e', label: 'Compare Projects', position: 'left'},
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/_/more/analyze-github-events-on-tidb-cloud-in-10-minutes', label: 'Try It Yourself', position: 'left'},
          {to: '/_/more/how-it-works', label: '▶️  How It Works', position: 'left'},
          {
            href: 'https://tidbcloud.com',
            label: 'TiDB Cloud',
            position: 'left',
          },
          {
            href: 'https://github.com/pingcap-inc/gharchive.live',
            className: 'navbar-item-github',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'GH Archive Live',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Insight',
                to: '/_/database/',
              },
              {
                label: 'Try it yourself',
                to: '/_/more/analyze-github-events-on-tidb-cloud-in-10-minutes',
              },
              {
                label: 'How It Works',
                to: '/_/more/how-it-works',
              },
            ],
          },
          {
            title: 'Sponsored By',
            items: [
              {
                label: 'TiDB Community',
                href: 'https://pingcap.com/community',
              },
              {
                label: 'PingCAP',
                href: 'https://pingcap.com',
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
                label: 'Changelog',
                to: 'blog/changelog',
              },
              {
                label: 'Github',
                href: 'https://github.com/pingcap-inc/gharchive.live',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/pingcap',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} TiDB Cloud, Inc. Built with Docusaurus.`,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'F84G4I8LFA',

        // Public API key: it is safe to commit it
        apiKey: '9e24eb92057c441e0b2f685109cc488e',

        indexName: 'production',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        externalUrlRegex: 'gharchive\\.live|localhost:3000',

        // Optional: Algolia search parameters
        searchParameters: {},

        //... other Algolia params
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        autoCollapseSidebarCategories: true,
      },
    }),
};

module.exports = config;
