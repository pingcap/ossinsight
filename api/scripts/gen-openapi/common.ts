import { OpenApiBuilder } from "openapi3-ts";

export function buildCommon(builder: OpenApiBuilder) {
  builder.addSchema("QueryResultMeta", {
    type: "object",
    description: "Common query result meta info",
    properties: {
      expiresAt: {
        type: "string",
        nullable: false,
        description: "Timestamp when query cache will be expired",
        format: "date-time",
      },
      finishedAt: {
        type: "string",
        nullable: false,
        description: "Timestamp when was query finished.",
        format: "date-time",
      },
      requestedAt: {
        type: "string",
        nullable: false,
        description: "Timestamp when was query requested.",
        format: "date-time",
      },
      spent: {
        type: "number",
        nullable: false,
        description: "Time query spent in seconds.",
      },
      sql: {
        type: "string",
        nullable: false,
        description: "The real SQL executed by this query.",
      },
      fields: {
        type: "array",
        nullable: false,
        description: "SQL result columns.",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              nullable: false,
            },
            columnType: {
              type: "number",
              nullable: false,
            },
          },
        },
      },
    },
  });
}