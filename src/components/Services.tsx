import { useEffect, useState, type ReactNode } from 'react'
import { motion, useSpring, type Variants } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

// Observed by IntersectionObserver on the visible h2 (never on the masked
// inner spans: overflow: clip would report them as outside the viewport and
// the reveal would never fire).
const titleInner: Variants = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { duration: 1, ease } },
}

const offers = [
  {
    index: '01',
    title: 'Web app completo',
    description:
      'Da interface aos dados, um sistema completo e pronto para ser usado.',
    tags: ['React', 'Node', 'Banco de dados', 'Deploy'],
  },
  {
    index: '02',
    title: 'Front-end sob medida',
    description:
      'Uma interface que passa cuidado em cada detalhe — rápida, acessível e viva.',
    tags: ['React', 'TypeScript', 'Motion', 'Acessibilidade'],
  },
  {
    index: '03',
    title: 'Backend e integrações',
    description:
      'APIs e integrações que puxam os dados sozinhas e mantêm tudo reconciliado.',
    tags: ['Node', 'REST', 'OAuth', 'Testes'],
  },
  {
    index: '04',
    title: 'Landing premium',
    description:
      'Página leve que carrega rápido e converte visita em conversa.',
    tags: ['Vite', 'SEO', 'Performance'],
  },
] as const

const steps = [
  {
    index: '01',
    title: 'Entendo',
    description: 'Escopo fechado e sem juridiquês: o que entra, o que não entra.',
  },
  {
    index: '02',
    title: 'Desenho',
    description: 'Fluxo e layout validados com você antes de qualquer código.',
  },
  {
    index: '03',
    title: 'Construo',
    description: 'Código limpo e testado, com prévias no caminho.',
  },
  {
    index: '04',
    title: 'Entrego',
    description: 'Deploy, handoff e acompanhamento pós-lançamento.',
  },
] as const

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.85, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

const WHATSAPP_URL =
  'https://wa.me/5518991150229?text=Ol%C3%A1%2C%20vi%20seu%20portf%C3%B3lio%20e%20quero%20conversar%20sobre%20um%20projeto'

function CtaButton() {  const [reduce, setReduce] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const x = useSpring(0, { stiffness: 220, damping: 22, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 22, mass: 0.4 })

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReduce(preference.matches)
      if (preference.matches) {
        x.jump(0)
        y.jump(0)
      }
    }
    preference.addEventListener('change', onChange)
    return () => preference.removeEventListener('change', onChange)
  }, [x, y])

  return (
    <motion.a
      className="cta-button"
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Agendar conversa pelo WhatsApp"
      style={{ x, y }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== 'mouse') return
        const bounds = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - (bounds.left + bounds.width / 2)) * 0.18)
        y.set((event.clientY - (bounds.top + bounds.height / 2)) * 0.28)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      onBlur={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <span>Agendar conversa</span>
      <i aria-hidden="true" />
    </motion.a>
  )
}

export function Services() {
  return (
    <section id="servicos" className="services" aria-labelledby="servicos-title">
      <div className="services-inner">
        <Reveal>
          <p className="section-label">
            <b>01</b> Serviços
          </p>
        </Reveal>

        <motion.h2
          id="servicos-title"
          className="services-title"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ staggerChildren: 0.12 }}
        >
          <span className="title-line">
            <motion.span className="title-inner" variants={titleInner}>
              Produto <em>completo</em>,
            </motion.span>
          </span>
          <span className="title-line">
            <motion.span className="title-inner" variants={titleInner}>
              do escopo ao deploy<span className="accent-dot">.</span>
            </motion.span>
          </span>
        </motion.h2>

        <Reveal delay={0.1}>
          <p className="services-sub">
            Sou full-stack: front, back e infra com uma pessoa só. Você fala
            com quem desenha, codifica e publica.
          </p>
        </Reveal>

        <ul className="offers">
          {offers.map((offer, position) => (
            <motion.li
              key={offer.index}
              className="offer"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8, delay: Math.min(position * 0.06, 0.18), ease }}
            >
              <span className="offer-index" aria-hidden="true">
                {offer.index}
              </span>
              <div className="offer-body">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <ul className="offer-tags" aria-label={`Tecnologias: ${offer.title}`}>
                  {offer.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="process-head">
          <h3>Como trabalho</h3>
          <motion.span
            className="process-line"
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.1, ease }}
          />
        </div>
        <ol className="process" aria-label="Etapas do trabalho">
          {steps.map((step, position) => (
            <motion.li
              key={step.index}
              className="process-step"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.75, delay: Math.min(position * 0.07, 0.21), ease }}
            >
              <span aria-hidden="true">{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.li>
          ))}
        </ol>

        <Reveal className="cta-row">
          <p className="cta-text">
            Vamos construir?
            <span>Uma pessoa só, do escopo ao deploy.</span>
          </p>
          <CtaButton />
        </Reveal>
      </div>
    </section>
  )
}
