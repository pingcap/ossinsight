import Box from '@mui/material/Box';
import React from 'react';
import Tag from '../../../_components/Tag';

export default function Tags () {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3}}>
      <Tag color='#FEC260' to='/collections/web-framework'>
        Web Framework
      </Tag>
      <Tag color='#E30C34' to='/collections/programming-language'>
        Programming Language
      </Tag>
      <Tag color='#F15A24' to='/collections/artificial-intelligence'>
        Artificial Intelligence
      </Tag>
      <Tag color='#F87C00' to='/collections/game-engine'>
        Game Engine
      </Tag>
      <Tag color='#FF5050' to='/collections/web3'>
        Web3
      </Tag>
      <Tag color='#E63E6D' to='/collections/open-source-database'>
        Open Source Database
      </Tag>
    </Box>
  )
}