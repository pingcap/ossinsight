import { Params, QuerySchema } from "../../params.schema";
import { SchemaObject } from "openapi3-ts/dist/mjs/model/OpenApi";
import { OpenApiBuilder } from "openapi3-ts";
import path from "path";
import fs from "fs";

const COMMON_PARAMS = path.resolve(__dirname, '../../param-descriptions.json');
const defaultParams: Record<string, string> = JSON.parse(fs.readFileSync(COMMON_PARAMS, { encoding: 'utf-8' }));

const ENUMS_PRESETS = path.resolve(__dirname, '../../params-preset.json');
const enumsPreset: Record<string, string[]> = JSON.parse(fs.readFileSync(ENUMS_PRESETS, { encoding: 'utf-8' }));

function buildEnum(enums: string | string[] | undefined): string[] | undefined {
  return typeof enums === 'string' ? enumsPreset[enums] : enums;
}

function buildSingleParam(params: Params): SchemaObject {
  return {
    enum: buildEnum(params.enums),
    pattern: params.pattern,
    type: /^\d+$/.test(params.replaces) ? 'number' : 'string',
    nullable: params.default !== undefined,
    example: params.name === 'repoId' ? '41986369' : undefined,
  };
}

function buildParam(params: Params): SchemaObject {
  let result: SchemaObject;
  switch (params.type) {
    case 'array':
      result = {
        type: 'array',
        nullable: params.default !== undefined,
        items: buildSingleParam(params),
      };
      break;
    default:
      result = buildSingleParam(params);
      break;
  }
  result.description = params.description;
  result.default = params.default;
  return result;
}

function buildSourceUrl(path: string) {
  return `https://github.com/pingcap/ossinsight/tree/main/api/queries/${path}`;
}

function a(url: string) {
  return `<a href="${url}" target="_blank">${url}</a>`;
}

function buildDescription(query: QuerySchema): string {
  let res = query.description ?? "No description.";
  res += '<hr/>';

  if (query.cacheHours) {
    if (query.cacheHours === -1) {
      res += `<b>Cache hours:</b> Never expire<br/>`;
    } else {
      res += `<b>Cache hours:</b> ${query.cacheHours}<br/>`;
    }
  }

  if (typeof query.refreshCron === 'string') {
    res += `<b>Refresh Cron:</b> ${query.refreshCron}<br/>`;
  }

  if (typeof query.refreshHours === 'number') {
    res += `<b>Refresh Hours:</b> ${query.refreshHours}<br/>`;
  }

  if (typeof query.onlyFromCache === 'boolean') {
    res += `<b>Only From Cache:</b> ${query.onlyFromCache}<br/>`;
  }

  return res;
}

export function buildQuery(path: string, builder: OpenApiBuilder, params: QuerySchema) {
  builder.addPath(`/q/${path}`, {
    description: params.name ?? path,
    get: {
      description: buildDescription(params),
      tags: ['Query'],
      externalDocs: {
        description: "Source code on GitHub",
        url: buildSourceUrl(path),
      },
      parameters: params.params.map(param => ({
        name: param.name,
        description: param.description || defaultParams[param.name] || 'No description',
        in: 'query',
        required: param.default !== undefined,
        schema: buildParam(param),
        // https://swagger.io/docs/specification/serialization/
        style: 'form',
        explode: true,
      })),
      responses: {
        200: {
          description: `See ${a(buildSourceUrl(path + '/template.sql'))} for more details`,
          content: {
            'application/json': {
              schema: {
                allOf: [
                  {
                    "$ref": "#/components/schemas/QueryResultMeta",
                  },
                  {
                    properties: {
                      "data": {
                        type: "array",
                        nullable: false,
                        items: params.resultSchema as any,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
  });
}