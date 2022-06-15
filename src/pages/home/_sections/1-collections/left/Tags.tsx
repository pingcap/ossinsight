import Box from '@mui/material/Box';
import React from 'react';
import Tag from '../../../_components/Tag';

export default function Tags () {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3}}>
      <Tag color='#E63E6D' to='/collections/open-source-database'>
        Open Source Database
      </Tag>
      <Tag color='#E30C34' to='/collections/javascript-framework'>
        JavaScript Framework
      </Tag>
      <Tag color='#FEC260' to='/collections/web-framework'>
        Web Framework
      </Tag>
      <Tag color='#F15A24' to='/collections/static-site-generator'>
        Static Site Generator
      </Tag>
      <Tag color='#F87C00' to='/collections/low-code-development-tool'>
        Lowcode Development Tools
      </Tag>
    </Box>
  )
}