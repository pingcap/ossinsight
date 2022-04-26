const DynamicRoutePlugin = function (context, options) {
  return {
    name: 'plugin-dynamic-routes',

    async contentLoaded({ content, actions }) {
      const { routes } = options
      const { addRoute } = actions

      routes.map(route => addRoute(route))
    }
  }
}

module.exports = DynamicRoutePlugin
