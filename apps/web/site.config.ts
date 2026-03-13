import { defineSiteConfig } from './utils/siteConfig';
import { createAppHeaderConfig } from '@repo/site-shell';

export default defineSiteConfig({
  host: process.env.NEXT_PUBLIC_SITE_HOST || 'https://ossinsight.io',
  ga: {
    tag: 'GTM-WBZS43V',
    measurementId: 'G-KW4FDPBLLJ',
  },
  banner: {
    content: 'This is the next version of **[ossinsight.io](https://ossinsight.io)**.',
  },
  header: createAppHeaderConfig('web'),
});
