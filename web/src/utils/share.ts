// see https://github.com/nygardk/react-share/tree/master/src

function objectToGetParams (object: any) {
  const params = Object.entries(object).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
}

export function twitterLink (
  url: string,
  {
    title,
    via,
    hashtags = [],
    related = [],
  }: { title?: string, via?: string, hashtags?: string[], related?: string[] },
) {
  return (
    'https://twitter.com/share' +
    objectToGetParams({
      url,
      text: title,
      via,
      hashtags: hashtags.length > 0 ? hashtags.join(',') : undefined,
      related: related.length > 0 ? related.join(',') : undefined,
    })
  );
}

type Options = {
  /** The url-encoded title value that you wish you use. */
  title?: string;
  /** The url-encoded description that you wish you use. */
  summary?: string;
  /** The url-encoded source of the content (e.g. your website or application name) */
  source?: string;
};

export function linkedinLink (url: string, { title, summary, source }: Options) {
  return (
    'https://linkedin.com/shareArticle' +
    objectToGetParams({ url, mini: 'true', title, summary, source })
  );
}

export function redditLink (url: string, { title }: { title?: string }) {
  return (
    'https://www.reddit.com/submit' +
    objectToGetParams({
      url,
      title,
    })
  );
}

export function telegramLink (url: string, { title }: { title?: string }) {
  return (
    'https://telegram.me/share/url' +
    objectToGetParams({
      url,
      text: title,
    })
  );
}
