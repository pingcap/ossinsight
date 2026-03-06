import { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

export default {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof CodeBlock>;

export const Markdown = {
  args: {
    code: 'Hello, `CodeBlock`!',
    language: 'markdown',
  },
} satisfies StoryObj<typeof CodeBlock>;

export const Html = {
  args: {
    code: '<p>Hello, <code>Code Block</code>!</p>',
    language: 'html',
  },
} satisfies StoryObj<typeof CodeBlock>;
