import { Meta } from '@storybook/react';
import { CollectionInfo, CollectionSelector } from './CollectionSelector';
import {useState} from "react";
import type { InputHTMLAttributes } from 'react';


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/RemoteSelector/CollectionSelector',
  component: Wrapper,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} satisfies Meta<typeof CollectionSelector>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default = {
  args: {},
};

function Wrapper() {
  const [collection, setCollection] = useState<CollectionInfo>()

  return <CollectionSelector collection={collection} onCollectionSelected={setCollection} renderInput={renderInput} />
}

function renderInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className='TextInput' {...props} type={undefined} />
}
