import React from 'react';
import { Item } from '../../../_components/StackItem';
import CompareTool from './CompareTool';
import SubtitleLine from './SubtitleLine';
import TitleLine from './TitleLine';

export default function Left() {
  return (
    <Item>
      <TitleLine />
      <SubtitleLine />
      <CompareTool />
    </Item>
  );
}