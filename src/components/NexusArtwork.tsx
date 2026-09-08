import { useState } from 'react'

export function NexusArtwork({ className = '', imageSrc }: { className?: string; imageSrc?: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const hasImage = imageSrc && failedSrc !== imageSrc

  return (
    <figure className={`nexus-artwork ${className}`}>
      {hasImage ? (
        <img src={imageSrc} alt="Desktop e dispositivo do Nexus." width="1000" height="560" onError={() => setFailedSrc(imageSrc)} />
      ) : (
        <svg className="nexus-artwork-canvas" viewBox="0 0 1000 560" role="img" aria-label="Esquema conceitual de um desktop e um dispositivo conectados pelo Nexus. N&atilde;o representa uma captura de tela.">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path className="art-grid" d="M0 140h1000M0 280h1000M0 420h1000M200 0v560M400 0v560M600 0v560M800 0v560" />
            <ellipse className="art-orbit" cx="500" cy="280" rx="350" ry="180" transform="rotate(-18 500 280)" />
            <ellipse className="art-orbit" cx="500" cy="280" rx="280" ry="220" transform="rotate(24 500 280)" />
            <path className="art-signal" d="M250 285C350 110 650 460 750 275" />
          </g>
          <g className="art-terminal">
            <rect x="115" y="163" width="315" height="205" rx="6" />
            <path d="M245 368v22m-42 0h85M130 184h283" />
            <circle cx="140" cy="175" r="2" /><circle cx="150" cy="175" r="2" />
            <text x="146" y="229" className="art-small">01 / DESKTOP</text>
            <text x="144" y="310" className="art-word">Nexus</text>
            <path className="art-rule" d="M147 335h80m10 0h32" />
          </g>
          <g className="art-terminal">
            <rect x="599" y="230" width="280" height="175" rx="12" />
            <rect x="613" y="245" width="252" height="145" rx="3" />
            <text x="633" y="278" className="art-small">02 / DISPOSITIVO</text>
            <path className="art-rule" d="M634 315h154m-154 18h88m-88 18h126" />
            <circle cx="832" cy="363" r="5" className="art-dot" />
          </g>
          <circle cx="500" cy="280" r="24" className="art-hub" />
          <path d="M490 280h20m-10-10v20" className="art-hub-mark" />
          <text x="48" y="54" className="art-caption">N / SISTEMA CONECTADO</text>
          <text x="48" y="520" className="art-caption">INTERFACE &#183; BACKEND &#183; DISPOSITIVO</text>
          <text x="950" y="54" textAnchor="end" className="art-caption">NEXUS</text>
        </svg>
      )}
      <figcaption>{hasImage ? 'Nexus / Desktop e dispositivo' : 'Ilustra\u00e7\u00e3o conceitual / N\u00e3o representa a interface do produto'}</figcaption>
    </figure>
  )
}
