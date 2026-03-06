import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../Button';

export interface TwitterButtonProps {
  text: string;
  url: string;
  tags?: string[];
}

export function TwitterButton ({ text, url, tags }: TwitterButtonProps) {
  const link = useMemo(() => {
    const usp = new URLSearchParams();
    usp.set('text', text);
    usp.set('url', url);
    if (tags && tags?.length > 0) {
      usp.set('hashtags', tags.join(','));
    }
    usp.set('via', 'OSSInsight');

    return `https://twitter.com/intent/tweet?${usp.toString()}`;
  }, [text, url, JSON.stringify(tags)]);

  return (
    <a className="block bg-control rounded-full p-2 cursor-pointer" href={link} target="_blank">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="text-[rgb(29,155,240)] w-[24px] h-[24px] fill-current">
        <g>
          <path
            d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
        </g>
      </svg>
    </a>
  );
}

// refer to: https://help.twitter.com/en/using-x/add-x-share-button
export function XButton({ text, url, tags, size = 24, label, className }: TwitterButtonProps & { size?: number, label?: string, className?: string }) {
  const link = useMemo(() => {
    const usp = new URLSearchParams();
    usp.set('text', text);
    usp.set('url', url);
    if (tags && tags?.length > 0) {
      usp.set('hashtags', tags.join(','));
    }
    usp.set('via', 'OSSInsight');

    return `https://twitter.com/intent/tweet?${usp.toString()}`;
  }, [text, url, JSON.stringify(tags)]);

  return (
    <>
      <a href={link} target='_blank' className={twMerge('Button cursor-pointer bg-[var(--background-color-control)] hover:bg-[var(--background-color-popover)]', className)}>
        <span className='bg-white rounded-full p-1'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className={twMerge(
            'text-[rgba(15,20,25,1.00)] fill-current',
            `w-[${size}px] h-[${size}px]`
          )}
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
          viewBox='0 0 1200 1227'
          fill='none'
        >
          <path d='M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z' />
        </svg></span>
        {label && <span className='text-white'>{label}</span>}
      </a>
    </>
  );
}