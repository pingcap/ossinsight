import { createContext, useContext } from 'react';

type SuggestionsContextValues = {
  search: string;
  handleSelect: (title: string) => void;
  handleSelectId: (id: string, title?: string) => void;
};

export const ExploreContext = createContext<SuggestionsContextValues>({
  search: '',
  handleSelect () {},
  handleSelectId () {},
});

export function useExploreContext () {
  return useContext(ExploreContext);
}
