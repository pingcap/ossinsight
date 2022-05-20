import type { ClientModule } from "@docusaurus/types";
import { logPageView } from "@tidb-community/tracking-script";

// https://docusaurus.io/docs/advanced/client#client-module-lifecycles
const module: ClientModule = {
  // Note that this method would be excuted if pathname/hash/search changed.
  onRouteDidUpdate({ location, previousLocation }) {
    if (process.env.NODE_ENV === "production") {
      if (location.pathname !== previousLocation?.pathname) {
        // Add community analytics scripts after route changed.
        // logPageView();
        // ! TOREMOVE:
        // ! https://github.com/facebook/docusaurus/issues/7420
        // ! It always get the previous document title, so we wrap it into setTimeout.
        setTimeout(() => {
          logPageView();
        });
      }
    }
  },
};

export default module;
