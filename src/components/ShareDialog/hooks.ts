import {CommonChartShareInfo} from '../CommonChart/context';
import {MutableRefObject, useCallback, useState} from 'react';
import EChartsReact from 'echarts-for-react';
import axios from 'axios';

function getNearestTitle(canvas: HTMLElement): HTMLHeadingElement | undefined {
  let el = canvas.parentElement;
  while (el) {
    if (el.dataset.commonChart) {
      break;
    }
    el = el.parentElement;
  }
  if (el) {
    el = el.previousElementSibling as HTMLElement;
    while (el) {
      if (/^H[1-6]$/.test(el.tagName)) {
        return el as HTMLHeadingElement;
      }
      el = el.previousElementSibling as HTMLElement;
    }
  }
  return undefined;
}

function getFirstParagraph(heading: HTMLHeadingElement): HTMLParagraphElement | undefined {
  let el = heading.nextElementSibling;
  while (el) {
    if (/^P$/.test(el.tagName)) {
      return el as HTMLParagraphElement;
    }
    el = el.nextElementSibling;
  }
  return undefined;
}

function getMetadata(canvas: HTMLCanvasElement | undefined): { hash?: string, title?: string, description?: string } {
  if (typeof window === 'undefined') {
    return {};
  }
  if (canvas) {
    const heading = getNearestTitle(canvas);
    if (heading) {
      const paragraph = getFirstParagraph(heading);
      return {
        hash: heading.id,
        title: heading.textContent.trim(),
        description: paragraph?.textContent.trim(),
      };
    }
  }
  return {};
}

function getTitle(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return document.head.getElementsByTagName('title').item(0)?.textContent.trim() ?? '';
}

function getDescription(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return (document.head.querySelector('meta[name=description]') as HTMLMetaElement)?.content.trim() ?? '';
}

function getKeyword(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return (document.head.querySelector('meta[name=keyword]') as HTMLMetaElement)?.content.split(',') ?? [];
}

function buildUrl(hash: string | undefined) {
  const pathname = window.location.pathname
  const query = window.location.search
  let url = pathname
  if (query) {
    url += query
  }
  if (hash) {
    url += '#' + hash
  }
  return url
}

export function useShare(shareInfo: CommonChartShareInfo | undefined, echartsRef: MutableRefObject<EChartsReact> | undefined) {
  const canvas = echartsRef?.current?.ele?.getElementsByTagName('canvas')?.[0];

  const metaData = getMetadata(canvas);

  const title = shareInfo?.title ?? metaData.title ?? getTitle();
  const description = shareInfo?.description ?? metaData.description ?? getDescription();
  const keyword = shareInfo?.keywords ?? getKeyword();
  const hash = shareInfo?.hash ?? metaData.hash;
  const message = shareInfo?.message;

  const [sharing, setSharing] = useState(false);
  const [shareId, setShareId] = useState<string>();

  const share = useCallback(async () => {
    try {
      if (!canvas || shareId || sharing) {
        return;
      }
      setSharing(true);

      const recaptchaToken = await new Promise((resolve) => {
        grecaptcha.ready(() => {
          grecaptcha.execute('6LcBQpkfAAAAAFmuSRkRlJxVtmqR34nNawFgKohC', {action: 'submit'})
            .then(token => {
              resolve(token);
            });
        });
      });

      const {data: {shareId: serverShareId, signedUrl}} = await axios.post('https://api.ossinsight.io/share', {
        title,
        description,
        keyword,
        path: buildUrl(hash),
      }, {
        headers: {
          'x-recaptcha-response': recaptchaToken as string,
        },
      });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('failed to get image'));
          }
        }, 'image/png');
      });
      await fetch(signedUrl, {method: 'PUT', body: blob, headers: {'content-type': 'image/png'}});
      setShareId(serverShareId);
    } finally {
      setSharing(false);
    }
  }, [title, description, keyword, shareId, canvas, sharing]);

  return {share, shareId, sharing, title, hash, description, message, keyword};
}