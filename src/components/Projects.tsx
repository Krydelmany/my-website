import { useEffect, useEffectEvent, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { motion, useSpring } from 'motion/react'
import { nexusMedia } from '../data/nexus'
import { NexusArtwork } from './NexusArtwork'
import '../projects.css'

export function Projects() {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'pointer' | 'focus' | null>(null)
  const x = useSpring(0, { stiffness: 260, damping: 28, mass: 0.45 })
  const y = useSpring(0, { stiffness: 260, damping: 28, mass: 0.45 })

  function position(clientX: number, clientY: number, immediate: boolean) {
    const preview = previewRef.current
    if (!preview) return
    const left = Math.max(16, Math.min(window.innerWidth - preview.offsetWidth - 24, clientX + 24))
    const top = Math.max(16, Math.min(window.innerHeight - preview.offsetHeight - 16, clientY - preview.offsetHeight / 2))
    if (immediate) { x.jump(left); y.jump(top) }
    else { x.set(left); y.set(top) }
  }

  function follow(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 701px) and (hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
    position(event.clientX, event.clientY, mode !== 'pointer')
    setMode('pointer')
  }

  function focusPreview() {
    if (!linkRef.current?.matches(':focus-visible') || window.matchMedia('(max-width: 700px), (hover: none), (prefers-reduced-motion: reduce)').matches) return
    const rect = linkRef.current.getBoundingClientRect()
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) { setMode(null); return }
    position(rect.left + rect.width * 0.52, rect.top + rect.height / 2, true)
    setMode('focus')
  }

  const handleScroll = useEffectEvent(() => {
    if (linkRef.current?.matches(':focus-visible')) focusPreview()
    else { setMode(null); x.stop(); y.stop() }
  })

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hide = () => { setMode(null); x.stop(); y.stop() }
    const scroll = () => handleScroll()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', hide)
    window.addEventListener('blur', hide)
    window.addEventListener('giovani:opening-replay', hide)
    preference.addEventListener('change', hide)
    return () => {
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', hide)
      window.removeEventListener('blur', hide)
      window.removeEventListener('giovani:opening-replay', hide)
      preference.removeEventListener('change', hide)
      x.stop(); y.stop()
    }
  }, [x, y])

  return (
    <section id="projetos" className="projects" aria-labelledby="projetos-title">
      <div className="projects-inner">
        <p className="section-label"><b>02</b> Projetos</p>
        <div className="projects-heading">
          <h2 id="projetos-title" className="projects-title">Da ideia<br />ao <em>uso real</em><span>.</span></h2>
          <p>Um olhar mais de perto sobre<br />o que eu construo.</p>
        </div>
        <ol className="project-list">
          <li>
            <Link
              id="nexus-project-link"
              ref={linkRef}
              className="project-link"
              to="/projetos/nexus"
              aria-label="Nexus: conhecer o projeto"
              onPointerEnter={follow}
              onPointerMove={follow}
              onPointerLeave={() => { setMode(null); focusPreview() }}
              onFocus={focusPreview}
              onBlur={() => setMode(null)}
            >
              <span className="project-number">01 / TCC</span>
              <span className="project-name">Nexus</span>
              <span className="project-meta">Interface, IA<br /> e tempo real</span>
              <span className="project-arrow" aria-hidden="true">&#8599;</span>
              <div className="project-inline-art" aria-hidden="true"><NexusArtwork imageSrc={nexusMedia.cover} /></div>
            </Link>
          </li>
        </ol>
        <p className="project-footnote"><span>Desenvolvimento completo</span><span>Interface + backend</span></p>
      </div>
      <motion.div
        ref={previewRef}
        className="project-cursor-preview"
        data-active={mode !== null}
        style={{ x, y }}
        aria-hidden="true"
      >
        <NexusArtwork imageSrc={nexusMedia.cover} />
        <span className="project-preview-label">Explorar Nexus <span>&#8599;</span></span>
      </motion.div>
    </section>
  )
}
