export function usePrefersReducedMotion () {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
