import { Meta, StoryObj } from '@storybook/react';
import { AvatarSkeleton } from './Avatar';

export default {
  title: 'Components/Skeleton/Avatar',
  component: AvatarSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta;

export const Default = {
  args: {
    size: 8,
  }
} satisfies StoryObj;
