import { Meta, StoryObj } from '@storybook/react';
import './style.scss';
import { Tag } from './Tag';

export default {
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Tag>;

export const Default = {
  args: {
    children: 'tag text',
    onClick: () => {},

  },
} satisfies StoryObj<typeof Tag>;
