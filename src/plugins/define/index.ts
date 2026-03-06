import { DefinePlugin } from 'webpack';

module.exports = function (_: unknown, options: Record<string, any>) {
  return {
    name: 'plugin-define',
    configureWebpack () {
      return {
        plugins: [new DefinePlugin(options)],
      };
    },
  };
};
