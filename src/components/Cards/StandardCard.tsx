import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import AspectRatio from "react-aspect-ratio";
import React from "react";
import Button from "@mui/material/Button";

export interface StandardCardProps {
  title: React.ReactNode
  description: React.ReactNode
  codeStyleDescription?: boolean
  image?: React.ReactElement
  aspectRatio?: number
  readMore?: string
}

export default function StandardCard({title, aspectRatio = 16 / 9, image, description, readMore, codeStyleDescription = true}: StandardCardProps) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{p: 2}} elevation={3}>
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
        {readMore
          ? (
            <Button size='small' variant='text' component='a' href={readMore} target='_blank'>
              READ MORE
            </Button>
          ) : undefined}
      </Card>
    </Grid>
  )
}

