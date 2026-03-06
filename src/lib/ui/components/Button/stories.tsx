import { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonProps } from './Button';
import './styles.scss';

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta;

export const Default = {
  args: {
    children: 'Default',
  },
} satisfies StoryObj<ButtonProps>;

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
} satisfies StoryObj<ButtonProps>;

export const PrimaryLarge = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Primary Large',
  },
} satisfies StoryObj<ButtonProps>;

export const PrimarySmall = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Primary Small',
  },
} satisfies StoryObj<ButtonProps>;
