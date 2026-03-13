import code from './country-codes.json';

export const alpha2ToTitle = (alpha2: string) => {
  if (alpha2 === 'UND') return 'Unknown';
  return (code as Record<string, string>)[alpha2];
};
