import { PluginContext } from '@docusaurus/plugin-client-redirects/lib/types';
import { Plugin, RouteConfig } from '@docusaurus/types';

type DynamicRoutePluginOptions = {
  routes: Array<RouteConfig & {
    params?: Array<Record<string, string>>;
  }>;
};

const DynamicRoutePlugin = function (context: PluginContext, options: DynamicRoutePluginOptions): Plugin {
  return {
    name: 'plugin-dynamic-routes',

    async contentLoaded ({ content, actions }) {
      const { routes } = options;
      const { addRoute } = actions;

      routes.forEach(routeOption => {
        const { params, ...route } = routeOption;

        if (params != null) {
          params.forEach(param => {
            let { path, ...rest } = route;
            Object.entries(param).forEach(([k, v]) => {
              path = (path).replace(':' + k, String(v));
            });
            addRoute({ path, ...rest });
          });
        }
        addRoute(route);
      });
    },
  };
};

module.exports = DynamicRoutePlugin;
