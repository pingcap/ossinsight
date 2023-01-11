import { useStateRef } from '@site/src/pages/explore/_components/Search';
import React, { useEffect, useState } from 'react';
import { array, randomOf } from '@site/src/utils/generate';
import { keyframes, styled } from '@mui/material';

interface TypewriterEffectProps {
  content: string;
  avgInterval?: number;
  maxDiff?: number;
  maxContinuous?: number;
}

export default function TypewriterEffect ({ content, avgInterval = 80, maxDiff = 50, maxContinuous = 1 }: TypewriterEffectProps) {
  const [len, setLen, lenRef] = useStateRef(0);
  const [done, setDone] = useState(true);

  useEffect(() => {
    setLen(0);

    let h: ReturnType<typeof setTimeout>;

    const arr = array(maxContinuous).map(n => n + 1);
    setDone(false);

    function runNext () {
      h = setTimeout(() => {
        if (lenRef.current >= content.length) {
          clearTimeout(h);
          setDone(true);
        } else {
          setLen(len => {
            const end = len + (randomOf(arr) ?? 1);
            if (content.substring(len, end).includes(' ')) {
              return len + 1;
            } else {
              return end;
            }
          });
          runNext();
        }
      }, avgInterval + (0.5 - Math.random()) * maxDiff);
    }

    runNext();

    return () => {
      clearTimeout(h);
    };
  }, [content]);

  return <>{content.slice(0, len)}{content.length !== len}{!done && <InputIndicator />}</>;
}

const blink = keyframes`
  to {
    visibility: hidden;
  }
`;

const InputIndicator = styled('span')`
  display: inline-block;
  width: 1px;
  height: 1em;
  vertical-align: text-bottom;
  background-color: currentColor;
  animation: ${blink} 1s steps(2, start) infinite;
`;
