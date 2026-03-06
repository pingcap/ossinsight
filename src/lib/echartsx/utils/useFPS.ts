import { useEffect, useRef, useState } from 'react';

export function useFPS(timeSlice: number = 1): number | undefined {
  const [fps, setFps] = useState<number>()

  const count = useRef<number>(0)

  useEffect(() => {
    let stop = false

    const frame = (time: number) => {
      count.current += 1
      if (!stop) {
        requestAnimationFrame(frame)
      }
    }
    requestAnimationFrame(frame)

    const intervalHandler = setInterval(() => {
      setFps(count.current)
      count.current = 0
    }, timeSlice)

    return () => {
      clearInterval(intervalHandler)
      stop = true
    }
  }, [])

  return fps
}
