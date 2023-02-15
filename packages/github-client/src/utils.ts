export const extractOwnerAndRepo = (fullName: string) => {
  const parts = fullName.split("/");

  if (parts.length !== 2) {
    throw new Error(`Got a wrong repo name: ${fullName}`);
  }

  return {
    owner: parts[0],
    repo: parts[1]
  }
}

export const eraseGitHubToken = (value: string | undefined): string => {
  return value ? `****${value.substring(value.length - 8)}` : 'anonymous';
}