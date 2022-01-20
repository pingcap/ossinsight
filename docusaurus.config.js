// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'GH Archive Live',
  tagline: 'An overview of the OSS in 2021: trends about database and web frameworks, programming language, low code, javascript framework, CSS framework ... ',
  url: 'https://staticsiteg.github.io/',
  baseUrl: '/docus/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'staticsiteg', // Usually your GitHub org/user name.
  projectName: 'docus', // Usually your repo name.


  scripts: [
    {
      src: 'https://giscus.app/client.js',
      async: true,
      "data-repo": "hooopo/gharchive",
      "data-repo-id": "R_kgDOGYZudg",
      "data-category": "Announcements",
      "data-category-id": "DIC_kwDOGYZuds4CAw6F",
      "data-mapping": "pathname",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-theme": "preferred_color_scheme",
      "data-lang": "zh-CN",
      "crossorigin": "anonymous"
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
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
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'database/year-2021',
            position: 'left',
            label: 'Explore',
          },
          {to: '/blog', label: 'Monthly Reports', position: 'left'},
          {to: '/docs/how-it-works', label: 'How it works', position: 'left'},
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Explore',
                to: '/docs/database/year-2021',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
