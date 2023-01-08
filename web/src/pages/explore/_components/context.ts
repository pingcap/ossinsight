import { createContext } from 'react';

type SuggestionsContextValues = {
  handleSelect: (title: string) => void;
};

export const SuggestionsContext = createContext<SuggestionsContextValues>({
  handleSelect () {},
});
