import { Meta, StoryObj } from '@storybook/react';
import { ComponentType } from 'react';
import { SiteBanner } from './SiteBanner';

export default {
  title: 'Components/SiteBanner',
  component: SiteBanner,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
  decorators: [(Story: ComponentType) => {
    return (
      <div className="h-[150vh]">
        <Story />
      </div>
    );
  }],
} satisfies Meta;
export const Default = {
  args: {
    banner: {
      content: 'This is banner!'
    }
  },
} satisfies StoryObj<typeof SiteBanner>;
