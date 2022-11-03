/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ClientModule } from '@docusaurus/types';
import { getContentGroup } from './content-group';

declare global {
  interface Window {
    gtag: (
      command: string,
      fields: string,
      params: any,
    ) => void;
  }
}

const clientModule: ClientModule = {
  onRouteDidUpdate ({ location, previousLocation }) {
    if (
      (previousLocation != null) &&
      (location.pathname !== previousLocation.pathname ||
        location.search !== previousLocation.search ||
        location.hash !== previousLocation.hash)
    ) {
      // Normally, the document title is updated in the next tick due to how
      // `react-helmet-async` updates it. We want to send the current document's
      // title to gtag instead of the old one's, so we use `setTimeout` to defer
      // execution to the next tick.
      // See: https://github.com/facebook/docusaurus/issues/7420
      setTimeout(() => {
        // Always refer to the variable on window in case it gets overridden
        // elsewhere.
        const contentGroup = getContentGroup(location);
        // Set content group if exists
        if (contentGroup != null) {
          window.gtag('set', 'content_group', contentGroup);
        }
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname + location.search + location.hash,
        });
      });
    }
  },
};

export default clientModule;
