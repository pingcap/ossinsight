export function getVariantClasses (target: string, variants: (string | false | undefined)[]) {
  return variants.filter(Boolean).map(variant => `${target}-${variant}`);
}
