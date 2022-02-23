import React, {useLayoutEffect, useRef} from 'react'
import {start} from "./dist";
import './dist/index.css'
import './style.css'
import {useRank} from "../../api/query";

interface WordCloudProps {
  children: JSX.Element
}

export default function WordCloud({children}: WordCloudProps) {
  const ref = useRef<HTMLDivElement>()
  const { data } = useRank(500)

  useLayoutEffect(() => {
    if (data && ref.current) {
      if (data.length === 0) {
        return
      }
      let max = data[0].events
      const list = data.map(({repo_name, events}) => {
        return {
          key: repo_name,
          word: repo_name.split('/')[1],
          weight: Math.sqrt(events / max)
        }
      })
      return start(list, { container: ref.current })
    }
  }, [data])

  return (
    <div ref={ref} className='wordcloud-container'>
      {children}
    </div>
  )
}