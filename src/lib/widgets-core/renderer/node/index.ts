import { WidgetNodeVisualizationProps } from '../../types';

export default async function render (props: WidgetNodeVisualizationProps) {
  const { type } = props;
  switch (type) {
    case 'echarts':
      return await import('./echarts').then(module => module.default(props));
    case 'react-svg':
      return await import('./react-svg').then(module => module.default(props));
    case 'compose':
      return await import('./compose').then(module => module.default(props));
    default:
      throw new Error(`visualize type '${type}' not supported.`);
  }
}