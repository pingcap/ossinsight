import { GHOrgSelector } from './GHOrgSelector';
import { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/RemoteSelector/GHOrgSelector',
  component: Wrapper,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default = {
  args: {},
};

function Wrapper() {
  const [org, setOrg] = useState();

  return (
    <GHOrgSelector org={org} onOrgSelected={setOrg} renderInput={renderInput} />
  );
}

function renderInput(props) {
  return <input className='TextInput' {...props} type={undefined} />;
}
