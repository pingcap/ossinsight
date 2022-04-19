import React, {PropsWithChildren} from "react";
import Button, {ButtonProps} from "@mui/material/Button";
import styles from "../../pages/home/index.module.css";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export interface SectionProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  backgroundImage?: string
  buttonText?: React.ReactNode
  button?: ButtonProps<'a'>
}


export default function Section({title, subtitle, button, buttonText, backgroundImage, children}: PropsWithChildren<SectionProps>) {
  return (
    <section className={styles.section} style={backgroundImage && { backgroundImage: `url("${backgroundImage}")`}}>
      <div className='container'>
        {title
          ? <h2 className={styles.sectionTitle}>{title}</h2>
          : undefined
        }
        {subtitle
          ? <p className={styles.sectionSubtitle}>{subtitle}</p>
          : undefined}
        {buttonText
          ? (
            <Button component='a' startIcon={<ArrowRightIcon />} variant='contained' {...(button || {})}
                    sx={{':hover': {color: '#ffffff'}}}>
              {buttonText}
            </Button>
          ) : undefined}
        <div>
          {children}
        </div>
      </div>
    </section>
  )
}
