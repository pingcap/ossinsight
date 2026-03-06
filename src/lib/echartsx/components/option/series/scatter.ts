import { ScatterSeriesOption } from 'echarts/charts';
import { withBaseOption } from '../base';


export const ScatterSeries = withBaseOption<ScatterSeriesOption>('series', { type: 'scatter' }, 'Scatter')
