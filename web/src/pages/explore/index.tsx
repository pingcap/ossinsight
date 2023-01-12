import CustomPage from '@site/src/theme/CustomPage';
import React from 'react';
import Questions from '@site/src/pages/explore/_components/Questions';

export default function Page () {
  return (
    <CustomPage
      title="Data Explorer: Discover insights in GitHub event data with AI-generated SQL"
      description="Simply ask your question in natural language and Data Explore will generate SQL, query the data, and present the results visually."
      keywords="GitHub data, text to SQL, query tool, Data Explorer, GPT-3, AI-generated SQL"
      image="/img/data-thumbnail.png"
    >
      <Questions />
    </CustomPage>
  );
}
