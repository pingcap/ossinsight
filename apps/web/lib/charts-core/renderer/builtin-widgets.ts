type MockCSSProperties = {
  color?: string
  fontSize?: number | string
  fontWeight?: number | string
  marginLeft?: string | number
}

export interface BuiltinWidgetsMap {
  'builtin:avatar-label': { label?: string; imgSrc: string; imgSize?: number, href?: string, imgProps?: any, labelColor?: string };
  'builtin:card-heading': { title: string; subtitle?: string };
  'builtin:label-value': {
    label: string | number;
    value?: string | number;
    labelProps?: {
      style?: MockCSSProperties;
      className?: string;
    };
    valueProps?: {
      style?: MockCSSProperties;
      className?: string;
      tooltip?: string;
    };
    column?: boolean;
    tooltip?: string;
    spliter?: string;
    spliterProps?: {
      style?: MockCSSProperties;
      className?: string;
    };
    center?: boolean;
  };
  'builtin:label': { label: string | number, labelProps?: { style?: MockCSSProperties, className?: string } };
  'builtin:empty': {
    title?: string;
  };
  'builtin:avatar-progress': {
    label?: string;
    imgSrc?: string;
    size?: number;
    value: number;
    maxVal: number;
    backgroundColor?: string;
    color?: string;
    valueFormatter?: (value: any) => string;
    labelColor?: string[];
    href?: string;
  };
  'builtin:progress-bar': {
    items: Array<{
      label: string;
      percentage: number;
      color?: string;
    }>;
  };
}

export type BuiltinWidgetProps<K extends keyof BuiltinWidgetsMap> = BuiltinWidgetsMap[K];
