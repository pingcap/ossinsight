// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"about.md": () => import("../content/docs/about.md?collection=docs"), "faq.md": () => import("../content/docs/faq.md?collection=docs"), }),
};
export default browserCollections;