import { Meta, StoryObj } from '@storybook/react';
import { ComponentType } from 'react';
import { SiteHeader, SiteHeaderProps } from './SiteHeader';
import './style.scss';

export default {
  title: 'Components/SiteHeader',
  component: SiteHeader,
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
    logo: require('../../../../../web/public/logo.png').default,
    items: require('../../../../../web/site.config').default.header.items,
  },
} satisfies StoryObj<SiteHeaderProps>;
