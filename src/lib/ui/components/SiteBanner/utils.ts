import { Fragment, ReactElement } from 'react';
import rehypeReact from 'rehype-react';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { Plugin, unified } from 'unified';

export function renderMarkdown (value: string): ReactElement {
  const result = processor.processSync({ value });
  return result.result as ReactElement;
}

const validate: Plugin<[], import('mdast').Root, import('mdast').Root> = function () {
  return (node: any) => {
    if (node.children.length !== 1 || node.children[0].type !== 'paragraph') {
      throw new Error('Banner markdown support only one toplevel paragraph block');
    }
    return node;
  };
};

const jsxRuntime = require('react/jsx-runtime') as {
  jsx: (...args: any[]) => any
  jsxs: (...args: any[]) => any
  Fragment: any
};

const processor = unified()
  .use(remarkParse)
  .use(validate)
  .use(remarkRehype)
  .use(rehypeReact as any, {
    Fragment: jsxRuntime.Fragment ?? Fragment,
    jsx: jsxRuntime.jsx,
    jsxs: jsxRuntime.jsxs,
  })
  .freeze();
