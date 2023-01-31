import React, { MouseEvent, ReactNode } from 'react';
import { gotoAnchor } from '@site/src/utils/dom';
import { useEventCallback } from '@mui/material';

interface AnchorProps {
  className?: string;
  anchor: string;
  smooth?: boolean;
  children?: ReactNode;
}

export default function Anchor ({ anchor, smooth = false, ...props }: AnchorProps) {
  const handleClick = useEventCallback((e: MouseEvent) => {
    e.preventDefault();
    gotoAnchor(anchor, smooth)();
  });

  return (
    <a href={`#${anchor}`} {...props} onClick={handleClick} />
  );
}
