export default function isInternalUrl(url?: string): boolean {
  if (!url) {
    return false;
  }
  return !/^(https?:)?\/\//.test(url);
}
