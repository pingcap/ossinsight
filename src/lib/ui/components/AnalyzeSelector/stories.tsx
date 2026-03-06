import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AnalyzeSelector } from './AnalyzeSelector';
import { AnalyzeTuple } from './types';

export default {
  title: 'Components/AnalyzeSelector',
  component: Wrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},

} satisfies Meta<typeof AnalyzeSelector>;

export const Default = {
  args: {},
} satisfies StoryObj<typeof AnalyzeSelector>;

function Wrapper () {
  const [tuple, setTuple] = useState<AnalyzeTuple>({ type: 'user', value: undefined });

  return (
    <AnalyzeSelector tuple={tuple} onTupleChange={setTuple} />
  );
}
