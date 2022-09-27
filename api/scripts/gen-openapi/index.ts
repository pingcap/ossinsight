import path from 'path';
import fs from 'fs';
import { QuerySchema } from "../../params.schema";
import { OpenApiBuilder } from 'openapi3-ts';
import { buildQuery } from "./utils";
import { buildCommon } from "./common";

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
  url: 'https://github.com/pingcap/ossinsight'
})

for (const dir of fs.readdirSync(QUERIES_DIR, { withFileTypes: true })) {
  if (!dir.isDirectory()) {
    continue;
  }
  const QUERY_DIR = path.join(QUERIES_DIR, dir.name);
  const PARAM_FILE = path.join(QUERY_DIR, 'params.json');

  const params: QuerySchema = JSON.parse(fs.readFileSync(PARAM_FILE, { encoding: 'utf-8' }));

  if (params.public) {
    console.log('✅', dir.name);
    buildQuery(dir.name.replace(/\//g, ''), builder, params);
  } else {
    console.log('❌', dir.name)
  }
}

buildCommon(builder);
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, builder.getSpecAsYaml(), { encoding: 'utf-8' });
