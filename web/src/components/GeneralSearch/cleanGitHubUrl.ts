export const cleanGitHubUrl = (text: string): string => {
  return text
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/\/$/, '');
};
