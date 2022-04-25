import InputAdornment from '@mui/material/InputAdornment';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import IconButton from '@mui/material/IconButton';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import Input from '@mui/material/Input';
import * as React from 'react';

export interface ShareUrlProps {
  url: string
  onCopy?: () => void
}

export default function ShareUrl ({ url, onCopy }: ShareUrlProps) {
  return (
    <Input
      value={url}
      disabled
      size="small"
      fullWidth
      endAdornment={
        <InputAdornment position="end">
          <CopyToClipboard
            text={url}
            onCopy={onCopy}
          >
            <IconButton>
              <ContentCopyOutlinedIcon />
            </IconButton>
          </CopyToClipboard>
        </InputAdornment>
      }
      sx={{mb: 2}}
    />
  )
}