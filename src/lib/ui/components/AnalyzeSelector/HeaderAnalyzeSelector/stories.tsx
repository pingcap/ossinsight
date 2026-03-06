import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { HeaderAnalyzeSelector } from './HeaderAnalyzeSelector';

export default {
  title: 'Components/AnalyzeSelector/HeaderAnalyzeSelector',
  component: HeaderAnalyzeSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof HeaderAnalyzeSelector>;

export const Default = {
  args: {},
} satisfies StoryObj<typeof HeaderAnalyzeSelector>;
