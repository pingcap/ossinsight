import React, {useMemo} from "react";
import style from '../../index.module.css'
import CompareContext, {useCompareContext} from "../../_context";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useInView } from 'react-intersection-observer'
import InViewContext from "../../../../components/InViewContext";

interface SectionProps {
  title: React.ReactNode
  description: React.ReactNode
  children: (ctx: CompareContext, inView: boolean) => React.ReactNode
}

export default function Section({title, description, children}: SectionProps) {
  const { inView, ref } = useInView({ fallbackInView: true })
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
    <section ref={ref} className={style.mainSection}>
      <InViewContext.Provider value={{ inView }}>
        {_title}
        {_description}
        <Box sx={{ mt: 4, mb: 8 }}>
          {children(ctx, inView)}
        </Box>
      </InViewContext.Provider>
    </section>
  )
}
