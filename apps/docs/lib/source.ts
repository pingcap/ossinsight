import { createFromSource } from 'fumadocs-core/search/server';
import { loader } from 'fumadocs-core/source';
import type { Root } from 'fumadocs-core/page-tree';
import { docs } from '@/.source/server';
import { buildApiFolderTree } from '@/lib/api-navigation';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export const pageTree: Root = {
  ...source.pageTree,
  children: [
    ...source.pageTree.children,
    buildApiFolderTree(),
  ],
};

export const search = createFromSource(source);
