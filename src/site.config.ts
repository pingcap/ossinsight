import { defineSiteConfig } from './utils/siteConfig';

export default defineSiteConfig({
  host: 'https://next.ossinsight.io',
  ga: {
    tag: 'GTM-WBZS43V',
    measurementId: 'G-KW4FDPBLLJ',
    measurementSecret: process.env.GA_MESUREMENT_SECRET ?? '',
    clientId: 'ossinsight-next',
  },
  banner: {
    content: 'This is the next version of **[ossinsight.io](https://ossinsight.io)**.',
  },
  widgets: {
    tags: {
      filters: ['Star', 'Pull Request', 'Issue', 'Push', 'Commit']
    }
  },
  header: {
    logo: {
      src: '/logo.png',
      width: 32 / 121 * 300,
      height: 32,
      alt: 'OSS Insight',
    },
    items: [
      {
        label: 'Data Explorer',
        href: 'https://ossinsight.io/explore/',
      },
      {
        label: 'Collections',
        href: 'https://ossinsight.io/collections/',
      },
      {
        label: 'Live',
        items: [
          { label: '2D Version', href: 'https://live.ossinsight.io' },
          { label: '3D Version - GitHub City', href: 'https://live.ossinsight.io/3d' },
        ],
      },
      {
        label: 'Blog',
        href: 'https://ossinsight.io/blog/',
      },
      {
        label: 'API',
        href: 'https://ossinsight.io/docs/api/',
      },
      {
        label: 'Widgets',
        href: '/widgets',
      },
      {
        label: 'More',
        items: [
          { label: 'Workshop', href: 'https://ossinsight.io/docs/workshop' },
          { label: 'About OSS Insight', href: 'https://ossinsight.io/docs/about' },
          {
            label: 'About TiDB Cloud',
            href: 'https://www.pingcap.com/tidb-serverless?utm_source=ossinsight&utm_medium=referral',
          },
          { label: 'How do we implement OSS Insight?', href: 'https://ossinsight.io/blog/why-we-choose-tidb-to-support-ossinsight' },
          { label: 'Report an Issue', href: 'https://github.com/pingcap/ossinsight/issues' },
        ],
      },
      'spacer',
    ],
  },
  sizes: {
    'default': {
      width: 720,
      height: 720 * 9 / 16,
    },
    'preview_image': {
      width: 480,
      height: 270,
    },
    'twitter:summary_large_image': {
      width: 800,
      height: 418,
    },
    'aspect-4-1': {
      width: 436 * 2,
      height: 132 * 2,
    }
  },
});
