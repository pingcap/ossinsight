import React, {useMemo, useState} from "react";
import Paper from "@mui/material/Paper";
import {useAdsLink} from "../Ads";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import {Close} from "@mui/icons-material";
import {responsiveSx} from "../../pages/home/_components/responsive";
import {SxProps} from "@mui/system";
import {combineSx} from "../../utils/mui";

export interface TryItYourselfProps {
  show?: boolean
  campaign?: string
  fixed?: boolean
}

export default function TryItYourself({show = true, campaign, fixed = false}: TryItYourselfProps) {
  const [display, setDisplay] = useState(show)

  const link = useAdsLink('/blog/try-it-yourself', 'utm_campaign', campaign)

  const _sx: SxProps = useMemo(() => {
    if (fixed) {
      return [
        {
          position: 'fixed',
          right: 2,
          bottom: 8,
          zIndex: 'var(--ifm-z-index-fixed-mui)'
        },
        responsiveSx(
          theme => ({
            right: '1.3em',
            bottom: `calc(4.3em + ${theme.spacing(2)})`
          }),
          theme => ({
            right: '1.3em',
            bottom: `calc(4.3em + ${theme.spacing(2)})`
          }),
          theme => ({
            right: theme.spacing(4),
            bottom: '50vh'
          })
        )
      ]
    } else {
      return {
        position: 'relative',
        mb: 3,
        width: 'calc(100% - 1px)'
      }
    }
  }, [fixed])

  const sx = useMemo(() => {
    return combineSx(_sx, {
      backgroundColor: '#2c2c2c',
      p: 2
    })
  }, [_sx])

  if (!display) {
    return <></>
  }

  return (
    <Paper
      sx={sx}
    >
      <Typography variant='body2' sx={{pr: 2}}>
        💡 <a href={link} target='_blank'><b>Try</b></a> Your Own Dataset!
      </Typography>
      <IconButton
        size='small'
        sx={{position: 'absolute', right: 8, top: 8}}
        onClick={() => setDisplay(false)}
      >
        <Close sx={{fontSize: 16}}/>
      </IconButton>
    </Paper>
  )
}