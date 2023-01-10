import { createContext, useContext } from 'react';

type SuggestionsContextValues = {
  search: string;
  handleSelect: (title: string) => void;
};

export const ExploreContext = createContext<SuggestionsContextValues>({
  search: '',
  handleSelect () {},
});

export function useExploreContext () {
  return useContext(ExploreContext);
}
