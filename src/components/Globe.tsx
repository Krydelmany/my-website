import { useEffect, useState } from 'react'

export function Globe() {
  const [animated, setAnimated] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pause = (event: MediaQueryListEvent) => {
      if (event.matches) setAnimated(false)
    }
    const restart = () => {
      if (!preference.matches) setAnimated(true)
    }

    preference.addEventListener('change', pause)
    window.addEventListener('giovani:opening-replay', restart)
    return () => {
      preference.removeEventListener('change', pause)
      window.removeEventListener('giovani:opening-replay', restart)
    }
  }, [])

  return (
    <span className={`globe${animated ? ' globe-animated' : ''}`} aria-hidden="true">
      <span className="globe-wrap">
        <span className="circle" />
        <span className="circle" />
        <span className="circle" />
        <span className="circle-hor" />
        <span className="circle-hor-middle" />
      </span>
    </span>
  )
}
