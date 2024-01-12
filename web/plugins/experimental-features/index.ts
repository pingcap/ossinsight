import { LoadContext, Plugin } from '@docusaurus/types';

interface PluginOptions {
  defaultEnabled: string[];
}

export default function (
  context: LoadContext,
  options: PluginOptions,
): Plugin {
  return {
    name: 'experimental-features',
    contentLoaded ({ actions }) {
      actions.setGlobalData(options);
    },
  };
}
