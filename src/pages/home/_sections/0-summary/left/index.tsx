import React from 'react';
import { AlignRightItem } from '../../../_components/StackItem';
import GeneralSearchLine from './GeneralSearchLine';
import EventLine from './EventLine';
import FooterLine from './FooterLine';
import TitleLine from './TitleLine';

const Left = () => {
  return (
    <AlignRightItem>
      <EventLine />
      <TitleLine />
      <GeneralSearchLine />
      <FooterLine />
    </AlignRightItem>
  );
};

export default Left;
