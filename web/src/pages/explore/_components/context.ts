import { createContext, useContext } from 'react';

type SuggestionsContextValues = {
  search: string;
  handleSelect: (title: string) => void;
  handleSelectId: (id: string, title?: string) => void;
  showTips: () => void;
};

export const ExploreContext = createContext<SuggestionsContextValues>({
  search: '',
  handleSelect () {},
  handleSelectId () {},
  showTips () {},
});

export function useExploreContext () {
  return useContext(ExploreContext);
}
