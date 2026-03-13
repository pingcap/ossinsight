import { defineSiteConfig } from './utils/siteConfig';
import { createAppHeaderConfig } from '@repo/site-shell';

export default defineSiteConfig({
  host: process.env.NEXT_PUBLIC_SITE_HOST || 'https://ossinsight.io',
  ga: {
    tag: 'GTM-WBZS43V',
    measurementId: 'G-KW4FDPBLLJ',
    // Prefer the correctly spelled env var, but keep the legacy typo as a fallback.
    measurementSecret: process.env.GA_MEASUREMENT_SECRET ?? process.env.GA_MESUREMENT_SECRET ?? '',
    clientId: 'ossinsight-next',
  },
  banner: {
    content: 'This is the next version of **[ossinsight.io](https://ossinsight.io)**.',
  },
  header: createAppHeaderConfig('web'),
});
