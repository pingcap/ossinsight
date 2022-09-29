import path from 'path';
import fs from 'fs';
import { QuerySchema } from "../../params.schema";
import { OpenApiBuilder } from 'openapi3-ts';
import { buildQuery } from "./utils";
import { buildCommon } from "./common";
import { loadQueries } from "../../app/core/QueryFactory";

const QUERIES_DIR = path.resolve(__dirname, '../../queries');
const OUTPUT_DIR = path.resolve(__dirname, '../../static');
const OUTPUT = path.resolve(OUTPUT_DIR, 'openapi.yaml');

const builder = new OpenApiBuilder();

builder.addServer({
  url: 'https://api.ossinsight.io/',
});
builder.addInfo({
  title: 'OSSInsight API Spec',
  description: 'This document describes major public API provided by ossinsight.io',
  contact: {
    name: 'OSSInsight',
    email: 'ossinsight@pingcap.com',
  },
  version: '1.0.0',
});
builder.addTag({
  name: 'Query',
});
builder.addExternalDocs({
  description: 'GitHub',
  url: 'https://github.com/pingcap/ossinsight',
});

loadQueries()
  .then(queries => {
    Object.entries(queries).forEach(([query, params]) => {
      if (params.public) {
        console.log('✅', query);
        buildQuery(query, builder, params);
      } else {
        console.log('❌', query);
      }
    })

    buildCommon(builder);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT, builder.getSpecAsYaml(), { encoding: 'utf-8' });
  })
