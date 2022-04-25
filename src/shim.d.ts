import 'react'
import 'grecaptcha'

declare module 'react' {
  interface CSSProperties {
    '--ifm-container-width-xl'?: string | number
  }
}
