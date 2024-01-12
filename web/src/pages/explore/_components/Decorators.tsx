import React from 'react';
import { styled } from '@mui/material';

export function Decorators () {
  return (
    <Container>
      <Ellipse1 />
      <Ellipse2 />
    </Container>
  );
}

const Container = styled('div', { name: 'Decorators-Container' })`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 200vh;
  pointer-events: none;
  overflow: hidden;
`;

const Image = styled('div')`
  display: block;
  position: absolute;
  background-position: left top;
  background-repeat: no-repeat;
`;

const Ellipse1 = styled(Image)`
  background-image: url('/img/ellipse-2.svg');
  left: 41px;
  top: 81px;
  right: 0;
  width: 696px;
  height: 696px;
  background-size: 696px 696px;
  overflow: hidden;
`;

const Ellipse2 = styled(Image)`
  background-image: url('/img/ellipse-2.svg');
  top: 241px;
  right: 0;
  width: 961px;
  height: 1072px;
  background-size: 961px 1072px;
  overflow: hidden;
`;
