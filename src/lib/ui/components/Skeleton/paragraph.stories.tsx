import { Meta, StoryObj } from '@storybook/react';
import { ParagraphSkeleton, ParagraphSkeletonProps } from './Paragraph';

export default {
  title: 'Components/Skeleton/Paragraph',
  component: ParagraphSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  render (props: ParagraphSkeletonProps) {
    return (
      <div className='max-w-full overflow-hidden'>
        <ParagraphSkeleton {...props} className='min-w-[400px] text-lg' />
      </div>
    )
  }
} satisfies Meta<ParagraphSkeletonProps>;

export const Default = {
  args: {
    characters: 40,
  },
} satisfies StoryObj<ParagraphSkeletonProps>;
