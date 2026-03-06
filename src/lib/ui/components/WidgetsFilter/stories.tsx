import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { WidgetsFilter, WidgetsFilterConfig } from './WidgetsFilter';

export default {
  title: 'Components/WidgetsFilter',
  component: WidgetsFilter,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story: any) => {
      return <div><Story /></div>;
    },
  ],
} satisfies Meta<typeof WidgetsFilter>;

export const Default = {
  args: {
    availableTags: ['foo', 'bar', 'Repository', 'PRs', 'Stars'],
  },
  render: (args: ComponentProps<typeof WidgetsFilter>) => {
    return <Wrapper {...args} />;
  },
} satisfies StoryObj<typeof WidgetsFilter>;

function Wrapper (args: ComponentProps<typeof WidgetsFilter>) {
  const [config, setConfig] = useState<WidgetsFilterConfig>({ tag: 'Featured', search: '' });

  return (
    <>
      <WidgetsFilter {...args} config={config} onConfigChange={(nextConfig) => setConfig(nextConfig)} />
      <pre>{JSON.stringify(config, undefined, 2)}</pre>
    </>
  );
}
