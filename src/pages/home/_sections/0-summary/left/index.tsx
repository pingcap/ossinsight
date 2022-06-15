import React from 'react';
import { AlignRightItem } from '../../../_components/StackItem';
import AnalyzeSelectorLine from './AnalyzeSelectorLine';
import EventLine from './EventLine';
import FooterLine from './FooterLine';
import TitleLine from './TitleLine';

const Left = () => {
  return (
    <AlignRightItem>
      <EventLine />
      <TitleLine />
      <AnalyzeSelectorLine />
      <FooterLine />
    </AlignRightItem>
  );
};

export default Left;
