import {GHRepoSelector} from './GHRepoSelector'
import {useState} from "react";


// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/RemoteSelector/GHRepoSelector',
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
  const [repo, setRepo] = useState()

  return <GHRepoSelector repo={repo} onRepoSelected={setRepo} renderInput={renderInput} />
}

function renderInput(props) {
  return <input className='TextInput' {...props} type={undefined} />
}
