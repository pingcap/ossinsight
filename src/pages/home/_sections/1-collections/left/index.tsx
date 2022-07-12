import React from 'react';
import { Item } from '../../../_components/StackItem';
import SubtitleLine from './SubtitleLine';
import Tags from './Tags';
import TitleLine from './TitleLine';
import Button from "@mui/material/Button";
import Link from "../../../../../components/Link";

export default function Left() {
  return (
    <Item>
      <TitleLine />
      <SubtitleLine />
      <Tags />
      <Button sx={{fontSize: 16, fontWeight: 'bold', verticalAlign: 'baseline', textDecoration: 'underline', marginTop:6}} component={Link} href='/collections/open-source-database'>
        🔍 Find more popular collections
      </Button>
    </Item>
  );
}