const webpack = require('webpack')

module.exports = function (context, options) {
  return {
    name: 'define',
    configureWebpack () {
      return {
        plugins: [new webpack.DefinePlugin(options)]
      }
    }
  }
}