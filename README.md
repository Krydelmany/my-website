# Giovani

Personal portfolio, built one section at a time. The current stage contains the
opening, the first screen, the Serviços / Manifesto section,
and an editorial project list with a dedicated Nexus case study.

## Run

```sh
npm ci
npm run dev
```

## Validate

```sh
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright starts its own local server on port 4173. Browser regression tests cover
the opening, skip/replay, reduced motion, font failures, responsive layouts, the
services section reveals, scroll lock, reload behavior, home non-selection,
the WhatsApp CTA, project previews, route history/focus, and optional case media.

## Opening

- React 19, TypeScript, Vite, and Tailwind CSS 4.
- Motion 13 coordinates one overlapping timeline, with a curved descending curtain,
  staggered letter reveals, variable font weights, and small magnetic interactions.
- Inter and Inter Tight are self-hosted through Fontsource. No font CDN is needed.
- Lenis handles scrolling across the site and is stopped during the intro/replay.
- Opening timing lives in `src/components/Opening.tsx`; the visual system and
  responsive rules are in `src/index.css`.
- The opening can be skipped with the visible button or Escape, and replayed from
  the footer. Replaying re-locks scrolling (Lenis stop plus body lock), returns
  to the top, and keeps Services and Projects inert until it settles. System reduced-motion
  preferences bypass it, including live changes mid-play.
- The hero footer carries a "O que posso construir" link that smooth-scrolls to
  the services section through the Lenis instance.

Identity: Giovani Claro Moraes (hero shows "Giovani."; the header brand reads
"© Code by Giovani" and slides to the full name on hover or keyboard focus,
while the © completes a 360-degree turn). Location: Birigui, Sao Paulo. Warm paper, near-black ink, and a
red accent. The signature has no year. Previous starfield, audio, and placeholder
portfolio sections were removed as part of the approved restart.

## Projects And Navigation

- `/`: opening, services and the Nexus project row (`#projetos`).
- `/projetos/nexus`: public case study, with role, engineering decisions, credits
  and a WhatsApp contact link. The repository remains private.
- Client navigation uses React Router. Returning from a case does not replay the
  opening. Back/forward restores scroll; the return link focuses the project row.
- A fresh load of `/` still plays the opening; loading or reloading a case opens
  that case directly. Unknown routes display a not-found page.
- Desktop hover shows a bounded, spring-following preview; keyboard focus shows
  a stationary preview. Small/touch screens and reduced motion use inline art.
- Case content is readable without waiting for a scroll reveal.

## Nexus Media

Media has not been supplied yet. A clearly labeled conceptual illustration is
used instead of fabricated screenshots. There is no fake play button or request
for missing files. Optional screenshots are omitted until configured.

The asset map is in `src/data/nexus.ts`. See `public/projects/nexus/README.md`
for filenames, placement and capture guidance. Video uses native controls,
`preload="none"`, and no autoplay. Narrated videos need captions and an accessible
description of the demonstrated actions.

## Hosting

Build output is in `dist/`. The static host must serve `index.html` for client
routes such as `/projetos/nexus` (SPA history fallback), while serving existing
assets normally. Vite's local servers already do this. Configure the equivalent
rewrite on the chosen host before deploying; otherwise direct case URLs may 404.
