import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {start} from "./dist";
import './dist/index.css'
import './style.css'

interface WordCloudProps {
  children: JSX.Element
}

export default function WordCloud({children}: WordCloudProps) {
  const ref = useRef<HTMLDivElement>()
  const [data, setData] = useState<{ repo_name: string, events: number }[]>()

  useEffect(() => {
    fetch('https://community-preview-contributor.tidb.io/q/recent-events-rank')
      .then(data => data.json())
      .then((res) => {
        setData(res.data)
      })
  }, [])

  useLayoutEffect(() => {
    if (data && ref.current) {
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