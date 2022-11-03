import { Plugin } from '@docusaurus/types';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default function (): Plugin {
  return {
    name: 'analyze-plugin',
    configureWebpack (config, isServer) {
      if (process.env.NODE_ENV !== 'development') {
        return {};
      }
      return {
        plugins: [new BundleAnalyzerPlugin({
          reportFilename: `report.${isServer ? 'server' : 'client'}.html`,
        })],
      };
    },
  };
}
