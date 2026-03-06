export function parseWidgetName (name: string): { vendor: string, name: string } {
  if (name.startsWith('@ossinsight/widget-')) {
    return {
      vendor: 'official',
      name: name.replace('@ossinsight/widget-', ''),
    };
  } else {
    throw new Error('not supported widget');
  }
}

export function toWidgetPathname (widget: string) {
  const { vendor, name } = parseWidgetName(widget);

  return `/widgets/${vendor}/${name}`;
}
