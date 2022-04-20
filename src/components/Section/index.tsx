import React, {PropsWithChildren} from "react";
import Button, {ButtonProps} from "@mui/material/Button";
import styles from "./styles.module.css";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export interface SectionProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  backgroundImage?: string
  buttonText?: React.ReactNode
  buttonLink?: string
}

export default function Section({title, subtitle, buttonLink, buttonText, backgroundImage, children}: PropsWithChildren<SectionProps>) {
  return (
    <section className={styles.section} style={backgroundImage && { backgroundImage: `url("${backgroundImage}")`}}>
      <div className='container'>
        {title
          ? <h2 className={styles.sectionTitle}>{title}</h2>
          : undefined
        }
        {subtitle
          ? <p className={styles.sectionSubtitle}>
            {subtitle}
            {buttonText
              ? (
                <a href={buttonLink}>
                  <ArrowRightIcon sx={{ verticalAlign: 'text-bottom' }} />
                  &nbsp;
                  {buttonText}
                </a>
              ) : undefined}
        </p>
          : undefined}
        <div>
          {children}
        </div>
      </div>
    </section>
  )
}
