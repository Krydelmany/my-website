import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { nexusMedia, NEXUS_WHATSAPP_URL } from '../data/nexus'
import { NexusArtwork } from './NexusArtwork'
import '../projects.css'

const caseEase = [0.22, 1, 0.36, 1] as const

// Fase 1: entrada do case em sequência (cabeçalho, título, fatos, capa).
// Curta de propósito: o conteúdo fica legível em menos de um segundo e o
// MotionConfig com reduced-motion="user" neutraliza os deslocamentos.
function CaseRise({ children, delay = 0, className }: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: caseEase }}
    >
      {children}
    </motion.div>
  )
}

function Capture({ src, alt, caption }: { src?: string; alt: string; caption: string }) {
  const [failed, setFailed] = useState(false)
  if (!src) return null
  return (
    <figure className="case-capture">
      {failed ? <p className="media-unavailable">Esta imagem est&aacute; indispon&iacute;vel no momento.</p> : (
        <img src={src} alt={alt} width="1600" height="1000" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export function NexusCase() {
  const [videoFailed, setVideoFailed] = useState(false)

  return (
    <main className="nexus-case" aria-labelledby="case-title">
      <motion.header
        className="case-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: caseEase }}
      >
        <Link className="case-brand" to="/" aria-label="Voltar para o in&iacute;cio">Giovani<span>.</span></Link>
        <Link className="case-back" to="/#projetos"><span aria-hidden="true">&#8592;</span> Voltar aos projetos</Link>
      </motion.header>

      <section className="case-hero" aria-labelledby="case-title">
        <CaseRise>
          <p className="case-kicker">N / Projeto acad&ecirc;mico</p>
        </CaseRise>
        <CaseRise delay={0.08}>
          <div className="case-hero-heading">
            <h1 id="case-title" tabIndex={-1}>Nexus<span>.</span></h1>
            <p className="case-lead">Interface, IA e comunica&ccedil;&atilde;o em tempo real entre desktop e dispositivo.</p>
          </div>
        </CaseRise>
        <CaseRise delay={0.16}>
          <dl className="case-facts">
            <div><dt>Minha atua&ccedil;&atilde;o</dt><dd>Desenvolvimento completo</dd></div>
            <div><dt>Contexto</dt><dd>Trabalho de conclus&atilde;o de curso</dd></div>
            <div><dt>Tecnologias</dt><dd>React / TypeScript / Python</dd></div>
          </dl>
        </CaseRise>
        <CaseRise delay={0.24}>
          <NexusArtwork className="case-cover" imageSrc={nexusMedia.cover} />
        </CaseRise>
      </section>

      <section className="case-section case-demo" aria-labelledby="demo-title">
        <p className="case-index">01 / Em uso</p>
        <div className="case-section-body">
          <h2 id="demo-title">Uma a&ccedil;&atilde;o.<br />Dois lados conectados.</h2>
          <p>No desktop, a pessoa faz uma solicita&ccedil;&atilde;o. O backend coordena as a&ccedil;&otilde;es e valida as altera&ccedil;&otilde;es. No dispositivo, a interface reflete o novo estado.</p>
          {nexusMedia.video && !videoFailed ? (
            <video className="case-video" aria-label="Demonstra&ccedil;&atilde;o do Nexus" controls playsInline preload="none" poster={nexusMedia.poster ?? nexusMedia.cover} onError={() => setVideoFailed(true)} src={nexusMedia.video}>
              {nexusMedia.captions && <track kind="captions" src={nexusMedia.captions} srcLang="pt-BR" label="Portugu&ecirc;s" default />}
              Seu navegador n&atilde;o suporta v&iacute;deo.
            </video>
          ) : (
            <div className="demo-pending">
              <span className="demo-pending-mark" aria-hidden="true">N /</span>
              <div><b>{videoFailed ? 'V\u00eddeo indispon\u00edvel no momento' : 'Demonstra\u00e7\u00e3o em prepara\u00e7\u00e3o'}</b><p>O fluxo est&aacute; funcional. {videoFailed ? 'A descri\u00e7\u00e3o do sistema continua dispon\u00edvel abaixo.' : 'A grava\u00e7\u00e3o ser\u00e1 publicada aqui.'}</p></div>
            </div>
          )}
          <p className="case-media-note">Projeto acad&ecirc;mico. C&oacute;digo e documenta&ccedil;&atilde;o interna mantidos privados.</p>
        </div>
      </section>

      <section className="case-section" aria-labelledby="challenge-title">
        <p className="case-index">02 / O desafio</p>
        <div className="case-section-body">
          <h2 id="challenge-title">Mais do que ligar<br />duas telas.</h2>
          <p>Manter desktop e dispositivo alinhados exige mais do que enviar uma mensagem. As altera&ccedil;&otilde;es precisam respeitar o espa&ccedil;o da interface, passar por valida&ccedil;&atilde;o e chegar aos dois lados de forma consistente.</p>
          <p>No Nexus, reuni interface, backend e integra&ccedil;&atilde;o com IA em um mesmo fluxo. A solicita&ccedil;&atilde;o passa por regras do sistema antes de se tornar uma atualiza&ccedil;&atilde;o vis&iacute;vel.</p>
          <div className="case-capture-pair">
            <Capture src={nexusMedia.desktop} alt="Interface desktop do Nexus com uma solicita&ccedil;&atilde;o de demonstra&ccedil;&atilde;o." caption="01 / A solicita&ccedil;&atilde;o no desktop" />
            <Capture src={nexusMedia.device} alt="Interface do dispositivo Nexus ap&oacute;s receber a atualiza&ccedil;&atilde;o." caption="02 / O resultado no dispositivo" />
          </div>
        </div>
      </section>

      <section className="case-section" aria-labelledby="ownership-title">
        <p className="case-index">03 / Minha parte</p>
        <div className="case-section-body">
          <h2 id="ownership-title">Da interface<br />&agrave; &uacute;ltima integra&ccedil;&atilde;o.</h2>
          <p>Fui respons&aacute;vel por todo o desenvolvimento do sistema: as aplica&ccedil;&otilde;es desktop e dispositivo, o backend, a integra&ccedil;&atilde;o com IA e a comunica&ccedil;&atilde;o em tempo real.</p>
          <p>O TCC foi realizado em dupla. Meu parceiro ficou respons&aacute;vel pelo relat&oacute;rio t&eacute;cnico.</p>
          <ul className="case-stack" aria-label="Tecnologias do Nexus">
            {['React', 'TypeScript', 'Python', 'FastAPI', 'Socket.IO', 'Gemini'].map((name) => <li key={name}>{name}</li>)}
          </ul>
        </div>
      </section>

      <section className="case-section" aria-labelledby="decisions-title">
        <p className="case-index">04 / Engenharia</p>
        <div className="case-section-body">
          <h2 id="decisions-title">O que sustenta<br />a experi&ecirc;ncia.</h2>
          <ol className="case-decisions">
            <li>
              <h3><span>01</span> Atualiza&ccedil;&otilde;es sem recarregar</h3>
              <p>Desktop e dispositivo precisam refletir o mesmo estado. O backend distribui atualiza&ccedil;&otilde;es via Socket.IO, sem depender de recarregar as interfaces.</p>
              <p className="case-tradeoff">O cuidado: tratar o estado da conex&atilde;o e a sincroniza&ccedil;&atilde;o entre clientes.</p>
            </li>
            <li>
              <h3><span>02</span> Uma regra para o layout</h3>
              <p>As altera&ccedil;&otilde;es de layout passam por uma camada central de valida&ccedil;&atilde;o. Assim, cada interface n&atilde;o precisa decidir sozinha o que cabe ou pode mudar.</p>
              <p className="case-tradeoff">O cuidado: manter contratos consistentes entre frontend e backend.</p>
            </li>
            <li>
              <h3><span>03</span> IA dentro de limites</h3>
              <p>A integra&ccedil;&atilde;o com Gemini trabalha com a&ccedil;&otilde;es definidas pelo sistema. A avalia&ccedil;&atilde;o de risco determina quando uma altera&ccedil;&atilde;o precisa de revis&atilde;o humana.</p>
              <p className="case-tradeoff">O cuidado: equilibrar automa&ccedil;&atilde;o e controle, sem tratar toda sugest&atilde;o como uma a&ccedil;&atilde;o autorizada.</p>
            </li>
          </ol>
          <Capture src={nexusMedia.detail} alt="Detalhe de uma valida&ccedil;&atilde;o ou confirma&ccedil;&atilde;o no Nexus." caption="03 / Controle das a&ccedil;&otilde;es" />
        </div>
      </section>

      <section className="case-section" aria-labelledby="system-title">
        <p className="case-index">05 / Vis&atilde;o geral</p>
        <div className="case-section-body">
          <h2 id="system-title">Partes diferentes.<br />Um mesmo sistema.</h2>
          <p>Uma representa&ccedil;&atilde;o simplificada do fluxo, sem expor a documenta&ccedil;&atilde;o interna do projeto.</p>
          <ol className="system-diagram" aria-label="Fluxo simplificado do Nexus">
            <li><small>Entrada</small><b>Desktop</b><span>React + TypeScript</span></li>
            <li><small>Coordena&ccedil;&atilde;o</small><b>Backend</b><span>FastAPI + Gemini<br />Valida&ccedil;&atilde;o das a&ccedil;&otilde;es</span></li>
            <li><small>Resposta</small><b>Dispositivo</b><span>React + TypeScript</span></li>
          </ol>
          <p className="system-caption">Comunica&ccedil;&atilde;o entre clientes e backend via Socket.IO.</p>
        </div>
      </section>

      <section className="case-section" aria-labelledby="scope-title">
        <p className="case-index">06 / Contexto</p>
        <div className="case-section-body">
          <h2 id="scope-title">Um projeto acad&ecirc;mico.<br />Uma entrega completa.</h2>
          <p>O fluxo entre desktop, backend e dispositivo est&aacute; funcional. Este case apresenta o desenvolvimento do sistema, n&atilde;o resultados da pesquisa ou uma oferta de produto comercial.</p>
          <p>O reposit&oacute;rio permanece privado para preservar o material interno do TCC. Por isso, a apresenta&ccedil;&atilde;o p&uacute;blica se concentra na experi&ecirc;ncia e nas escolhas de engenharia.</p>
        </div>
      </section>

      <footer className="case-closing">
        <p className="case-kicker">Agora, a sua ideia</p>
        <h2>Vamos construir<br />algo <em>junto</em>?</h2>
        <div className="case-closing-links">
          <a className="case-cta" href={NEXUS_WHATSAPP_URL} target="_blank" rel="noreferrer">Conversar sobre um projeto <span aria-hidden="true">&#8599;</span></a>
          <Link className="case-back" to="/#projetos">Voltar aos projetos <span aria-hidden="true">&#8598;</span></Link>
        </div>
      </footer>
    </main>
  )
}
