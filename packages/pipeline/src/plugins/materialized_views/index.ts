import fp from "fastify-plugin";
import * as fs from "fs";
import path from "path";

export const MATERIALIZED_VIEWS_DDL_FILE = 'ddl.sql';

export interface MaterializedView {
  name: string;
  ddl: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    materializedViews: Record<string, MaterializedView>;
  }
}

export default fp(async (app) => {
  const dir = path.join(app.config.CONFIGS_PATH, 'materialized_views');
  const names = fs.readdirSync(dir);
  const materializedViews: Record<string, MaterializedView> = {};

  // Load all materialized views.
  names
    .filter(name => fs.statSync(path.join(dir, name)).isDirectory())
    .filter(name => fs.existsSync(path.join(dir, name, MATERIALIZED_VIEWS_DDL_FILE)))
    .forEach(name => {
      const ddl = fs.readFileSync(path.join(dir, name, MATERIALIZED_VIEWS_DDL_FILE), 'utf-8');
      materializedViews[name] = {
        name,
        ddl,
      }
    });

  app.decorate('materializedViews', materializedViews);
}, {
  name: '@ossinsight/materializedViews'
});
