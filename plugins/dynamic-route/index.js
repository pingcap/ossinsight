const DynamicRoutePlugin = function (context, options) {
  return {
    name: 'plugin-dynamic-routes',

    async contentLoaded({ content, actions }) {
      const { routes } = options
      const { addRoute } = actions

      routes.forEach(routeOption => {
        const {params, ...route} = routeOption

        if (params) {
          params.forEach(param => {
            let { path, ...rest } = route
            Object.entries(param).forEach(([k, v]) => {
              path = path.replace(':' + k, String(v))
            })
            addRoute({ path, ...rest })
          })
        }
        addRoute(route)
      })
    }
  }
}

module.exports = DynamicRoutePlugin
