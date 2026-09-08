import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { MotionConfig } from 'motion/react'
import { Link, Route, Routes, useLocation, useNavigationType } from 'react-router'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { Opening } from './components/Opening'
import { Services } from './components/Services'
import { Projects } from './components/Projects'
import { NexusCase } from './components/NexusCase'

export const OPENING_READY_EVENT = 'giovani:opening-ready'
export const OPENING_REPLAY_EVENT = 'giovani:opening-replay'

// Drives the real Lenis instance: hard-stop during intro/replay so wheel and
// touch can't queue a scroll jump, instant return to top on replay.
function ScrollGate() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    const lock = () => lenis.stop()
    const replay = () => {
      lenis.scrollTo(0, { immediate: true })
      lenis.stop()
    }
    const release = () => lenis.start()
    if (!document.querySelector('.opening[data-ready="true"]')) lock()
    window.addEventListener(OPENING_REPLAY_EVENT, replay)
    window.addEventListener(OPENING_READY_EVENT, release)
    return () => {
      window.removeEventListener(OPENING_REPLAY_EVENT, replay)
      window.removeEventListener(OPENING_READY_EVENT, release)
      lenis.start()
    }
  }, [lenis])

  return null
}

function Home({ skipOpening, onEntered }: {
  skipOpening: boolean
  onEntered: Dispatch<SetStateAction<boolean>>
}) {
  const [entered, setEntered] = useState(skipOpening)

  useEffect(() => {
    const lock = () => {
      setEntered(false)
      document.body.style.overflow = 'hidden'
    }
    const release = () => {
      setEntered(true)
      onEntered(true)
      document.body.style.overflow = ''
    }
    lock()
    if (document.querySelector('.opening[data-ready="true"]')) release()
    window.addEventListener(OPENING_REPLAY_EVENT, lock)
    window.addEventListener(OPENING_READY_EVENT, release)
    return () => {
      window.removeEventListener(OPENING_REPLAY_EVENT, lock)
      window.removeEventListener(OPENING_READY_EVENT, release)
      document.body.style.overflow = ''
    }
  }, [onEntered])

  return (
    <>
      <ScrollGate />
      <Opening initialReady={skipOpening} />
      <div inert={!entered}>
        <Services />
        <Projects />
      </div>
    </>
  )
}

function NavigationEffects() {
  const location = useLocation()
  const [initialKey] = useState(location.key)
  const navigation = useNavigationType()
  const lenis = useLenis()
  const positions = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    const savedPositions = positions.current
    const savedY = navigation === 'POP' ? savedPositions.get(location.key) : undefined
    const home = location.pathname === '/'
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const freshHomeReload = home && location.key === initialKey && savedY === undefined && entry?.type === 'reload'
    document.title = home ? 'Giovani Claro Moraes' : location.pathname === '/projetos/nexus'
      ? 'Nexus | Giovani Claro Moraes' : 'P\u00e1gina n\u00e3o encontrada | Giovani Claro Moraes'
    document.querySelector('meta[name="description"]')?.setAttribute('content', home
      ? 'Giovani Claro Moraes. Desenvolvimento full-stack com cuidado em cada detalhe. Da primeira ideia \u00e0 \u00faltima linha.'
      : location.pathname === '/projetos/nexus'
        ? 'Nexus: projeto acad\u00eamico desenvolvido por Giovani Claro Moraes. Interface, backend e comunica\u00e7\u00e3o em tempo real entre desktop e dispositivo.'
        : 'P\u00e1gina n\u00e3o encontrada. Volte ao portf\u00f3lio de Giovani Claro Moraes.')

    let frame = 0
    const place = () => {
      window.removeEventListener(OPENING_READY_EVENT, place)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const target = home && location.hash && !freshHomeReload ? document.getElementById(location.hash.slice(1)) : null
        lenis?.resize()
        const y = target ? target.getBoundingClientRect().top + window.scrollY - 16 : savedY ?? 0
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
        else window.scrollTo(0, y)
        const focus = !home ? document.getElementById('case-title') ?? document.getElementById('not-found-title')
          : !freshHomeReload && (location.hash === '#projetos' || savedY !== undefined) ? document.getElementById('nexus-project-link') : null
        focus?.focus({ preventScroll: true })
      })
    }
    const opening = document.querySelector('.opening')
    if (home && opening?.getAttribute('data-ready') === 'false') {
      window.scrollTo(0, 0)
      window.addEventListener(OPENING_READY_EVENT, place)
    } else place()

    return () => {
      if ((window.history.state?.key ?? 'default') !== location.key) {
        savedPositions.set(location.key, window.scrollY)
      }
      cancelAnimationFrame(frame)
      window.removeEventListener(OPENING_READY_EVENT, place)
    }
  }, [location.key, location.pathname, location.hash, initialKey, navigation, lenis])

  return null
}

function App() {
  const location = useLocation()
  const [initialKey] = useState(location.key)
  const [enteredOnce, setEnteredOnce] = useState(false)

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root>
        <Routes>
          <Route path="/" element={<Home skipOpening={enteredOnce || location.key !== initialKey} onEntered={setEnteredOnce} />} />
          <Route path="/projetos/nexus" element={<NexusCase />} />
          <Route path="*" element={(
            <main className="not-found">
              <p className="case-kicker">404 / Fora do caminho</p>
              <h1 id="not-found-title" tabIndex={-1}>Esta p&aacute;gina n&atilde;o existe.</h1>
              <Link className="case-back" to="/">Voltar ao in&iacute;cio &#8599;</Link>
            </main>
          )} />
        </Routes>
        <NavigationEffects />
      </ReactLenis>
    </MotionConfig>
  )
}

export default App
