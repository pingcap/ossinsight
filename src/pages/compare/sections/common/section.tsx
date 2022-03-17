import React from "react";
import style from '../../index.module.css'
import CompareContext, {useCompareContext} from "../../context";

interface SectionProps {
  title: React.ReactNode
  description: React.ReactNode
  children: (ctx: CompareContext) => React.ReactNode
}

export default function Section({title, description, children}: SectionProps) {
  const ctx = useCompareContext()
  return (
    <section className={style.mainSection}>
      <h2>{title}</h2>
      <p>{description}</p>
      {children(ctx)}
    </section>
  )
}
