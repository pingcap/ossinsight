import React from 'react';
import AspectRatio from 'react-aspect-ratio';
import Image from '../../../../../components/Image';

export default function ImagePreview () {
  return (
    <AspectRatio ratio={1292 / 1073}>
      <Image src={require('./homepage-developer.png').default} style={{width: '100%', height: '100%'}} />
    </AspectRatio>
  )
}