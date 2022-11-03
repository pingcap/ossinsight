import { Plugin } from '@docusaurus/types';

type AliasPluginOptions = import('webpack').Configuration['resolve']['alias'];

export default function AliasPlugin (_, options: AliasPluginOptions): Plugin {
  return {
    name: 'plugin-alias',
    configureWebpack () {
      return {
        resolve: {
          alias: options,
        },
      };
    },
  };
}
