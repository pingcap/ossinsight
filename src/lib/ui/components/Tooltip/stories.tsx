import { Meta, StoryObj } from '@storybook/react';
import { InfoTooltip } from './Info';

export default {
  title: 'Components/Tooltip',
  component: InfoTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof InfoTooltip>;

export const Default = {
  args: {
    children: 'Tooltip content',
  },
} satisfies StoryObj<typeof InfoTooltip>;
