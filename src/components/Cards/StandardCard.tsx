import Grid, {GridProps} from "@mui/material/Grid";
import Card, {CardProps} from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import AspectRatio from "react-aspect-ratio";
import React from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

export interface StandardCardProps extends Omit<GridProps<any, any>, 'item' | 'container'> {
  title: React.ReactNode
  description?: React.ReactNode
  codeStyleDescription?: boolean
  image?: React.ReactElement
  aspectRatio?: number
  buttonText?: string
  readMore?: string
  elevation?: number
  cardSx?: CardProps['sx']
  tags?: string[]
}

export default function StandardCard({
  title,
  aspectRatio = 16 / 9,
  image,
  description,
  readMore,
  buttonText = 'read more',
  codeStyleDescription = true,
  elevation,
  cardSx,
  tags,
  ...props
}: StandardCardProps) {
  return (
    <Grid item {...props}>
      <Card sx={{p: 2, ...cardSx}} elevation={elevation ?? 3}>
        <Typography
          variant='h3'
          sx={{mb: 1, fontWeight: 'bold', fontFamily: 'Poppins', minHeight: 50}}>
          {title}
        </Typography>
        {image
          ? (
            <AspectRatio ratio={aspectRatio}>
              {image}
            </AspectRatio>
          ) : undefined}
        {tags
          ? (
            <Box sx={{ my: 2 }}>
              {tags.map((tag, i) => <Chip size='small' label={tag} key={i} sx={{ mr: 2 }} />)}
            </Box>
          ) : undefined}
        {description
          ? (
            <Typography
              variant='body1'
              sx={{
                mt: 1,
                color: 'text.secondary',
                minHeight: 72,
                ...(codeStyleDescription ? {
                  fontFamily: 'var(--ifm-font-family-monospace)',
                  fontSize: 14,
                  fontStyle: 'italic'
                } : {})
              }}>
              {description}
            </Typography>
          ) : undefined}
        {readMore
          ? (
            <Button size='small' variant='text' component='a' href={readMore} target='_blank'>
              {buttonText}
            </Button>
          ) : undefined}
      </Card>
    </Grid>
  )
}

