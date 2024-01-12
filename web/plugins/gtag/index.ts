import createPlugin, { PluginOptions } from '@docusaurus/plugin-google-gtag';
import { LoadContext, Plugin } from '@docusaurus/types';

export default function (
  context: LoadContext,
  options: PluginOptions,
): Plugin {
  const plugin = createPlugin(context, options);
  const isProd = process.env.NODE_ENV === 'production' && process.env.OSSINSIGHT_PREVIEW !== 'true';

  return {
    ...plugin,
    getClientModules () {
      return isProd ? ['./gtag'] : ['./gtag.dev'];
    },
    injectHtmlTags (args) {
      if (!isProd) {
        return {
          headTags: [
            {
              tagName: 'script',
              innerHTML: `
              function gtag(){console.debug('[gtag:debug]', ...arguments);}
              gtag('js', new Date());
              gtag('config', '{TRACKING_ID}', '{ ...args }');`,
            },
          ],
        };
      }
      return plugin.injectHtmlTags?.(args) ?? {};
    },
  };
}
