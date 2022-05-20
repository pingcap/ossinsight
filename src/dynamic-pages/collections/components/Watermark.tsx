import { Once, Title } from '@djagger/echartsx';
import React from 'react';

export interface WatermarkProps {
  left?: number | string;
  top?: number | string;
  bottom?: number | string;
  right?: number | string;
}

export default function Watermark({ ...props }: WatermarkProps) {
  return (
    <Once dependencies={[props.bottom, props.left, props.right, props.top]}>
      <Title id='watermark' {...props} text="https://ossinsight.io" textStyle={{ color: '#2c2c2c', fontSize: 16, fontWeight: 'bolder' }} />
    </Once>
  );
}
