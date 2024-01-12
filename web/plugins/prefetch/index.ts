import { Plugin } from '@docusaurus/types';
import * as fs from 'fs/promises';

type PrefetchLinkContent = {
  type: 'prefetch-link';
  links: string[];
};

type GlobalPresetContent = {
  type: 'global-preset';
  resources: Record<string, string>;
};

type PrefetchContent = PrefetchLinkContent | GlobalPresetContent;

function isGlobalPreset (content: PrefetchContent): content is GlobalPresetContent {
  return content.type === 'global-preset';
}

function isPrefetchLink (content: PrefetchContent): content is PrefetchLinkContent {
  return content.type === 'prefetch-link';
}

export default function PrefetchPlugin (_, options: Record<string, string>): Plugin<PrefetchContent[]> {
  return {
    name: 'plugin-prefetch',
    async loadContent () {
      const content: PrefetchContent[] = [];
      const links: string[] = [];
      const resources = {};
      for (const [key, value] of Object.entries(options)) {
        if (key === 'id') continue;
        if (value === 'prefetch') {
          links.push(key);
        } else {
          try {
            const data = await fs.readFile(value, { encoding: 'utf-8' });
            resources[key] = JSON.parse(data);
          } catch (e) {
          }
        }
      }
      content.push({
        type: 'global-preset',
        resources,
      });
      content.push({
        type: 'prefetch-link',
        links,
      });
      return content;
    },
    injectHtmlTags ({ content }) {
      const API_BASE = (process.env.APP_API_BASE ?? '') || 'https://api.ossinsight.io';

      return {
        headTags: content
          .filter(isPrefetchLink)
          .flatMap(({ links }) => links)
          .map(link => ({
            tagName: 'link',
            type: 'application/json',
            attributes: {
              rel: 'preload',
              href: API_BASE + link,
              as: 'fetch',
              crossorigin: 'anonymous',
            },
          })),
      };
    },
    async contentLoaded ({ actions, content }) {
      const { setGlobalData } = actions;
      content
        .filter(isGlobalPreset)
        .map(({ resources }) => resources)
        .forEach(setGlobalData);
    },
  };
};
