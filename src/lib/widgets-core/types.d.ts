import { VisualizationContext, VisualizerModule } from '@ossinsight/widgets-types';
import { CSSProperties } from 'react';
import type { resolveParameters } from './parameters/resolver';
import { LinkedData } from './parameters/resolver';

export type ParserConfig = {
  type: 'json'
  extract: string // https://www.npmjs.com/package/jsonpath
}

export interface WidgetVisualizationProps {
  /**
   * The type of visualization used by widget renderer
   *
   * See src/renderers for available types.
   */
  type: string;

  /**
   * The imported widget visualizer module.
   */
  visualizer: VisualizerModule<any, any, any, any>;

  /**
   * The loaded data defined by widget's datasource.
   */
  data: any;

  /**
   * The parameters provided by renderer caller
   */
  parameters: any;

  /**
   * Some special parameter types are linked to external data like `repo-id` or `user-id`
   *
   * See {@link import('./parameters/resolver').resolveParameters} resolver for more details.
   */
  linkedData: LinkedData;

  /**
   * Some special widgets have dynamic data items amount, the height of these widgets are computed
   * by the runtime value.
   *
   * The value is computed by {@link VisualizerModule#computeDynamicHeight}
   */
  dynamicHeight?: number;

  colorScheme: string;
}

export interface WidgetReactVisualizationProps extends WidgetVisualizationProps {
  className?: string;
  style?: CSSProperties;
}

export interface WidgetNodeVisualizationProps extends WidgetVisualizationProps, Omit<VisualizationContext, 'theme'> {
  /**
   * Size name is provided by request url parameter `image_size`. All available values are
   * defined in {@link import('../../../web/site.config.ts')}.
   */
  sizeName?: string;

  /**
   * indicate that the widget is in root node of compose visualization tree
   */
  root: boolean;
}
