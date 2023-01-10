import { createContext, useContext } from 'react';

type SuggestionsContextValues = {
  search: string;
  handleSelect: (title: string) => void;
  showTips: () => void;
};

export const ExploreContext = createContext<SuggestionsContextValues>({
  search: '',
  handleSelect () {},
  showTips () {},
});

export function useExploreContext () {
  return useContext(ExploreContext);
}
