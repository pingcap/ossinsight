export function gotoAnchor (anchor: string) {
  return () => {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  };
}
