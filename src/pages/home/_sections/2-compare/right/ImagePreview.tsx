import React from 'react';
import AspectRatio from 'react-aspect-ratio';
import Image from '../../../../../components/Image';

export default function ImagePreview () {
  return (
    <AspectRatio ratio={1284 / 1273}>
      <Image src={require('./analyze.png').default} style={{width: '100%', height: '100%'}} />
    </AspectRatio>
  )
}