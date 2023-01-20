export function gotoAnchor (anchor: string, smooth: boolean = true) {
  return () => {
    document.getElementById(anchor)?.scrollIntoView(smooth ? { behavior: 'smooth' } : undefined);
  };
}
