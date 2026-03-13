// @ts-nocheck
import * as __fd_glob_1 from "../content/docs/faq.md?collection=docs"
import * as __fd_glob_0 from "../content/docs/about.md?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"about.md": __fd_glob_0, "faq.md": __fd_glob_1, });