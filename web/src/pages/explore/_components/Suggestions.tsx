import { Box, Grid, Skeleton } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import QuestionCard, { QuestionCardVariant } from '@site/src/pages/explore/_components/QuestionCard';
import { generateQuestion, QuestionTemplate } from '@site/src/api/explorer';
import useSWR from 'swr';
import { array } from '@site/src/utils/generate';

export interface SuggestionsProps {
  disabled?: boolean;
  variant?: QuestionCardVariant;
  title?: (reload: () => void, loading: boolean) => ReactNode;
  n?: number;
  questionPrefix?: ReactNode;
  showTags?: boolean;
}

export interface RecommendedSuggestionsProps extends SuggestionsProps {
  aiGenerated?: boolean;
}

export interface PresetSuggestionsProps extends SuggestionsProps {
  questions: string[];
}

export function useRecommended (aiGenerated: boolean, n?: number, tagId?: number) {
  const { data, isValidating, mutate } = useSWR([aiGenerated, n, tagId, 'data-explorer-recommend-question'], {
    fetcher: async (aiGenerated, n) => await generateQuestion(aiGenerated, n, tagId),
    shouldRetryOnError: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  });

  return {
    data,
    loading: isValidating,
    reload: useMemo(() => {
      return () => {
        mutate(undefined, { revalidate: true }).catch(console.error);
      };
    }, []),
  };
}

export function Suggestions ({ variant, disabled, questions, n, questionPrefix, showTags = false }: SuggestionsProps & { questions: QuestionTemplate[] }) {
  const renderLoading = () => {
    const renderCard = (i: number) => (
      <QuestionCard
        key={i}
        variant={variant}
        question={(
          variant === 'text'
            ? <Skeleton width="70%" />
            : (
              <>
                <Skeleton width="100%" />
                <Skeleton width="61%" />
              </>
              )

        )}
        disabled
      />
    );
    if (variant === 'text') {
      return array(3).map(renderCard);
    } else {
      return array(3).map(i => (
        <Grid item xs={12} md={4} key={i} display="flex" alignItems="stretch" justifyContent="stretch">
          {renderCard(i)}
        </Grid>
      ));
    }
  };

  const renderData = () => {
    const renderCard = (question: QuestionTemplate, i: number) => (
      <QuestionCard key={i} variant={variant} question={question.title} questionId={question.questionId} tags={showTags ? question.tags : []} prefix={questionPrefix} disabled={disabled} />
    );
    if (variant === 'text') {
      return questions.map(renderCard);
    }
    return questions.map((question, i) => (
      <Grid item xs={12} md={4} key={question.hash} display="flex" alignItems="stretch" justifyContent="stretch">
        {renderCard(question, i)}
      </Grid>
    ));
  };

  const content = questions.length === 0 ? renderLoading() : renderData();
  if (variant === 'text') {
    return (
      <Box>
        {content}
      </Box>
    );
  } else {
    return (
      <Grid container spacing={2}>
        {content}
      </Grid>
    );
  }
}
export function RecommendedSuggestions ({ aiGenerated = false, n, disabled = false, title, questionPrefix, variant }: RecommendedSuggestionsProps) {
  const { data = [], reload, loading } = useRecommended(aiGenerated, n);
  return (
    <>
      <Box mb={0.5}>
        {title?.(reload, loading) ?? null}
      </Box>
      <Suggestions n={n} questions={data} disabled={disabled} questionPrefix={questionPrefix} variant={variant ?? (aiGenerated ? 'recommended-card' : 'card')} />
    </>
  );
}
