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
  n: number;
}

export interface RecommendedSuggestionsProps extends SuggestionsProps {
  aiGenerated?: boolean;
}

export interface PresetSuggestionsProps extends SuggestionsProps {
  questions: string[];
}

export function useRecommended (aiGenerated: boolean, n: number) {
  const { data, isValidating, mutate } = useSWR([aiGenerated, n, 'data-explorer-recommend-question'], {
    fetcher: async (aiGenerated, n) => await generateQuestion(aiGenerated, n),
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

export function Suggestions ({ variant, disabled, questions, n }: SuggestionsProps & { questions: QuestionTemplate[] }) {
  const renderLoading = () => {
    const renderCard = (i: number) => (
      <QuestionCard
        key={i}
        variant={variant}
        question={(
          variant === 'text'
            ? <Skeleton width="230px" />
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
      return array(n).map(renderCard);
    } else {
      return array(n).map(i => (
        <Grid item xs={12} md={4} key={i} display="flex" alignItems="stretch" justifyContent="stretch">
          {renderCard(i)}
        </Grid>
      ));
    }
  };

  const renderData = () => {
    const renderCard = (question: QuestionTemplate, i: number) => (
      <QuestionCard key={i} variant={variant} question={question.title} disabled={disabled} />
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

export function PresetSuggestions ({ n, disabled, questions, variant }: PresetSuggestionsProps) {
  return <Suggestions questions={useMemo(() => questions.map(question => ({ title: question, hash: question, ai_generated: 0 })), [questions])} n={n} disabled={disabled} variant={variant} />;
}

export function RecommendedSuggestions ({ aiGenerated = false, n, disabled = false, title, variant }: RecommendedSuggestionsProps) {
  const { data = [], reload, loading } = useRecommended(aiGenerated, n);
  return (
    <>
      {title?.(reload, loading) ?? null}
      <Suggestions n={n} questions={data} disabled={disabled} variant={variant ?? (aiGenerated ? 'recommended-card' : 'card')} />
    </>
  );
}
