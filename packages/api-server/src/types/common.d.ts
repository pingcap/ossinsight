import { FastifyPluginAsync, RawServerDefault } from "fastify";

import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

export type FastifyRouteAsync = FastifyPluginAsync<Record<never, never>, RawServerDefault, JsonSchemaToTsProvider>;