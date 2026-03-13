import { getOwnerInfo } from '@/components/Analyze/utils';
import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { FC, SVGAttributes } from 'react';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Analyze Owner';
export const size = {
  width: 800,
  height: 418,
};

export const dynamic = 'force-dynamic';

export const contentType = 'image/png';

// Image generation
export { default } from './image';
