/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path')
const {Joi} = require('@docusaurus/utils-validation');

module.exports = function pluginGoogleGtag(
  context,
  options,
){
  const {anonymizeIP, trackingID} = options;
  const isProd = process.env.NODE_ENV === 'production';

  return {
    name: 'docusaurus-plugin-google-gtag',

    async contentLoaded({actions}) {
      actions.setGlobalData(options);
    },

    getClientModules() {
      return isProd ? [path.resolve(__dirname, 'gtag.js')] : [];
    },

    injectHtmlTags() {
      if (!isProd) {
        return {};
      }
      return {
        // Gtag includes GA by default, so we also preconnect to
        // google-analytics.
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.google-analytics.com',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.googletagmanager.com',
            },
          },
          // https://developers.google.com/analytics/devguides/collection/gtagjs/#install_the_global_site_tag
          {
            tagName: 'script',
            attributes: {
              async: true,
              src: `https://www.googletagmanager.com/gtag/js?id=${trackingID}`,
            },
          },
          {
            tagName: 'script',
            innerHTML: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${trackingID}', { ${
              anonymizeIP ? "'anonymize_ip': true" : ''
            } });`,
          },
        ],
      };
    },
  };
}

const pluginOptionsSchema = Joi.object({
  trackingID: Joi.string().required(),
  anonymizeIP: Joi.boolean().default(false),
});

module.exports.validateOptions = function validateOptions({
  validate,
  options,
}) {
  return validate(pluginOptionsSchema, options);
}

module.exports.validateThemeConfig = function validateThemeConfig({
  themeConfig,
}) {
  if ('gtag' in themeConfig) {
    throw new Error(
      'The "gtag" field in themeConfig should now be specified as option for plugin-google-gtag. More information at https://github.com/facebook/docusaurus/pull/5832.',
    );
  }
  return themeConfig;
}
