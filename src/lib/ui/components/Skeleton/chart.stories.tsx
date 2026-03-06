import { Meta, StoryObj } from '@storybook/react';
import { ChartSkeleton } from './Chart';

export default {
  title: 'Components/Skeleton/Chart',
  component: ChartSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta;

export const Default = {
  args: {
  }
} satisfies StoryObj;
