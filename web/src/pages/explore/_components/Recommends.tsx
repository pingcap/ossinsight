import { RecommendedSuggestions } from '@site/src/pages/explore/_components/Suggestions';
import { Box, Divider, IconButton } from '@mui/material';
import { Cached } from '@mui/icons-material';
import { HighlightCard } from '@site/src/pages/explore/_components/QuestionCard';
import React, { useState } from 'react';
import useQuestionManagement, { FINAL_PHASES } from '@site/src/pages/explore/_components/useQuestion';
import SwitchLayout from '@site/src/pages/explore/_components/SwitchLayout';

export default function Recommends () {
  const [recommend, setRecommend] = useState(false);
  const { phase } = useQuestionManagement();

  const isPending = !FINAL_PHASES.has(phase);

  return (
    <>
      <SwitchLayout state={recommend ? 'recommend' : 'tips'} offset={20} direction="up">
        <RecommendedSuggestions
          key="recommend"
          title={(reload, loading) => (
            <Box mt={2} height="40px">
              🤖️ AI-generated questions: 3 random ones for you <IconButton onClick={reload} disabled={isPending}><Cached /></IconButton>
            </Box>
          )}
          aiGenerated
          n={3}
        />
        <HighlightCard key="tips" onClick={() => setRecommend(true)} />
      </SwitchLayout>
      <Divider orientation="horizontal" light sx={{ my: 3, backgroundColor: 'transparent' }} />
      <RecommendedSuggestions
        title={() => (
          <Box height="40px">
            🔥 Popular queries
          </Box>
        )}
        n={9}
      />
    </>
  );
}
