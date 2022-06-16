import React from 'react';
import AspectRatio from 'react-aspect-ratio';

export default function Video () {
  return (
    <AspectRatio ratio={1920 / 1280} style={{ width: '100%' }}>
      <video width="100%" height="100%" autoPlay loop muted >
        <source src={require('./bar-chart-race.mp4').default} type="video/mp4"/>
      </video>
    </AspectRatio>
  )
}