// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'GH Archive Live: trends about oss database, js/web framework and more',
  tagline: 'We store GitHub events data from Feb 2011 in TiDB Cloud and update hourly, then analyze the trends of stars, pull requests, and many more metrics of repositories.',
  url: 'https://gharchive.live/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
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
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/pingcap-inc/gharchive.live/edit/main/',
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
            label: 'Ranking',
          },
          {href: 'https://asdf.com/compare-projects', label: 'Compare Projects', position: 'left'},
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/docs/more/analyze-github-events-on-tidb-cloud-in-10-minutes', label: 'Try It Yourself', position: 'left'},
          {to: '/docs/more/how-it-works', label: 'How It Works', position: 'left'},
          {
            href: 'https://tidbcloud.com',
            label: '☁️  TiDB Cloud',
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
                label: 'Rankings',
                to: '/docs/database/',
              },
              {
                label: 'Try it yourself',
                to: '/docs/more/analyze-github-events-on-tidb-cloud-in-10-minutes',
              },
              {
                label: 'how it works',
                to: '/docs/more/how-it-works',
              },
            ],
          },
          {
            title: 'Powered By',
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
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Docusaurus',
                href: 'https://github.com/facebook/docusaurus',
              },
              {
                label: 'Cube.js',
                href: 'https://github.com/cube-js/cube.js',
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
        appId: 'J1NCM6ALOY',

        // Public API key: it is safe to commit it
        apiKey: '55f3ef33aeda88938a7aac1c1278e143',

        indexName: 'all',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        externalUrlRegex: 'gharchive\\.live|domain\\.com',

        // Optional: Algolia search parameters
        searchParameters: {},

        //... other Algolia params
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
