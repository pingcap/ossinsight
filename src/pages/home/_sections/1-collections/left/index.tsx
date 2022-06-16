import React from 'react';
import { Item } from '../../../_components/StackItem';
import SubtitleLine from './SubtitleLine';
import Tags from './Tags';
import TitleLine from './TitleLine';

export default function Left() {
  return (
    <Item>
      <TitleLine />
      <SubtitleLine />
      <Tags />
    </Item>
  );
}