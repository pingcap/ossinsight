import React, {useMemo} from "react";
import style from '../../index.module.css'
import CompareContext, {useCompareContext} from "../../_context";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useAuth0 } from "@auth0/auth0-react";

interface SectionProps {
  title: React.ReactNode
  description: React.ReactNode
  advanced?: boolean // require login
  children: (ctx: CompareContext) => React.ReactNode
}

function Blur({ blur = 5 }: { blur?: number }) {
  const { isAuthenticated, loginWithPopup } = useAuth0()

  if (isAuthenticated) {
    return <></>
  }

  return (
    <Box
      position='absolute'
      sx={{
        left: -blur * 2,
        top: -blur * 2,
        width: `calc(100% + ${blur * 4}px)`,
        height: `calc(100% + ${blur * 4}px)`,
        backdropFilter: `blur(${blur}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Button variant='contained' size='small' sx={{ fontSize: 18, py: 1, px: 2 }} onClick={() => loginWithPopup()}>
        Sign in to view more insights
        <ArrowRightAltIcon fontSize='large' sx={{ ml: 0.5 }} />
      </Button>
    </Box>
  )
}

export default function Section({title, description, advanced = false, children}: SectionProps) {
  const ctx = useCompareContext()

  const _title = useMemo(() => {
    if (typeof title === 'string') {
      return (
        <Typography variant='h4' component='h2'>
          {title}
        </Typography>
      )
    } else {
      return title
    }
  }, [title])

  const _description = useMemo(() => {
    if (typeof description === 'string') {
      return (
        <Typography variant='body1'>
          {description}
        </Typography>
      )
    } else {
      return description
    }
  }, [description])

  return (
    <section className={style.mainSection}>
      {_title}
      {_description}
      <Box sx={{mt: 4, mb: 8, position: 'relative'}}>
        {children(ctx)}
        {advanced ? <Blur /> : undefined}
      </Box>
    </section>
  )
}
