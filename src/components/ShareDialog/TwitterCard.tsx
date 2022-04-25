import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import AspectRatio from 'react-aspect-ratio';
import Image from '../Image';
import * as React from 'react';

export default function TwitterCard ({title, description, imgData}: { title: string, description: string, imgData: string }) {
  return (
    <Card sx={{
      borderRadius: 2,
      border: '1px solid rgb(56, 68, 77)',
      overflow: 'hidden',
      background: 'rgb(21, 32, 43)',
      width: '100%',
    }} elevation={0}>
      <Box sx={{borderBottom: '1px solid rgb(56, 68, 77)'}}>
        <AspectRatio ratio={436 / 219}>
          <Image src={imgData} style={{backgroundPosition: 'top left'}} />
        </AspectRatio>
      </Box>
      <Box sx={{p: 1.5, lineHeight: 1, fontSize: '15px'}}>
        <Box sx={{color: 'rgb(139, 152, 165)'}}>
          ossinsight.io
        </Box>
        <Box sx={{color: 'rgb(247, 249, 249)', mt: '2px', fontWeight: 400}}>
          {title}
        </Box>
        <Box sx={{color: 'rgb(139, 152, 165)', mt: '2px', fontWeight: 400}}>
          {description}
        </Box>
      </Box>
    </Card>
  );
};
