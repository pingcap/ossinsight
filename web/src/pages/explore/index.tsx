import CustomPage from '@site/src/theme/CustomPage';
import React from 'react';
import { useExperimental } from '@site/src/components/Experimental';
import NotFound from '@theme/NotFound';
import Questions from '@site/src/pages/explore/_components/Questions';

export default function Page () {
  const [enabled] = useExperimental('explore-data');

  if (!enabled) {
    return <NotFound />;
  }

  return (
    <CustomPage
      title="Data Explorer: Open Source Explorer powered by TiDB Cloud"
      description="The ultimate query tool for accessing and analyzing data on GitHub. Analyze 5+ billion GitHub data from natural language, no prerequisite knowledge of SQL or plotting libraries necessary."
      keywords="GitHub data,text to SQL,query tool,Data Explorer"
      image="/img/data-thumbnail.png"
    >
      <Questions />
    </CustomPage>
  );
}
