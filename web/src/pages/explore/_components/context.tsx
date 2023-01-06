import { createContext } from 'react';
import { Question } from '@site/src/api/explorer';

interface ExploreContextValues {
  questionId: string | undefined;
  question: Question | undefined;
}

const ExploreContext = createContext<ExploreContextValues>({
  questionId: undefined,
  question: undefined,
});

export default ExploreContext;
