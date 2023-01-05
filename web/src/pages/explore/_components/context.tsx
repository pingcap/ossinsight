import { createContext } from 'react';

interface ExploreContextValues {
  questionId: string | undefined;
}

const ExploreContext = createContext<ExploreContextValues>({
  questionId: undefined,
});

export default ExploreContext;
