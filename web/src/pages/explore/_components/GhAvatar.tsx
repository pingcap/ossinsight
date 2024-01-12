import React, { useMemo } from 'react';
import { Avatar } from '@mui/material';

interface GhAvatarProps {
  name: string;
}

export default function GhAvatar ({ name }: GhAvatarProps) {
  const src = useMemo(() => {
    if (/\[bot]/i.test(name)) {
      return '/img/github-bot-icon.svg';
    } else {
      return `https://github.com/${name}.png`;
    }
  }, [name]);

  return <Avatar src={src} />;
}
