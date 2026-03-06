import { faker } from '@faker-js/faker';
import { Meta, StoryObj } from '@storybook/react';
import { Tab } from './Tab';
import { Tabs } from './Tabs';

faker.seed(1);

export default {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  decorators: [
    (Story: any) => {
      return <div className="max-w-[400px]"><Story /></div>;
    },
  ],
} satisfies Meta<typeof Tabs>;

export const Default = {
  args: {
    children: [
      <Tab value="a" title={faker.person.firstName()} icon={<img width={14} src={faker.image.avatar()} alt="avatar" />}>
        {faker.lorem.paragraphs()}
      </Tab>,
      <Tab value="b" title={faker.person.firstName()} icon={<img width={14} src={faker.image.avatar()} alt="avatar" />}>
        {faker.lorem.paragraphs()}
      </Tab>,
      <Tab value="c" title={faker.person.firstName()} icon={<img width={14} src={faker.image.avatar()} alt="avatar" />}>
        {faker.lorem.paragraphs()}
      </Tab>,
    ],
  },
} satisfies StoryObj<typeof Tabs>;
