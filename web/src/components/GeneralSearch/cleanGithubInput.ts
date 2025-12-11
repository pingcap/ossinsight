const GITHUB_PREFIX = /^(?:https?:\/\/)?(?:www\.)?github\.com(?=[/?#]|$)/i;

export function cleanGithubInput (value: string): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!GITHUB_PREFIX.test(trimmed)) {
    return value;
  }

  let remainder = trimmed.replace(GITHUB_PREFIX, '');
  remainder = remainder.replace(/^\/+/, '');
  remainder = remainder.replace(/\/+$/, '');
  remainder = remainder.replace(/\/+(?=[?#])/g, '');
  return remainder;
}
