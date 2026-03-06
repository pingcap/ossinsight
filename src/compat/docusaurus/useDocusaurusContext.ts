type DocusaurusSiteConfig = {
  url: string;
  customFields: {
    auth0_domain?: string;
    auth0_client_id?: string;
    tidbcloud_host?: string;
    ga_measure_id?: string;
    [key: string]: unknown;
  };
};

export default function useDocusaurusContext(): { siteConfig: DocusaurusSiteConfig } {
  return {
    siteConfig: {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ossinsight.io',
      customFields: {
        auth0_domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
        auth0_client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
        tidbcloud_host: process.env.NEXT_PUBLIC_TIDBCLOUD_HOST || 'tidbcloud.com',
        ga_measure_id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      },
    },
  };
}
