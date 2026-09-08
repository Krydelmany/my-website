import { expect, test, type Page } from '@playwright/test'

const opening = '.opening'

async function waitForReady(page: Page) {
  await expect(page.locator(opening)).toHaveAttribute('data-ready', 'true', { timeout: 7_000 })
}

async function expectIntroToPlay(page: Page) {
  const descent = () => page.locator('.intro-curtain').evaluate(
    (element) => new DOMMatrix(getComputedStyle(element).transform).m42,
  )
  const first = await descent()
  await expect.poll(descent).not.toBe(first)
}

test('plays the curtain reveal and naturally exposes the complete hero', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator(opening)).toHaveAttribute('data-ready', 'false')
  await expectIntroToPlay(page)
  await waitForReady(page)

  await expect(page.getByRole('heading', { name: 'Giovani' })).toBeVisible()
  await expect(page.locator('.location-badge')).toContainText('Birigui, São Paulo')
  await expect(page.locator(opening)).not.toContainText(/(?:19|20)\d{2}/)
})

test('skip button exits immediately while fonts are still loading', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'fonts', { value: { ready: new Promise(() => {}) } })
  })
  await page.goto('/')

  await expect(page.locator('.intro-skip')).toBeVisible()
  await page.getByRole('button', { name: /pular abertura/i }).click()
  await waitForReady(page)
  await expect(page.locator('.intro')).toBeHidden()
  await expect(page.getByRole('button', { name: /rever abertura/i })).toBeFocused()
})

test('Escape exits the opening before it completes', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('.intro-skip')).toBeVisible()
  await page.keyboard.press('Escape')
  await waitForReady(page)
  await expect(page.locator('.intro')).toBeHidden()
})

test('replay returns to the intro and can complete repeatedly without page errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await waitForReady(page)

  for (let replay = 0; replay < 2; replay += 1) {
    await page.getByRole('button', { name: /rever abertura/i }).click()
    await expect(page.locator(opening)).toHaveAttribute('data-ready', 'false')
    await expectIntroToPlay(page)
    await waitForReady(page)
  }

  expect(errors).toEqual([])
})

test('reduced motion bypasses the intro and exposes settled content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await waitForReady(page)
  await expect(page.locator('.intro')).toBeHidden()
  await expect(page.locator('.name-glyph').first()).toHaveCSS('transform', 'none')
  await expect(page.locator('.hero-footer')).toBeVisible()
})

test('changing reduced motion interrupts playback and allows a clean replay', async ({ page }) => {
  await page.goto('/')
  await expectIntroToPlay(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await waitForReady(page)
  await expect(page.locator('.hero')).not.toHaveAttribute('inert', '')
  await expect(page.locator('.name-glyph').first()).toHaveCSS('transform', 'none')
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)).toBe(0)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)).toBe(0)
  await page.getByRole('button', { name: /rever abertura/i }).click()
  await expectIntroToPlay(page)
  await waitForReady(page)
})

test('an interrupted replay resets the curtain and intro details on the next run', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Escape')
  await waitForReady(page)

  for (let replay = 0; replay < 2; replay += 1) {
    await page.getByRole('button', { name: /rever abertura/i }).click()
    await expect(page.locator('.intro')).toBeVisible()
    await expect(page.locator('.intro-skip')).toBeVisible()
    await expectIntroToPlay(page)
    if (replay === 1) {
      await expect.poll(() => page.locator('.intro-curtain').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)).toBeGreaterThan(40)
      await page.keyboard.press('Escape')
    } else {
      await page.getByRole('button', { name: /pular abertura/i }).click()
    }
    await waitForReady(page)
  }
})

test('the wide desktop composition stays inside the first screen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 })
  await page.goto('/')
  await page.keyboard.press('Escape')
  await waitForReady(page)
  await expect.poll(() => page.locator('.hero').evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(900)
  await expect(page.getByRole('button', { name: /rever abertura/i })).toBeInViewport()
})

for (const width of [390, 320]) {
  test(`the ${width}px mobile hero is readable without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 })
    await page.goto('/')
    await page.getByRole('button', { name: /pular abertura/i }).click()
    await waitForReady(page)

    await expect(page.locator('.hero-header')).toBeVisible()
    await expect(page.locator('.location-badge')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Giovani' })).toBeVisible()
    await expect(page.locator('.hero-footer')).toBeVisible()
    await expect(async () => {
      const dimensions = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        hero: document.querySelector('.hero')!.getBoundingClientRect(),
      }))
      expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
      expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
      expect(dimensions.hero.top).toBeGreaterThanOrEqual(0)
      expect(dimensions.hero.bottom).toBeLessThanOrEqual(720)
    }).toPass()
  })
}

test('font readiness cannot keep the opening blocked indefinitely', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'fonts', { value: { ready: new Promise(() => {}) } })
  })
  await page.goto('/')

  await waitForReady(page)
  await expect(page.getByRole('heading', { name: 'Giovani' })).toBeVisible()
})

test('failed font requests still produce a usable opening', async ({ page }) => {
  await page.route('**/*.woff2', (route) => route.abort())
  await page.goto('/')
  await waitForReady(page)
  await expect(page.getByRole('heading', { name: 'Giovani' })).toBeInViewport()
  await expect(page.getByRole('button', { name: /rever abertura/i })).toBeEnabled()
})

test('the header keeps the brand lockup and the full-stack note', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  await expect(page.locator('.hero-header .brand')).toContainText('Code by Giovani')
  await expect(page.locator('.brand-drum')).toHaveAttribute('aria-label', 'Giovani Claro Moraes')
  await expect(page.locator('.hero-header .discipline')).toContainText(/Desenvolvedor.*full-stack/)
  await expect.poll(() => page.locator('.hero-header .brand-given').evaluate(
    (element) => getComputedStyle(element).paddingLeft,
  )).not.toBe('0px')
})

test('hovering the discipline trickles tech icons continuously', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const burst = page.locator('.tech-burst')
  const particles = page.locator('.tech-particle')
  const maxPid = () => particles.evaluateAll(
    (elements) => Math.max(...elements.map((element) => Number(element.getAttribute('data-pid')))),
  )
  await burst.hover()
  await expect(burst).toHaveClass(/is-active/)
  await expect(page.locator('.tech-burst-scene').evaluate((scene) => {
    const label = scene.parentElement!.getBoundingClientRect()
    return scene.getBoundingClientRect().bottom <= label.top + 1
  })).resolves.toBe(true)
  await expect(page.locator('.tech-particle').first().evaluate((particle) => {
    const scene = particle.parentElement!.getBoundingClientRect()
    return Number.parseFloat(getComputedStyle(particle).left) > scene.width / 2
  })).resolves.toBe(true)
  await expect.poll(() => particles.count()).toBeGreaterThanOrEqual(2)
  const firstMax = await maxPid()
  await expect.poll(maxPid).toBeGreaterThan(firstMax)

  // Icons are mid-flight, not frozen: their transforms keep changing.
  const snapshot = () => particles.evaluateAll(
    (elements) => elements.map((element) => getComputedStyle(element).transform).join('|'),
  )
  const before = await snapshot()
  await expect.poll(snapshot).not.toBe(before)
})

test('leaving stops emission, in-flight icons drain, and re-hover replays', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const burst = page.locator('.tech-burst')
  const particles = page.locator('.tech-particle')
  await burst.hover()
  await expect.poll(() => particles.count()).toBeGreaterThanOrEqual(2)
  await page.mouse.move(720, 450)
  await expect(burst).not.toHaveClass(/is-active/)
  await expect.poll(() => particles.count()).toBe(0)

  await burst.hover()
  await expect.poll(() => particles.count()).toBeGreaterThanOrEqual(2)
})

test('keyboard focus starts the trickle and blur drains it', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const burst = page.locator('.tech-burst')
  const particles = page.locator('.tech-particle')
  await burst.focus()
  await expect.poll(() => particles.count()).toBeGreaterThanOrEqual(1)
  await burst.blur()
  await expect.poll(() => particles.count()).toBe(0)
})

test('the tech trickle stays off under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await waitForReady(page)

  await page.locator('.tech-burst').hover()
  await page.waitForTimeout(600)
  await expect(page.locator('.tech-particle')).toHaveCount(0)
  await page.locator('.tech-burst').focus()
  await page.waitForTimeout(400)
  await expect(page.locator('.tech-particle')).toHaveCount(0)
})

test('the technology burst remains bounded on a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  await page.getByRole('button', { name: /pular abertura/i }).click()
  await waitForReady(page)

  await page.locator('.tech-burst').hover()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('replay re-locks scroll and interaction until it finishes', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await page.locator('#servicos-title').scrollIntoViewIfNeeded()

  await page.getByRole('button', { name: /rever abertura/i }).click()
  await expect(page.locator(opening)).toHaveAttribute('data-ready', 'false')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await expect.poll(() => page.evaluate(
    () => document.querySelector('#servicos')!.parentElement!.inert,
  )).toBe(true)

  await page.mouse.wheel(0, 600)
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)

  await waitForReady(page)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
  await expect.poll(() => page.evaluate(
    () => !document.querySelector('#servicos')!.parentElement!.inert,
  )).toBe(true)
})

test('enabling reduced motion mid-play settles the whole site', async ({ page }) => {
  await page.goto('/')
  await expectIntroToPlay(page)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await waitForReady(page)
  await expect(page.locator('.hero')).not.toHaveAttribute('inert', '')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
  await expect.poll(() => page.evaluate(
    () => !document.querySelector('#servicos')!.parentElement!.inert,
  )).toBe(true)
  await expect(page.getByRole('heading', { name: 'Giovani' })).toBeVisible()
})

test('the hero continue link scrolls to the services section', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  await page.getByRole('link', { name: /o que posso construir/i }).click()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200)
  await expect(page.locator('#servicos-title')).toBeInViewport()
})

test('reloading restarts from the top with the opening', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await page.locator('#servicos-title').scrollIntoViewIfNeeded()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200)

  await page.reload()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await waitForReady(page)
  await expect(page.getByRole('heading', { name: 'Giovani' })).toBeInViewport()
})

test('hovering the brand reveals the full name with the Code by slide', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const copy = page.locator('.brand-copy')
  const surname = page.locator('.brand-surname')
  await expect.poll(() => surname.evaluate((element) => {
    const { right } = element.getBoundingClientRect()
    return right > element.parentElement!.parentElement!.getBoundingClientRect().right
  })).toBe(true)

  await page.locator('.brand-drum').hover()
  await expect(page.locator('.brand-code')).toHaveCSS('transform', /matrix\(1, [\d.e-]+, -[\d.e-]+, 1, -/)
  await expect.poll(() => surname.evaluate((element) => {
    const { right } = element.getBoundingClientRect()
    return right <= element.parentElement!.parentElement!.getBoundingClientRect().right
  })).toBe(true)

  await page.mouse.move(720, 450)
  await expect(copy).toBeVisible()
})

test('keyboard focus reveals the full name on the brand', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  await page.locator('.brand-drum').focus()
  await expect(page.locator('.brand-code')).toHaveCSS('transform', /matrix\(1, [\d.e-]+, -[\d.e-]+, 1, -/)
})

test('hovering the brand spins the copyright mark a full turn', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const mark = page.locator('.copyright')
  await page.locator('.brand-drum').hover()
  await expect.poll(() => mark.evaluate(
    (element) => getComputedStyle(element).transform,
  )).not.toMatch(/^matrix\(1, [\d.e-]+, -[\d.e-]+, 1, 0, 0\)$/)
})

test('the copyright mark stays still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await waitForReady(page)

  await page.locator('.brand-drum').hover()
  await expect(page.locator('.copyright')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
})

test('the location globe uses the reference sphere structure and motion', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const wrap = page.locator('.location-globe .globe-wrap')
  await expect(page.locator('.location-globe .circle')).toHaveCount(3)
  await expect(page.locator('.location-globe .circle-hor')).toHaveCount(1)
  await expect(page.locator('.location-globe .circle-hor-middle')).toHaveCount(1)
  await expect(page.locator('.location-globe .globe')).toHaveCSS('width', '38px')
  await expect(wrap).toHaveCSS('animation-name', 'location-globe-sway')
  await expect(page.locator('.location-globe .circle').first().evaluate((element) => {
    const effect = element.getAnimations()[0]?.effect as KeyframeEffect | null
    const keyframes = effect?.getKeyframes() ?? []
    return {
      centerShadow: keyframes.find((frame) => frame.offset === 0.5)?.boxShadow ?? null,
      transitionWidths: [0.49, 0.51].map(
        (offset) => keyframes.find((frame) => frame.offset === offset)?.width ?? null,
      ),
    }
  })).resolves.toEqual({ centerShadow: null, transitionWidths: [null, null] })
  const before = await wrap.evaluate((element) => getComputedStyle(element).transform)
  await expect.poll(async () => {
    const after = await wrap.evaluate((element) => getComputedStyle(element).transform)
    return after !== before
  }).toBe(true)
})

test('the location globe stays still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await waitForReady(page)

  const wrap = page.locator('.location-globe .globe-wrap')
  const circle = page.locator('.location-globe .circle').first()
  const before = await circle.evaluate((element) => getComputedStyle(element).width)
  await page.waitForTimeout(800)
  await expect(wrap).toHaveCSS('animation-name', 'none')
  await expect(circle).toHaveCSS('width', before)
})

test('the home cannot be text-selected', async ({ page }) => {  await page.goto('/')
  await waitForReady(page)

  await expect.poll(() => page.locator('.hero-name').evaluate(
    (element) => getComputedStyle(element).userSelect,
  )).toBe('none')
  await expect.poll(() => page.locator('.hero').evaluate(
    (element) => getComputedStyle(element).userSelect,
  )).toBe('none')
})
