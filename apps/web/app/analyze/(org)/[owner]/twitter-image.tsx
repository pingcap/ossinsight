import { getOwnerInfo } from '@/components/Analyze/utils';
import { OG_IMAGE_SIZE } from '@/lib/og-image';
import { DateTime } from 'luxon';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { FC, SVGAttributes } from 'react';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Analyze Owner';
export const size = OG_IMAGE_SIZE;

export const dynamic = 'force-dynamic';

export const contentType = 'image/png';

// Image generation
export { default } from './image';
