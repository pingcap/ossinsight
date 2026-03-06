import { faker } from '@faker-js/faker';
import { Meta, StoryObj } from '@storybook/react';
import { HeadlessTabs, HeadlessTab } from './HeadlessTabs';

faker.seed(1);

export default {
  title: 'Components/Tabs/HeadlessTabs',
  component: HeadlessTabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story: any) => {
      return (
        <div className='w-80 max-w-md px-2 py-16 sm:px-0'>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof HeadlessTabs>;

export const Default = {
  args: {
    categories: ['Category 1', 'Category 2'],
    children: [
      <HeadlessTab>content 1</HeadlessTab>,
      <HeadlessTab>content 2</HeadlessTab>,
    ],
  },
} satisfies StoryObj<typeof HeadlessTabs>;
