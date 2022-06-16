/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const globalData = require('@generated/globalData');
const { logPageView } = require("@tidb-community/tracking-script");
const { getContentGroup } = require('./content-group');

const {trackingID} = globalData['docusaurus-plugin-google-gtag'].default;

const clientModule = {
  onRouteUpdate({location, previousLocation}) {
    if (previousLocation && location.pathname !== previousLocation.pathname) {
      // Normally, the document title is updated in the next tick due to how
      // `react-helmet-async` updates it. We want to send the current document's
      // title to gtag instead of the old one's, so we use `setTimeout` to defer
      // execution to the next tick.
      // See: https://github.com/facebook/docusaurus/issues/7420
      setTimeout(() => {
        const contentGroup = getContentGroup(location)
        // Set content group if exists
        if (contentGroup) {
          window.gtag('set', 'content_group', contentGroup)
        }

        // Always refer to the variable on window in case it gets overridden
        // elsewhere.
        window.gtag('config', trackingID, {
          page_path: location.pathname,
          page_title: document.title,
        });
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname,
        });
        logPageView();
      });
    }
  },
};

module.exports = clientModule;
