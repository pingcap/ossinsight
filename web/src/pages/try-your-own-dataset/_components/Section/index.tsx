import React, { PropsWithChildren } from 'react';
import styles from './styles.module.css';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { notFalsy } from '@site/src/utils/value';
import { Container } from '@mui/material';

export interface SectionProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  backgroundImage?: string;
  buttonText?: React.ReactNode;
  buttonLink?: string;
}

export default function Section ({ title, subtitle, buttonLink, buttonText, backgroundImage, children }: PropsWithChildren<SectionProps>) {
  return (
    <section
      className={styles.section}
      style={{
        backgroundImage: notFalsy(backgroundImage) ? `url("${backgroundImage}")` : undefined,
      }}>
      <Container maxWidth="xl">
        {notFalsy(title)
          ? <h2 className={styles.sectionTitle}>{title}</h2>
          : undefined
        }
        {notFalsy(subtitle)
          ? <p className={styles.sectionSubtitle}>
            {subtitle}
            {notFalsy(buttonText)
              ? (
                  <a href={buttonLink}>
                    <ArrowRightIcon sx={{ verticalAlign: 'text-bottom' }} />
                    &nbsp;
                    {buttonText}
                  </a>
                )
              : undefined}
          </p>
          : undefined}
        <div>
          {children}
        </div>
      </Container>
    </section>
  );
}
