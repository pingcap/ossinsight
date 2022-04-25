import {Queries} from './queries';
import {RemoteData} from './hook';
import * as React from 'react';
import {MutableRefObject, useCallback, useContext, useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import {EChartsContext, EChartsContextProps} from '../ECharts';
import AspectRatio from 'react-aspect-ratio';
import Image from '../Image';
import Stack from '@mui/material/Stack';
import {FacebookIcon, LinkedinIcon, RedditIcon, TelegramIcon, TwitterIcon} from 'react-share';
import CommonChartContext, {CommonChartShareInfo} from '../CommonChart/context';
import Card from '@mui/material/Card';
import axios from 'axios';
import ShareButtons from '../ShareButtons';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import {LoadingButton} from '@mui/lab';
import EChartsReact from 'echarts-for-react';

export interface DebugInfoModelInfoProps {
  query: keyof Queries,
  data: RemoteData<any, any> | RemoteData<any, any>[],
  open: boolean,
  onClose: () => any
}

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
      el = el.previousElementSibling as HTMLElement
    }
  }
  return undefined
}

function getFirstParagraph(heading: HTMLHeadingElement): HTMLParagraphElement | undefined {
  let el = heading.nextElementSibling
  while (el) {
    if (/^P$/.test(el.tagName)) {
      return el as HTMLParagraphElement
    }
    el = el.nextElementSibling
  }
  return undefined
}

function getMetadata (canvas: HTMLCanvasElement | undefined): {hash?: string, title?: string, description?: string} {
  if (typeof window === 'undefined') {
    return {};
  }
  if (canvas) {
    const heading = getNearestTitle(canvas)
    if (heading) {
      const paragraph = getFirstParagraph(heading)
      return {
        hash: heading.id,
        title: heading.textContent.trim(),
        description: paragraph?.textContent.trim(),
      }
    }
  }
  return {}
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
  const url = window.location.href.replaceAll(window.location.origin, '');
  if (hash) {
    return `${url.split('#')[0]}#${hash}`;
  } else {
    return url.split('#')[0];
  }
}

function useShare(shareInfo: CommonChartShareInfo | undefined, echartsRef: MutableRefObject<EChartsReact> | undefined) {
  const canvas = echartsRef?.current?.ele?.getElementsByTagName('canvas')?.[0];

  const metaData = getMetadata(canvas)

  const title = shareInfo?.title ?? metaData.title ?? getTitle();
  const description = shareInfo?.description ?? metaData.description ?? getDescription();
  const keyword = shareInfo?.keywords ?? getKeyword();
  const hash = shareInfo?.hash ?? metaData.hash;
  const message = shareInfo?.message;

  const [sharing, setSharing] = useState(false);
  const [shareId, setShareId] = useState<string>();

  const share = useCallback(async () => {
    try {
      if (!canvas || shareId) {
        return;
      }
      setSharing(true);
      const {data: {shareId: serverShareId, signedUrl}} = await axios.post('https://api.ossinsight.io/share', {
        title,
        description,
        keyword,
        path: buildUrl(hash),
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
  }, [title, description, keyword, shareId, canvas]);

  return {share, shareId, sharing, title, hash, description, message, keyword};
}

export const DebugInfoModel = ({query, data, open, onClose}: DebugInfoModelInfoProps) => {
  const {echartsRef} = useContext(EChartsContext);
  const {shareInfo} = useContext(CommonChartContext);
  const [imgData, setImgData] = useState<string>();
  const {share, sharing, shareId, title, description, message, keyword} = useShare(shareInfo, echartsRef);

  useEffect(() => {
    if (!data) {
      onClose();
    }
  }, [data]);

  useEffect(() => {
    if (open) {
      const canvas = echartsRef?.current?.ele?.getElementsByTagName('canvas')?.[0];
      if (canvas) {
        setImgData(canvas.toDataURL('image/jpeg'));
      }
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth={true}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle>
          [WIP] Share chart
        </DialogTitle>
        <Box sx={{margin: 'auto', maxWidth: '504px', px: 2, width: '100%'}}>
          <TwitterCard title={title} description={description} imgData={imgData} />
          <Box sx={{my: 2}}>
            {shareId
              ? (
                <>
                  <ShareButtons shareUrl={`https://api.ossinsight.io/share/${shareId}`} title={message || title}
                                hashtags={keyword} />
                  <br />
                  <Input value={`https://api.ossinsight.io/share/${shareId}`} disabled size="small" />
                </>
              ) : (
                <LoadingButton loading={sharing} loadingIndicator="wait..." variant="contained" onClick={share}
                               size="small">
                  Share
                </LoadingButton>
              )}
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

const TwitterCard = ({title, description, imgData}: { title: string, description: string, imgData: string }) => {
  return (
    <Card sx={{
      borderRadius: 2,
      border: '1px solid rgb(56, 68, 77)',
      overflow: 'hidden',
      background: 'rgb(21, 32, 43)',
      width: '100%',
    }} elevation={0}>
      <Box sx={{borderBottom: '1px solid rgb(56, 68, 77)'}}>
        <AspectRatio ratio={436 / 219}>
          <Image src={imgData} style={{backgroundPosition: 'top left'}} />
        </AspectRatio>
      </Box>
      <Box sx={{p: 1.5, lineHeight: 1, fontSize: '15px'}}>
        <Box sx={{color: 'rgb(139, 152, 165)'}}>
          ossinsight.io
        </Box>
        <Box sx={{color: 'rgb(247, 249, 249)', mt: '2px', fontWeight: 400}}>
          {title}
        </Box>
        <Box sx={{color: 'rgb(139, 152, 165)', mt: '2px', fontWeight: 400}}>
          {description}
        </Box>
      </Box>
    </Card>
  );
};
