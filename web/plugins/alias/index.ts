import { Plugin } from '@docusaurus/types';
import type { ResolveOptions } from 'webpack';

type AliasPluginOptions = ResolveOptions['alias'];

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
