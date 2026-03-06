export function getDevicePixelRatio (): number {
  if (typeof window !== 'undefined') {
    return window.devicePixelRatio
  } else {
    return 2
  }
}