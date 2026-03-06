import { ToolboxComponentOption } from 'echarts/components';
import { ToolboxFeatureOption } from 'echarts/types/src/component/toolbox/featureManager';
import { withBaseOption } from '../base';

export const Toolbox = withBaseOption<ToolboxComponentOption>('toolbox', {}, 'Toolbox');

export function myDownload (onclick: () => void): ToolboxFeatureOption {
  return {
    show: true,
    onclick,
    iconStyle: {
      borderColor: 'lightgray',
    },
    icon: 'path://M995.84,1024,28.16,1024C12.8,1024,0,1011.2,0,995.84l0,0c0-15.36,12.8-28.16,28.16-28.16l967.68,0c15.36,0,28.16,12.8,28.16,28.16l0,0C1024,1011.2,1011.2,1024,995.84,1024zM926.72,376.32,926.72,376.32c-10.24-10.24-30.72-10.24-40.96,0L537.6,721.92,537.6,28.16C537.6,12.8,527.36,0,512,0s-25.6,12.8-25.6,28.16l0,693.76L138.24,376.32c-10.24-10.24-30.72-10.24-40.96,0-10.24,10.24-10.24,28.16,0,40.96l394.24,394.24c2.56,2.56,2.56,2.56,5.12,2.56,0,0,2.56,2.56,2.56,2.56,7.68,2.56,15.36,2.56,23.04,0,2.56,0,2.56-2.56,2.56-2.56,2.56,0,5.12-2.56,5.12-2.56l394.24-394.24C936.96,404.48,936.96,386.56,926.72,376.32z',
  };
}
