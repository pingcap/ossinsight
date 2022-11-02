type GetContentGroupOptions = {
  pathname: string;
  search: string;
};

export function getContentGroup ({ pathname, search }: GetContentGroupOptions): string | undefined {
  // collections
  if (pathname.includes('/collections/')) {
    if (pathname.includes('/trends')) {
      return 'collections trends';
    } else {
      return 'collections monthly';
    }
  } else if (pathname.includes('/analyze/')) {
    if (/\/analyze\/[^/]+\/[^/]+/.test(pathname)) {
      if (search.includes('vs=')) {
        return 'compare';
      } else {
        return 'analyze';
      }
    } else if (/\/analyze\/[^/]+/.test(pathname)) {
      return 'analyze-user';
    }
  } else if (pathname.includes('/blog/')) {
    return 'blog';
  } else if (pathname.includes('/workshop/')) {
    return 'workshop';
  } else {
    return undefined;
  }
}
