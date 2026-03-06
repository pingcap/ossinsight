import { Meta, StoryObj } from '@storybook/react';
import { TextSkeleton, TextSkeletonProps } from './Text';

export default {
  title: 'Components/Skeleton/Text',
  component: TextSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<TextSkeletonProps>;

export const Default = {
  args: {
  }
} satisfies StoryObj<TextSkeletonProps>;
