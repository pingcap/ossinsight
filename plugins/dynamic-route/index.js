const DynamicRoutePlugin = function (context, options) {
  return {
    name: 'plugin-dynamic-routes',

    async contentLoaded({ content, actions }) {
      const { routes } = options
      const { addRoute } = actions

      await Promise.all(routes.map(async routeOption => {
        let {params, ...route} = routeOption

        if (params) {
          if (typeof params === 'function') {
            params = await params()
          }
          params.forEach(param => {
            let { path, ...rest } = route
            Object.entries(param).forEach(([k, v]) => {
              path = path.replace(':' + k, String(v))
            })
            addRoute({ path, ...rest })
          })
        }
        addRoute(route)
      }))
    }
  }
}

module.exports = DynamicRoutePlugin
