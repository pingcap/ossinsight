import { AngleAxisOption, RadiusAxisOption, XAXisOption, YAXisOption } from 'echarts/types/dist/shared';
import {
  CategoryAxisBaseOption,
  LogAxisBaseOption,
  TimeAxisBaseOption,
  ValueAxisBaseOption,
} from 'echarts/types/src/coord/axisCommonTypes';
import { withBaseOption } from '../base';

namespace Axis {

  export namespace Value {
    export const X = withBaseOption<XAXisOption & ValueAxisBaseOption>('xAxis', { type: 'value' }, 'XValueAxis');
    export const Y = withBaseOption<YAXisOption & ValueAxisBaseOption>('yAxis', { type: 'value' }, 'YValueAxis');
    export const Angle = withBaseOption<AngleAxisOption & ValueAxisBaseOption>('angleAxis', { type: 'value' }, 'AngleValueAxis');
    export const Radius = withBaseOption<RadiusAxisOption & ValueAxisBaseOption>('radiusAxis', { type: 'value' }, 'RadiusValueAxis');
  }

  export namespace Time {
    export const X = withBaseOption<XAXisOption & TimeAxisBaseOption>('xAxis', { type: 'time' }, 'XTimeAxis');
    export const Y = withBaseOption<YAXisOption & TimeAxisBaseOption>('yAxis', { type: 'time' }, 'YTimeAxis');
    export const Angle = withBaseOption<AngleAxisOption & TimeAxisBaseOption>('angleAxis', { type: 'time' }, 'AngleTimeAxis');
    export const Radius = withBaseOption<RadiusAxisOption & TimeAxisBaseOption>('radiusAxis', { type: 'time' }, 'RadiusTimeAxis');
  }

  export namespace Log {
    export const X = withBaseOption<XAXisOption & LogAxisBaseOption>('xAxis', { type: 'log' }, 'XLogAxis');
    export const Y = withBaseOption<YAXisOption & LogAxisBaseOption>('yAxis', { type: 'log' }, 'YLogAxis');
    export const Angle = withBaseOption<AngleAxisOption & LogAxisBaseOption>('angleAxis', { type: 'log' }, 'AngleLogAxis');
    export const Radius = withBaseOption<RadiusAxisOption & LogAxisBaseOption>('radiusAxis', { type: 'log' }, 'RadiusLogAxis');
  }

  export namespace Category {
    export const X = withBaseOption<XAXisOption & CategoryAxisBaseOption>('xAxis', { type: 'category' }, 'XCategoryAxis');
    export const Y = withBaseOption<YAXisOption & CategoryAxisBaseOption>('yAxis', { type: 'category' }, 'YCategoryAxis');
    export const Angle = withBaseOption<AngleAxisOption & CategoryAxisBaseOption>('angleAxis', { type: 'category' }, 'AngleCategoryAxis');
    export const Radius = withBaseOption<RadiusAxisOption & CategoryAxisBaseOption>('radiusAxis', { type: 'category' }, 'RadiusCategoryAxis');
  }

}
export default Axis;

