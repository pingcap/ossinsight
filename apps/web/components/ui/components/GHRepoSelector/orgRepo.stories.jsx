import { GHOrgRepoSelector, HLGHOrgRepoSelector } from './GHOrgRepoSelector';
import React, { useState } from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/RemoteSelector/GHRepoSelector/GHOrgRepoSelector',
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
  const [repos, setRepos] = useState([
    {
      id: 41986369,
      fullName: 'pingcap/tidb',
      defaultBranch: 'master',
    },
  ]);
  const handleSelectRepo = (repo) => {
    setRepos([...repos, repo]);
  };
  const handleRemoveRepo = (repo) => {
    setRepos(repos.filter((r) => r.id !== repo.id));
  };

  return (
    <>
      <GHOrgRepoSelector
        repos={repos}
        onRepoSelected={handleSelectRepo}
        renderInput={renderInput}
        onRepoRemoved={handleRemoveRepo}
        orgName='pingcap'
        maxItems={5}
      />
      <div className='my-4' />
      <HLGHOrgRepoSelector
        ownerId={11855343}
        maxSelected={50}
        defaultSelectedIds={repos.map((r) => r.id)}
      />
    </>
  );
}

function renderInput(props) {
  return <input className='TextInput' {...props} type={undefined} />;
}
