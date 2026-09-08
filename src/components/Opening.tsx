import { useEffect, useRef, useState } from 'react'
import {
  motion,
  stagger,
  useAnimate,
  useAnimationFrame,
  useSpring,
  type AnimationSequence,
} from 'motion/react'
import { useLenis } from 'lenis/react'
import { Globe } from './Globe'

const greetings = [
  { word: '你好', language: '中文', lang: 'zh-CN', duration: 0.5 },
  { word: 'Hello', language: 'English', lang: 'en', duration: 0.34 },
  { word: 'Bonjour', language: 'Fran\u00e7ais', lang: 'fr', duration: 0.34 },
  { word: 'Ciao', language: 'Italiano', lang: 'it', duration: 0.32 },
  { word: 'こんにちは', language: '日本語', lang: 'ja', duration: 0.36 },
  { word: 'Hola', language: 'Espa\u00f1ol', lang: 'es', duration: 0.32 },
  { word: 'Привет', language: 'Русский', lang: 'ru', duration: 0.36 },
  { word: 'Ol\u00e1', language: 'Sinta-se em casa', lang: 'pt-BR', duration: 0.62 },
]

const ease = [0.22, 1, 0.36, 1] as const
const letters = 'Giovani'.split('')

function ContinueLink() {
  const lenis = useLenis()

  return (
    <a
      href="#servicos"
      className="continue-link"
      onClick={(event) => {
        event.preventDefault()
        if (lenis) lenis.scrollTo('#servicos')
        else document.querySelector('#servicos')?.scrollIntoView({ behavior: 'smooth' })
      }}
    >
      <span>O que posso construir</span>
      <span className="continue-arrow" aria-hidden="true">
        ↓
      </span>
    </a>
  )
}

const BURST_GRAVITY = 1150
const BURST_EMIT_MS = 160
const BURST_MAX_ALIVE = 12

const BURST_ICONS = [
  {
    id: 'react',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="2.1" fill="currentColor" /><ellipse cx="12" cy="12" rx="9.2" ry="3.8" /><ellipse cx="12" cy="12" rx="9.2" ry="3.8" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="9.2" ry="3.8" transform="rotate(120 12 12)" /></svg>
    ),
  },
  {
    id: 'typescript',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#3178c6" /><path d="M6 8h8M10 8v9M13.4 11.2c.7-.5 1.5-.8 2.4-.8 1.5 0 2.5.7 2.5 1.8 0 2.4-3.8 1.2-3.8 3.2 0 .8.7 1.4 1.8 1.4.9 0 1.7-.3 2.3-.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
  },
  {
    id: 'node',
    icon: (
      <svg viewBox="0 0 24 24"><path d="m12 2.5 8 4.6v9.2L12 21l-8-4.7V7.1z" fill="#539e43" /><path d="M8.4 9.2v5.6l3.6 2.1 3.6-2.1V9.2l-3.6-2.1z" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" /></svg>
    ),
  },
  {
    id: 'css',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M4 3h16l-1.5 17.5L12 22l-6.5-1.5z" fill="#264de4" /><path d="m8 8 .4 4.6H16l-.3 3.3-3.7 1-3.7-1-.2-2.1" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
    ),
  },
  {
    id: 'vite',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M13.5 2 5 13.6h5.2L9.4 22l8.9-11.4h-5.2z" fill="#9a63ff" /></svg>
    ),
  },
  {
    id: 'git',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="#f05032" /><circle cx="9" cy="8" r="1.9" fill="#fff" /><circle cx="9" cy="16" r="1.9" fill="#fff" /><circle cx="15" cy="11.5" r="1.9" fill="#fff" /><path d="M9 9.9v4.2m0-2.6c0-2.1 3.2-1.2 4.3-2.4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
  },
  {
    id: 'javascript',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#f7df1e" /><text x="12" y="17" textAnchor="middle" fontSize="10.5" fontWeight="800" fontFamily="Inter, Arial, sans-serif" fill="#242521">JS</text></svg>
    ),
  },
  {
    id: 'html',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M4 3h16l-1.5 17.5L12 22l-6.5-1.5z" fill="#e34f26" /><text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Inter, Arial, sans-serif" fill="#fff">5</text></svg>
    ),
  },
  {
    id: 'tailwind',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#06b6d4" /><path d="M4.5 14.5c1.5 0 1.5-1.2 3-1.2s1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2M4.5 10.5c1.5 0 1.5-1.2 3-1.2s1.5 1.2 3 1.2 1.5-1.2 3-1.2 1.5 1.2 3 1.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" /></svg>
    ),
  },
  {
    id: 'postgres',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#336791" /><ellipse cx="12" cy="8.5" rx="5" ry="2.2" fill="none" stroke="#fff" strokeWidth="1.5" /><path d="M7 8.5v7c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2v-7M7 12c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2" fill="none" stroke="#fff" strokeWidth="1.5" /></svg>
    ),
  },
  {
    id: 'docker',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" fill="#2496ed" /><path d="M6 13V9.5h2.5V7h2.5V9.5H14V13zM5 14.5h14V18H5z" fill="#fff" /></svg>
    ),
  },
  {
    id: 'figma',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#242521" /><path d="M12 6.5h3.2a2.3 2.3 0 1 0 0-4.6H12z" fill="#1abcfe" /><path d="M8.8 6.5h3.2v4.6H8.8a2.3 2.3 0 1 1 0-4.6z" fill="#0acf83" /><path d="M8.8 11.1h3.2v4.6H8.8a2.3 2.3 0 1 1 0-4.6z" fill="#ff7262" /><circle cx="14.9" cy="13.4" r="2.3" fill="#f24e1e" /><path d="M12 15.7h3.2a2.3 2.3 0 1 0 0 4.6H12z" fill="#a259ff" /></svg>
    ),
  },
]

interface BurstItem {
  id: number
  icon: number
  size: number
}

interface BurstBody {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  age: number
  life: number
  phase: number
}

function easeOutBack(t: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function TechnologyBurst() {
  const [items, setItems] = useState<BurstItem[]>([])
  const [active, setActive] = useState(false)
  const bodies = useRef(new Map<number, BurstBody>())
  const elements = useRef(new Map<number, HTMLSpanElement>())
  const emitting = useRef(false)
  const emitDebt = useRef(0)
  const nextId = useRef(1)
  const spawnCount = useRef(0)

  function spawn() {
    if (bodies.current.size >= BURST_MAX_ALIVE) {
      const oldest = bodies.current.keys().next().value
      if (oldest !== undefined) {
        bodies.current.delete(oldest)
        elements.current.delete(oldest)
        setItems((previous) => previous.filter((item) => item.id !== oldest))
      }
    }
    const id = nextId.current
    nextId.current += 1
    const icon = spawnCount.current % BURST_ICONS.length
    spawnCount.current += 1
    // Sideways fan from the top of the word: strong lateral push with only a
    // breath of lift, so every arc stays on screen while gravity bends it
    // down past the label. Lateral spread shrinks on narrow viewports.
    const spread = window.innerWidth < 700 ? 0.45 : 1
    bodies.current.set(id, {
      x: (Math.random() - 0.5) * 24,
      y: 0,
      vx: (40 - Math.random() * 240) * spread,
      vy: -(30 + Math.random() * 110),
      rot: (Math.random() - 0.5) * 60,
      vr: (Math.random() - 0.5) * 360,
      age: 0,
      life: 1.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    })
    const size = 16 + Math.random() * 8
    setItems((previous) => [...previous, { id, icon, size }])
  }

  // Continuous overflow: while hovered/focused, trickle out one icon at a
  // time; each integrates real gravity per frame and fades mid-fall.
  // Transforms are written straight to the DOM so React never re-renders
  // mid-flight — state only mounts/unmounts particles.
  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 50) / 1000
    if (emitting.current) {
      emitDebt.current += delta
      while (emitDebt.current >= BURST_EMIT_MS) {
        emitDebt.current -= BURST_EMIT_MS * (0.75 + Math.random() * 0.5)
        spawn()
      }
    } else {
      emitDebt.current = 0
    }
    if (bodies.current.size === 0) return
    const dead: number[] = []
    bodies.current.forEach((body, id) => {
      body.age += dt
      if (body.age >= body.life) {
        dead.push(id)
        return
      }
      body.vy += BURST_GRAVITY * dt
      body.vx += Math.sin(body.age * 6 + body.phase) * 26 * dt
      body.x += body.vx * dt
      body.y += body.vy * dt
      body.rot += body.vr * dt
      const element = elements.current.get(id)
      if (!element) return
      const lifeT = body.age / body.life
      const opacity = body.age < 0.08 ? body.age / 0.08 : lifeT > 0.62 ? Math.max(0, 1 - (lifeT - 0.62) / 0.38) : 1
      const scale = body.age < 0.14 ? easeOutBack(body.age / 0.14) : 1
      element.style.opacity = opacity.toFixed(3)
      element.style.transform = `translate3d(${body.x.toFixed(1)}px, ${body.y.toFixed(1)}px, 0) rotate(${body.rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`
    })
    if (dead.length > 0) {
      dead.forEach((id) => {
        bodies.current.delete(id)
        elements.current.delete(id)
      })
      setItems((previous) => previous.filter((item) => !dead.includes(item.id)))
    }
  })

  function show() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    emitting.current = true
    setActive(true)
  }

  function hide() {
    emitting.current = false
    setActive(false)
  }

  return (
    <p
      className={`discipline header-enter tech-burst${active ? ' is-active' : ''}`}
      tabIndex={0}
      onFocus={show}
      onBlur={hide}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') show()
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') hide()
      }}
    >
      Desenvolvedor<br /><span>full-stack</span>
      <span className="tech-burst-scene" aria-hidden="true">
        {items.map((item) => (
          <span
            key={item.id}
            data-pid={item.id}
            ref={(element) => {
              if (element) elements.current.set(item.id, element)
              else elements.current.delete(item.id)
            }}
            className={`tech-particle tech-particle--${BURST_ICONS[item.icon].id}`}
            style={{ width: item.size, height: item.size, marginLeft: -item.size / 2, opacity: 0 }}
          >
            {BURST_ICONS[item.icon].icon}
          </span>
        ))}
      </span>
    </p>
  )
}

export function Opening({ initialReady = false }: { initialReady?: boolean }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [ready, setReady] = useState(initialReady || Boolean(reducedMotion))
  const [iteration, setIteration] = useState(0)
  const animation = useRef<ReturnType<typeof animate> | null>(null)
  const skipped = useRef(false)
  const restoreFocus = useRef(false)
  const magneticX = useSpring(0, { stiffness: 220, damping: 22, mass: 0.4 })
  const magneticY = useSpring(0, { stiffness: 220, damping: 22, mass: 0.4 })



  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReducedMotion(preference.matches)
      if (preference.matches) {
        magneticX.jump(0)
        magneticY.jump(0)
      }
    }
    preference.addEventListener('change', onChange)
    return () => preference.removeEventListener('change', onChange)
  }, [magneticX, magneticY])

  // A live reduced-motion change mid-play must settle like a skip: the
  // timeline above gets cancelled, so finish the state here instead of
  // leaving the hero inert behind a hidden intro.
  useEffect(() => {
    if (reducedMotion && !ready) {
      skipped.current = true
      try {
        animation.current?.complete()
      } catch {
        // No active timeline left to finish.
      }
      setReady(true)
    }
  }, [reducedMotion, ready])

  useEffect(() => {
    let cancelled = false
    let fontTimeout: ReturnType<typeof setTimeout> | undefined
    let controls: ReturnType<typeof animate> | undefined

    async function play() {
      try {
        if (reducedMotion || skipped.current || scope.current.dataset.ready === 'true') return

        // Wait briefly for local type, but never make a font request a loading gate.
        await Promise.race([
          document.fonts.ready,
          new Promise<void>((resolve) => { fontTimeout = setTimeout(resolve, 800) }),
        ])
        clearTimeout(fontTimeout)
        if (cancelled || skipped.current) return

        const sequence: AnimationSequence = []
        let time = 0

        greetings.forEach((greeting, index) => {
          sequence.push([
            `[data-greeting="${index}"]`,
            { opacity: [0, 1, 1, 0], y: [14, 0, 0, -14] },
            { at: time, duration: greeting.duration, times: [0, 0.18, 0.78, 1], ease: 'easeInOut' },
          ])
          time += greeting.duration - 0.035
        })

        sequence.push(
          ['.intro-detail', { opacity: [1, 0], y: [0, -10] }, { at: time - 0.12, duration: 0.24 }],
          ['.intro-curtain', { y: ['0%', '125%'] }, { at: time, duration: 1.18, ease: [0.76, 0, 0.24, 1] }],
          ['.intro-curve path', {
            d: [
              'M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z',
              'M 0 100 Q 50 -90 100 100 L 100 100 L 0 100 Z',
              'M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z',
            ],
          }, { at: time, duration: 1.18, ease: 'easeInOut' }],
          ['.header-enter', { opacity: [0, 1], y: [18, 0] }, { at: time + 0.32, duration: 0.8, delay: stagger(0.08), ease }],
          ['.location-badge', { opacity: [0, 1], x: [-45, 0] }, { at: time + 0.48, duration: 1, ease }],
          ['.hero-note', { opacity: [0, 1], y: [24, 0] }, { at: time + 0.52, duration: 0.9, ease }],
          ['.signature-enter', { opacity: [0, 1], scale: [0.45, 1], rotate: [-100, 0] }, { at: time + 0.46, duration: 1.35, ease }],
          ['.name-glyph', { y: ['112%', '0%'], rotate: [7, 0], fontWeight: [380, 560] }, { at: time + 0.53, duration: 1.22, delay: stagger(0.055), ease }],
          ['.name-period', { opacity: [0, 1], scale: [0, 1] }, { at: time + 1.05, duration: 0.72, type: 'spring', bounce: 0.32 }],
          ['.hero-rule', { scaleX: [0, 1] }, { at: time + 0.87, duration: 1.1, ease }],
          ['.footer-enter', { opacity: [0, 1], y: [16, 0] }, { at: time + 1.04, duration: 0.8, delay: stagger(0.08), ease }],
        )

        controls = animate(sequence)
        animation.current = controls
        await controls
      } catch (error) {
        console.error('Could not play the opening animation.', error)
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    void play()

    return () => {
      cancelled = true
      clearTimeout(fontTimeout)
      controls?.cancel()
      animation.current = null
    }
  }, [animate, iteration, reducedMotion, scope])

  useEffect(() => {
    if (ready) {
      if (restoreFocus.current) {
        scope.current.querySelector<HTMLButtonElement>('.replay-button')?.focus({ preventScroll: true })
        restoreFocus.current = false
      }
      window.dispatchEvent(new Event('giovani:opening-ready')) // mirrored in App.tsx
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      skipped.current = true
      animation.current?.complete()
      restoreFocus.current = true
      setReady(true)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [ready, scope])

  function replay() {
    skipped.current = false
    restoreFocus.current = true
    magneticX.set(0)
    magneticY.set(0)
    window.dispatchEvent(new Event('giovani:opening-replay')) // mirrored in App.tsx
    setReady(false)
    setIteration((value) => value + 1)
  }

  return (
    <div className="opening" ref={scope} data-ready={ready}>
      <div className="intro" hidden={ready}>
        <div className="intro-visual" aria-hidden="true">
          <div className="intro-curtain">
            <svg className="intro-curve" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z" />
            </svg>
          </div>
          <div className="greetings">
            {greetings.map((greeting, index) => (
              <div className={`greeting${index % 2 ? ' greeting-italic' : ''}`} data-greeting={index} key={index} lang={greeting.lang}>
                <span className="greeting-word"><i />{greeting.word}</span>
                <span className="greeting-language">{greeting.language}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only" role="status">Abrindo o portf&oacute;lio de Giovani.</span>
        <button className="intro-skip intro-detail" onClick={() => {
          skipped.current = true
          animation.current?.complete()
          restoreFocus.current = true
          setReady(true)
        }}>
          Pular abertura <span aria-hidden="true">&darr;</span>
        </button>
      </div>

      <main className="hero" inert={!ready}>
        <header className="hero-header">
          <div className="brand header-enter">
            <span
              className="brand-drum"
              aria-label="Giovani Claro Moraes"
              tabIndex={0}
            >
              <span className="brand-credit" aria-hidden="true">
                <span className="copyright">&copy;</span>
              </span>
              <span className="brand-copy" aria-hidden="true">
                <span className="brand-code">Code by </span>
                <span className="brand-given">Giovani<span className="brand-surname">Claro Moraes</span></span>
              </span>
            </span>
          </div>
          <TechnologyBurst />
        </header>

        <div className="hero-composition">
          <div className="hero-context">
            <div className="location-badge">
              <p><span>Localizado em</span>Birigui, S&atilde;o Paulo</p>
              <span className="location-globe" aria-hidden="true">
                <Globe />
              </span>
            </div>

            <div className="hero-intention">
              <div className="signature-enter" aria-hidden="true">
                <motion.svg className="signature" viewBox="0 0 100 100" whileHover={reducedMotion ? undefined : { rotate: 90, scale: 1.12 }} transition={{ type: 'spring', stiffness: 110, damping: 14 }}>
                  {Array.from({ length: 8 }, (_, index) => (
                    <path key={index} d="M45 43 C38 31 39 10 47 3 C56 13 57 31 53 44 L50 53 Z" transform={`rotate(${index * 45} 50 50)`} />
                  ))}
                  <circle cx="50" cy="50" r="9" />
                </motion.svg>
              </div>
              <p className="hero-note">Boas ideias.<br />Bem constru&iacute;das.</p>
            </div>
          </div>

          <h1 className="hero-name" aria-label="Giovani">
            {letters.map((letter, index) => (
              <span className="name-letter" data-letter={letter} key={index} aria-hidden="true">
                <span className="name-glyph">{letter}</span>
              </span>
            ))}
            <span className="name-period" aria-hidden="true" />
          </h1>
        </div>

        <footer className="hero-footer">
          <div className="hero-rule" aria-hidden="true" />
          <p className="footer-enter">Da primeira ideia <span>&agrave; &uacute;ltima linha.</span></p>
          <div className="footer-actions footer-enter">
            <ContinueLink />
            <div className="replay-area">
              <motion.button
                className="replay-button"
                onClick={replay}
                style={{ x: magneticX, y: magneticY }}
                onPointerMove={(event) => {
                  if (reducedMotion || event.pointerType !== 'mouse') return
                  const bounds = event.currentTarget.parentElement!.getBoundingClientRect()
                  magneticX.set((event.clientX - bounds.left - bounds.width / 2) * 0.16)
                  magneticY.set((event.clientY - bounds.top - bounds.height / 2) * 0.2)
                }}
                onPointerLeave={() => { magneticX.set(0); magneticY.set(0) }}
                onBlur={() => { magneticX.set(0); magneticY.set(0) }}
              >
                <span>Rever abertura</span>
                <span className="replay-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 9a7.5 7.5 0 1 1-.25 5M5 4v5h5" />
                  </svg>
                </span>
              </motion.button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
