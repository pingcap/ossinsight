import { createContext } from 'react';
import { Question } from '@site/src/api/explorer';
import { ExecutionContext } from '@site/src/pages/explore/_components/Execution';

interface ExploreContextValues {
  questionId: string | undefined;
  question: Question | undefined;
  executionContext: ExecutionContext | undefined | null;
  setQuestion: (question: string) => void;
}

const ExploreContext = createContext<ExploreContextValues>({
  questionId: undefined,
  question: undefined,
  executionContext: undefined,
  setQuestion: () => {},
});

export default ExploreContext;
