import { Canvas, loadImage, Path2D, Image } from '@napi-rs/canvas';
import { getTheme } from '../../../utils/theme';
import { withTimeout } from '../../../utils/timeout';
import { BuiltinProps } from './commons';
import { formatNumber } from '@/lib/widgets-utils/utils';

export async function renderAvatarLabel(
  canvas: Canvas,
  props: BuiltinProps<'builtin:avatar-label'>
) {
  const {
    label = '',
    labelColor = '',
    box: { dpr, left, top, width },
    imgSrc,
    imgSize = 20,
    imgProps = {},
  } = props;

  const { Label, Avatar } = getTheme(props.colorScheme);

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = 'none';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'start';

  ctx.font = `normal ${12 * dpr}px`;
  ctx.fillStyle = labelColor || Label.color;
  const labelStr = typeof label === 'number' ? formatNumber(label) : label;
  label && ctx.fillText(labelStr, left + (imgSrc ? 30 * dpr : 0), top + 7 * dpr, width);

  try {
    let avatar: null | Image;
    if (imgSrc.startsWith('http')) {
      avatar = await getRemoteImg(imgSrc);
      let circlePath = new Path2D();
      circlePath.arc(
        left + (imgSize / 2) * dpr,
        top + (imgSize / 2 + 2) * dpr,
        (imgSize / 2) * dpr,
        0,
        2 * Math.PI
      );
      ctx.clip(circlePath);
      ctx.drawImage(avatar, left, top + 2 * dpr, imgSize * dpr, imgSize * dpr);
    } else if (imgSrc.startsWith('gh-')) {
      avatar = await getBuiltinImg(imgSrc as BuiltinGHImgType, imgProps);
      ctx.drawImage(avatar, left, top + 2 * dpr, imgSize * dpr, imgSize * dpr);
    } else if (imgSrc.startsWith('filled-circle')) {
      // draw filled circle
      ctx.fillStyle = imgProps?.style?.fill || Avatar.fallbackColor;
      ctx.beginPath();
      ctx.arc(
        left + (imgSize / 2) * dpr,
        top + (imgSize / 2 + 2) * dpr,
        (imgSize / 4) * dpr,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  } catch {
    ctx.fillStyle = Avatar.fallbackColor;
    ctx.lineWidth = dpr;
    ctx.beginPath();
    ctx.arc(
      left + (imgSize / 2) * dpr,
      top + (imgSize / 2 + 2) * dpr,
      (imgSize / 2) * dpr,
      0,
      2 * Math.PI
    );
    imgSrc && ctx.fill();
  } finally {
    ctx.restore();
  }
}

async function getRemoteImg(imgSrc: string) {
  const buffer = await withTimeout(async (signal) => {
    return await fetch(imgSrc, { cache: 'force-cache', signal }).then((res) => {
      if (res.ok) {
        return res.arrayBuffer();
      } else {
        throw new Error(`${res.status} ${res.statusText} ${imgSrc}`);
      }
    });
  }, 2000);
  const avatar = await loadImage(buffer, {
    alt: 'label',
    requestOptions: {
      timeout: 1000,
    },
  });
  return avatar;
}

enum BuiltinGHImgType {
  'gh-code-review' = 'gh-code-review',
  'gh-issue' = 'gh-issue',
  'gh-pr' = 'gh-pr',
  'gh-repo' = 'gh-repo',
  'gh-star' = 'gh-star',
}

async function getBuiltinImg(type: BuiltinGHImgType, imgProps?: any) {
  let imgSrc = '';
  if (type.startsWith('gh-')) {
    imgSrc = getGHImgStr(type);
  }
  const buffer = Buffer.from(imgSrc, 'utf-8');
  const avatar = await loadImage(buffer, {
    alt: '',
    requestOptions: {
      timeout: 1000,
    },
  });
  return avatar;
}

function getGHImgStr(type: BuiltinGHImgType) {
  switch (type) {
    case BuiltinGHImgType['gh-code-review']:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#488DF4" d="M10.3 6.74a.75.75 0 0 1-.04 1.06l-2.908 2.7 2.908 2.7a.75.75 0 1 1-1.02 1.1l-3.5-3.25a.75.75 0 0 1 0-1.1l3.5-3.25a.75.75 0 0 1 1.06.04Zm3.44 1.06a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.908-2.7-2.908-2.7Z"></path>
          <path fill="#488DF4" d="M1.5 4.25c0-.966.784-1.75 1.75-1.75h17.5c.966 0 1.75.784 1.75 1.75v12.5a1.75 1.75 0 0 1-1.75 1.75h-9.69l-3.573 3.573A1.458 1.458 0 0 1 5 21.043V18.5H3.25a1.75 1.75 0 0 1-1.75-1.75ZM3.25 4a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 .75.75v3.19l3.72-3.72a.749.749 0 0 1 .53-.22h10a.25.25 0 0 0 .25-.25V4.25a.25.25 0 0 0-.25-.25Z"></path></svg>`;
    case BuiltinGHImgType['gh-issue']:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#F3DD8F" d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1ZM2.5 12a9.5 9.5 0 0 0 9.5 9.5 9.5 9.5 0 0 0 9.5-9.5A9.5 9.5 0 0 0 12 2.5 9.5 9.5 0 0 0 2.5 12Zm9.5 2a2 2 0 1 1-.001-3.999A2 2 0 0 1 12 14Z"></path></svg>`;
    case BuiltinGHImgType['gh-pr']:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#CC4D4D" d="M16 19.25a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Zm-14.5 0a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Zm0-14.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0ZM4.75 3a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 3Zm0 14.5a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 17.5Zm14.5 0a1.75 1.75 0 1 0 .001 3.501 1.75 1.75 0 0 0-.001-3.501Z"></path>
          <path fill="#CC4D4D" d="M13.405 1.72a.75.75 0 0 1 0 1.06L12.185 4h4.065A3.75 3.75 0 0 1 20 7.75v8.75a.75.75 0 0 1-1.5 0V7.75a2.25 2.25 0 0 0-2.25-2.25h-4.064l1.22 1.22a.75.75 0 0 1-1.061 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0ZM4.75 7.25A.75.75 0 0 1 5.5 8v8A.75.75 0 0 1 4 16V8a.75.75 0 0 1 .75-.75Z"></path></svg>`;
    case BuiltinGHImgType['gh-repo']:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#6E5AEA" d="M3 2.75A2.75 2.75 0 0 1 5.75 0h14.5a.75.75 0 0 1 .75.75v20.5a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1 0-1.5h5.25v-4H6A1.5 1.5 0 0 0 4.5 18v.75c0 .716.43 1.334 1.05 1.605a.75.75 0 0 1-.6 1.374A3.251 3.251 0 0 1 3 18.75ZM19.5 1.5H5.75c-.69 0-1.25.56-1.25 1.25v12.651A2.989 2.989 0 0 1 6 15h13.5Z"></path>
          <path fill="#6E5AEA" d="M7 18.25a.25.25 0 0 1 .25-.25h5a.25.25 0 0 1 .25.25v5.01a.25.25 0 0 1-.397.201l-2.206-1.604a.25.25 0 0 0-.294 0L7.397 23.46a.25.25 0 0 1-.397-.2v-5.01Z"></path></svg>`;
    case BuiltinGHImgType['gh-star']:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#FF8F50" d="M12 .25a.75.75 0 0 1 .673.418l3.058 6.197 6.839.994a.75.75 0 0 1 .415 1.279l-4.948 4.823 1.168 6.811a.751.751 0 0 1-1.088.791L12 18.347l-6.117 3.216a.75.75 0 0 1-1.088-.79l1.168-6.812-4.948-4.823a.75.75 0 0 1 .416-1.28l6.838-.993L11.328.668A.75.75 0 0 1 12 .25Zm0 2.445L9.44 7.882a.75.75 0 0 1-.565.41l-5.725.832 4.143 4.038a.748.748 0 0 1 .215.664l-.978 5.702 5.121-2.692a.75.75 0 0 1 .698 0l5.12 2.692-.977-5.702a.748.748 0 0 1 .215-.664l4.143-4.038-5.725-.831a.75.75 0 0 1-.565-.41L12 2.694Z"></path></svg>`;
    default:
      return '';
  }
}