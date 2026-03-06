import {getSuccessResponse, proxyGet} from "../../../../utils/endpoint";

import {FastifyPluginAsync} from "fastify";

const schema = {
  operationId: 'list-trending-repos',
  summary: 'List trending repos',
  method: 'GET',
  description: `Trending repos is an open source alternative to GitHub trends, which showcases recently popular open source projects in the GitHub community.

> **Note**
>
> Please URI encode the requested parameters, e.g. \`C++\` needs to be encoded as \`C%2B%2B\`.
 
☁️ Daily run on [TiDB Cloud](https://tidbcloud.com/?utm_source=ossinsight&utm_medium=ossinsight_api), analyze upon dataset that has over 6 billion GitHub events.`,
  tags: ['Trends'],
  querystring: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        description: 'Specify the period of time to calculate trending repos.',
        enum: ['past_24_hours', 'past_week', 'past_month', 'past_3_months'],
        default: 'past_24_hours',
      },
      language: {
        type: 'string',
        description: 'Specify using which programming language to filter trending repos. If not specified, all languages will be included.',
        enum: [
          "All", "JavaScript", "Java", "Python", "PHP", "C++", "C#", "TypeScript", "Shell", "C", "Ruby", "Rust", "Go",
          "Kotlin", "HCL", "PowerShell", "CMake", "Groovy", "PLpgSQL", "TSQL", "Dart", "Swift", "HTML", "CSS", "Elixir",
          "Haskell", "Solidity", "Assembly", "R", "Scala", "Julia", "Lua", "Clojure", "Erlang", "Common Lisp",
          "Emacs Lisp", "OCaml", "MATLAB", "Objective-C", "Perl", "Fortran"
        ],
        default: 'All',
      }
    }
  },
  response: {
    200: getSuccessResponse(
    [
      {
        col: "repo_id",
        data_type: "INT",
        nullable: true
      },
      {
        col: "repo_name",
        data_type: "VARCHAR",
        nullable: true
      },
      {
        col: "primary_language",
        data_type: "VARCHAR",
        nullable: true
      },
      {
        col: "description",
        data_type: "VARCHAR",
        nullable: true
      },
      {
        col: "stars",
        data_type: "INT",
        nullable: true
      },
      {
        col: "forks",
        data_type: "INT",
        nullable: true
      },
      {
        col: "pull_requests",
        data_type: "INT",
        nullable: true
      },
      {
        col: "pushes",
        data_type: "INT",
        nullable: true
      },
      {
        col: "total_score",
        data_type: "DOUBLE",
        nullable: true
      },
      {
        col: "contributor_logins",
        data_type: "VARCHAR",
        nullable: true
      },
      {
        col: "collection_names",
        data_type: "VARCHAR",
        nullable: true
      }
    ],
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          repo_id: {
            type: 'string',
            description: 'ID of the repo',
          },
          repo_name: {
            type: 'string',
            description: 'Name of the repo',
          },
          primary_language: {
            type: 'string',
            description: 'Primary programing language used by the repo',
          },
          description: {
            type: 'string',
            description: 'Description of the repo',
          },
          stars: {
            type: 'string',
            description: 'Number of stars in the period',
          },
          forks: {
            type: 'string',
            description: 'Number of forks in the period',
          },
          pull_requests: {
            type: 'string',
            description: 'Number of pull requests in the period',
          },
          pushes: {
            type: 'string',
            description: 'Number of pushes in the period',
          },
          total_score: {
            type: 'string',
            description: 'Total score of the repo',
          },
          contributor_logins: {
            type: 'string',
            description: 'Comma separated list of active contributor logins',
          },
          collection_names: {
            type: 'string',
            description: 'Comma separated list of collection names',
          }
        }
      },
      example: [
        {
          "collection_names": "CICD",
          "contributor_logins": "cplee,nektos-ci,usagirei,ae-ou,MrNossiom",
          "description": "Run your GitHub Actions locally 🚀",
          "forks": "5",
          "primary_language": "Go",
          "pull_requests": "6",
          "pushes": "17",
          "repo_id": "163883279",
          "repo_name": "nektos/act",
          "stars": "395",
          "total_score": "1565.7526"
        },
        {
          "collection_names": "ChatGPT Alternatives",
          "contributor_logins": "antonkesy,ruanslv,starplatinum3,AlexandroLuis,realhaik",
          "description": "Inference code for LLaMA models",
          "forks": "48",
          "primary_language": "Python",
          "pull_requests": "41",
          "pushes": "7",
          "repo_id": "601538369",
          "repo_name": "facebookresearch/llama",
          "stars": "209",
          "total_score": "1079.0274"
        },
        {
          "collection_names": "Stable Diffusion Ecosystem",
          "contributor_logins": "atiorh,SaladDays831,ZachNagengast,TimYao18,vzsg",
          "description": "Stable Diffusion with Core ML on Apple Silicon",
          "forks": "5",
          "primary_language": "Python",
          "pull_requests": "7",
          "pushes": "5",
          "repo_id": "566576114",
          "repo_name": "apple/ml-stable-diffusion",
          "stars": "99",
          "total_score": "575.2498"
        },
        {
          "collection_names": "Stable Diffusion Ecosystem",
          "contributor_logins": "danonymous856,EvilPhi666,FurkanGozukara,Prathyusha-98,ca-kishida",
          "description": "High-Resolution Image Synthesis with Latent Diffusion Models",
          "forks": "6",
          "primary_language": "Python",
          "pull_requests": "2",
          "pushes": "",
          "repo_id": "569927055",
          "repo_name": "Stability-AI/stablediffusion",
          "stars": "75",
          "total_score": "483.0236"
        }
      ]
    }, {
      row_count: 4
    })
  }
};

const queryHandler: FastifyPluginAsync = async (app, opts): Promise<void> => {
  proxyGet(app, opts, schema);
}

export default queryHandler;
