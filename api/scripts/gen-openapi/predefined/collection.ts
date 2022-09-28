import { OpenApiBuilder } from "openapi3-ts";

export function addCollectionApi(builder: OpenApiBuilder) {
  builder.addTag({
    name: 'Collection',
    description: 'Collection related API',
  });
  builder.addPath('/collections', {
    get: {
      summary: 'Get collections list',
      tags: ['Collection'],
      responses: {
        default: {
          description: '',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  {
                    $ref: '#/components/schemas/QueryResultMeta',
                  },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'number',
                              description: 'Collection ID',
                              nullable: false,
                            },
                            name: {
                              type: 'string',
                              description: 'Collection Name',
                              nullable: false,
                            },
                            public: {
                              type: 'number',
                              description: 'Is public collection',
                              enum: [0, 1],
                              nullable: false,
                            },
                          },
                          nullable: false,
                        },
                        nullable: false,
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
  builder.addPath('/collections/:id', {
    get: {
      summary: 'Get collection info',
      tags: ['Collection'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'Collection ID',
        },
      ],
      responses: {
        default: {
          description: '',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  {
                    $ref: '#/components/schemas/QueryResultMeta',
                  },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'number',
                              description: 'Internal Record ID',
                              nullable: false,
                            },
                            collection_id: {
                              type: 'number',
                              description: 'Collection ID',
                              nullable: false,
                            },
                            repo_id: {
                              type: 'number',
                              description: 'Repo ID',
                              nullable: false,
                            },
                            repo_name: {
                              type: 'string',
                              description: 'Repo Name',
                              nullable: false,
                            },
                          },
                          nullable: false,
                        },
                        nullable: false,
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