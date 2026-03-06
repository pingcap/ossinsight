import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('markdown', markdown);

export type HighlightRequest = {
  id: string
  code: string
  languageSubset: string[]
}

export type HighlightResponse = {
  id: string
  error: unknown
} | {
  id: string
  result: string
}

addEventListener('message', (ev: MessageEvent<HighlightRequest>) => {
  const { id, code, languageSubset } = ev.data;
  try {
    const result = hljs.highlightAuto(code, languageSubset);
    postMessage({
      id,
      result: result.value.replace(/class="hljs-tag">/g, 'class="hljs-doctag">'),
    } satisfies HighlightResponse);
  } catch (error) {
    postMessage({
      id,
      error: String((error as any)?.message ?? error),
    } satisfies HighlightResponse);
  }
});
