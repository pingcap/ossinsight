/** @jsxImportSource . */

import { WidgetsDefinitions } from '@ossinsight/internal/widgets';
import { Spacing, WidgetLayout } from '@/lib/widgets-utils/compose';
import Compose from './factory';
import { CardHeading } from './builtin'

export const CARD_COMMON_PADDING = 24;
export const CARD_COMMON_HEADING_HEIGHT = 48;

const CARD_COMMON_PADDING_SHAPE: Spacing = [0, CARD_COMMON_PADDING, CARD_COMMON_PADDING / 2, CARD_COMMON_PADDING];

export interface CardProps {
  padding?: Spacing;
  gap?: number;
  headerHeight?: number;
  title?: string;
  subtitle?: string;
  children?: Compose.ComposeNodes;
}

export function Card ({
  padding = CARD_COMMON_PADDING_SHAPE,
  gap,
  headerHeight = CARD_COMMON_HEADING_HEIGHT,
  title,
  subtitle,
  children,
}: CardProps) {
  return (
    <flex direction="vertical" padding={padding} gap={gap}>
      <CardHeading title={title ?? ''} subtitle={subtitle ?? ''} size={headerHeight} />
      {children}
    </flex>
  );
}

export namespace Card {
  export const COMMON_PADDING = CARD_COMMON_PADDING;
  export const COMMON_HEADING_HEIGHT = CARD_COMMON_HEADING_HEIGHT;
}

export type WidgetProps<K extends keyof WidgetsDefinitions> = {
  name: K
} & { parameters: WidgetsDefinitions[K]['params'] } & Compose.JSX.IntrinsicAttributes & Omit<Compose.JSX.LayoutAttributes<WidgetLayout>, 'parameters' | 'widget'>;

export function Widget<K extends keyof WidgetsDefinitions> ({ name, ifEmpty, data, gap, size, grow, padding, parameters }: WidgetProps<K>) {
  const attrs = { ifEmpty, data, gap, size, grow, padding };
  return <widget widget={name} parameters={parameters} {...attrs} />;
}
