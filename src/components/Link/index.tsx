// This is the override version of docusaurus Link with refs.

import { useLinksCollector } from '@docusaurus/core/lib/client/LinksCollector';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import isInternalUrl from '@docusaurus/isInternalUrl';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { applyTrailingSlash } from '@docusaurus/utils-common';
import React, { ForwardedRef, forwardRef, MouseEventHandler, useEffect, useRef } from 'react';
import { Link as RRLink, NavLink } from 'react-router-dom';
// TODO all this wouldn't be necessary if we used ReactRouter basename feature
// We don't automatically add base urls to all links,
// only the "safe" ones, starting with / (like /docs/introduction)
// this is because useBaseUrl() actually transforms relative links
// like "introduction" to "/baseUrl/introduction" => bad behavior to fix
const shouldAddBaseUrlAutomatically = (to) => to.startsWith('/');

function Link({
  isNavLink,
  to,
  href,
  activeClassName,
  isActive,
  'data-noBrokenLinkCheck': noBrokenLinkCheck,
  autoAddBaseUrl = true,
  ...props
}, forwardedRef: ForwardedRef<HTMLAnchorElement>) {
  var _a;
  const { siteConfig: { trailingSlash, baseUrl } } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();
  const linksCollector = useLinksCollector();
  // IMPORTANT: using to or href should not change anything
  // For example, MDX links will ALWAYS give us the href props
  // Using one prop or the other should not be used to distinguish
  // internal links (/docs/myDoc) from external links (https://github.com)
  const targetLinkUnprefixed = to || href;

  function maybeAddBaseUrl(str) {
    return autoAddBaseUrl && shouldAddBaseUrlAutomatically(str)
      ? withBaseUrl(str)
      : str;
  }

  const isInternal = isInternalUrl(targetLinkUnprefixed);
  // pathname:// is a special "protocol" we use to tell Docusaurus link
  // that a link is not "internal" and that we shouldn't use history.push()
  // this is not ideal but a good enough escape hatch for now
  // see https://github.com/facebook/docusaurus/issues/3309
  // note: we want baseUrl to be appended (see issue for details)
  // TODO read routes and automatically detect internal/external links?
  const targetLinkWithoutPathnameProtocol = targetLinkUnprefixed === null || targetLinkUnprefixed === void 0 ? void 0 : targetLinkUnprefixed.replace('pathname://', '');
  // TODO we should use ReactRouter basename feature instead!
  // Automatically apply base url in links that start with /
  let targetLink = typeof targetLinkWithoutPathnameProtocol !== 'undefined'
    ? maybeAddBaseUrl(targetLinkWithoutPathnameProtocol)
    : undefined;
  if (targetLink && isInternal) {
    targetLink = applyTrailingSlash(targetLink, { trailingSlash, baseUrl });
  }
  const preloaded = useRef(false);
  const LinkComponent: any = (isNavLink ? NavLink : RRLink);
  const IOSupported = ExecutionEnvironment.canUseIntersectionObserver;
  const ioRef = useRef<IntersectionObserver>();
  const handleIntersection = (el, cb) => {
    ioRef.current = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (el === entry.target) {
          // If element is in viewport, stop listening/observing and run callback.
          // https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            ioRef.current.unobserve(el);
            ioRef.current.disconnect();
            cb();
          }
        }
      });
    });
    // Add element to the observer.
    ioRef.current.observe(el);
  };
  const handleRef = (ref) => {
    if (IOSupported && ref && isInternal) {
      // If IO supported and element reference found, setup Observer functionality.
      handleIntersection(ref, () => {
        if (targetLink != null) {
          (window as any).docusaurus.prefetch(targetLink);
        }
      });
    }
  };
  const onMouseEnter = () => {
    if (!preloaded.current && targetLink != null) {
      (window as any).docusaurus.preload(targetLink);
      preloaded.current = true;
    }
  };
  useEffect(() => {
    // If IO is not supported. We prefetch by default (only once).
    if (!IOSupported && isInternal) {
      if (targetLink != null) {
        (window as any).docusaurus.prefetch(targetLink);
      }
    }
    // When unmounting, stop intersection observer from watching.
    return () => {
      if (IOSupported && ioRef.current) {
        ioRef.current.disconnect();
      }
    };
  }, [ioRef, targetLink, IOSupported, isInternal]);
  const isAnchorLink = (_a = targetLink === null || targetLink === void 0 ? void 0 : targetLink.startsWith('#')) !== null && _a !== void 0 ? _a : false;
  const isRegularHtmlLink = !targetLink || !isInternal || isAnchorLink;
  if (targetLink && isInternal && !isAnchorLink && !noBrokenLinkCheck) {
    linksCollector.collectLink(targetLink);
  }

  return isRegularHtmlLink
    ? (
      <a
        ref={forwardedRef}
        href={targetLink}
        {...(targetLinkUnprefixed && !isInternal && { target: '_blank', rel: 'noopener' })}
        {...props}
      />
    ) : (
      <LinkComponent
        ref={forwardedRef}
        {...props}
        onMouseEnter={onMouseEnter}
        innerRef={handleRef}
        to={targetLink || ''}
        {...(isNavLink && { isActive, activeClassName })}
      />
    );
}

export default forwardRef(Link);
