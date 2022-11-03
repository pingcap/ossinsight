import { Once, Title } from '@djagger/echartsx';
import React from 'react';

export interface WatermarkProps {
  left?: number | string;
  top?: number | string;
  bottom?: number | string;
  right?: number | string;
}

export default function Watermark ({ ...props }: WatermarkProps) {
  return (
    <Once dependencies={[props.bottom, props.left, props.right, props.top]}>
      <Title id='watermark' {...props} text="ossinsight.io" textStyle={{ color: '#4c4c4c', fontSize: 32, fontWeight: 'bolder' }} />
    </Once>
  );
}
