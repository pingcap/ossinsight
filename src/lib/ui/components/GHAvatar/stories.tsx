import { Meta, StoryObj } from '@storybook/react';
import { GHAvatar } from './GHAvatar';

export default {
  title: 'Components/GHAvatar',
  component: GHAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof GHAvatar>;

export const Default = {
  args: {
    name: '634750802',
  },
} satisfies StoryObj<typeof GHAvatar>;
