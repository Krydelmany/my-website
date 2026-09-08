import { expect, test, type Page } from '@playwright/test'

async function openProjects(page: Page) {
  await page.goto('/')
  const skip = page.getByRole('button', { name: /pular abertura/i })
  if (await skip.isVisible()) await skip.click()
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'true', { timeout: 7000 })
  await page.locator('#nexus-project-link').scrollIntoViewIfNeeded()
}

test('one real project links to its case without a document reload', async ({ page }) => {
  const documents: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documents.push(request.url())
  })
  await openProjects(page)
  await expect(page.locator('.project-list > li')).toHaveCount(1)
  await expect(page.locator('#projetos .section-label')).toContainText('02')
  await page.getByRole('link', { name: 'Nexus: conhecer o projeto' }).click()
  await expect(page).toHaveURL(/\/projetos\/nexus$/)
  await expect(page.locator('#case-title')).toBeFocused()
  await expect(page).toHaveTitle('Nexus | Giovani Claro Moraes')
  await expect(page.locator('.opening')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
  expect(documents).toHaveLength(1)
})

test('case supports direct entry, reload and honest pending media', async ({ page }) => {
  const errors: string[] = []
  const mediaRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => { if (/\/projects\/nexus\//.test(request.url())) mediaRequests.push(request.url()) })
  await page.goto('/projetos/nexus')
  await expect(page.locator('#case-title')).toBeVisible()
  await expect(page.locator('.case-cover figcaption')).toContainText('Ilustra\u00e7\u00e3o conceitual')
  await expect(page.locator('.demo-pending')).toContainText('Demonstra\u00e7\u00e3o em prepara\u00e7\u00e3o')
  await expect(page.locator('.case-section')).toContainText([
    /O fluxo est/, /Manter desktop/, /todo o desenvolvimento/, /Socket.IO/, /simplificada/, /privado/,
  ])
  await expect(page.locator('video')).toHaveCount(0)
  await expect(page.locator('a[href*="github.com"]')).toHaveCount(0)
  await expect(page.locator('.case-cta')).toHaveAttribute('href', /wa\.me\/5518991150229/)
  await expect(page.locator('.case-cta')).toHaveAttribute('target', '_blank')
  await page.reload()
  await expect(page.locator('#case-title')).toBeFocused()
  await expect(page.locator('.intro')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  expect(errors).toEqual([])
  expect(mediaRequests).toEqual([])
})

test('return link restores projects and focus without replaying the intro', async ({ page }) => {
  await page.goto('/projetos/nexus')
  await page.getByRole('link', { name: 'Voltar aos projetos', exact: true }).first().click()
  await expect(page).toHaveURL(/\/#projetos$/)
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.intro')).toBeHidden()
  await expect(page.locator('#nexus-project-link')).toBeFocused()
  await expect(page.locator('#projetos-title')).toBeInViewport()
  await expect(page).toHaveTitle('Giovani Claro Moraes')
})

test('browser back and forward restore the correct route and scroll', async ({ page }) => {
  await openProjects(page)
  const position = await page.evaluate(() => scrollY)
  await page.locator('#nexus-project-link').click()
  await expect(page.locator('#case-title')).toBeVisible()
  await page.goBack()
  await expect(page.locator('.intro')).toBeHidden()
  await expect(page.locator('#nexus-project-link')).toBeFocused()
  await expect.poll(() => page.evaluate((y) => Math.abs(scrollY - y), position)).toBeLessThan(4)
  await page.goForward()
  await expect(page.locator('#case-title')).toBeFocused()
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
})

test('reloading home from the projects anchor still restarts the opening at the top', async ({ page }) => {
  await page.goto('/projetos/nexus')
  await page.getByRole('link', { name: 'Voltar aos projetos', exact: true }).first().click()
  await expect(page.locator('#projetos-title')).toBeInViewport()
  await page.reload()
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'false')
  await page.keyboard.press('Escape')
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'true')
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0)
  await expect(page.getByRole('heading', { name: 'Giovani', exact: true })).toBeInViewport()
})

test('preview follows the cursor, stays bounded, and hides on leave', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openProjects(page)
  const link = page.locator('#nexus-project-link')
  const preview = page.locator('.project-cursor-preview')
  await link.hover({ position: { x: 380, y: 90 } })
  await expect(preview).toHaveAttribute('data-active', 'true')
  await expect(preview).toHaveCSS('opacity', '1')
  const before = await preview.evaluate((element) => getComputedStyle(element).transform)
  await link.hover({ position: { x: 760, y: 140 } })
  await expect.poll(() => preview.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before)
  await expect(async () => {
    const rect = await preview.boundingBox()
    expect(rect).not.toBeNull()
    expect(rect!.x).toBeGreaterThanOrEqual(0)
    expect(rect!.y).toBeGreaterThanOrEqual(0)
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(1440)
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(900)
  }).toPass()
  await page.mouse.move(0, 0)
  await expect(preview).toHaveAttribute('data-active', 'false')
})

test('keyboard opens the case and reduced motion uses an inline preview', async ({ page }) => {
  await openProjects(page)
  await page.keyboard.press('Tab')
  await page.locator('#nexus-project-link').focus()
  await expect(page.locator('.project-cursor-preview')).toHaveAttribute('data-active', 'true')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.project-cursor-preview')).toBeHidden()
  await expect(page.locator('.project-inline-art')).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.locator('#case-title')).toBeFocused()
  await expect(page.locator('.nexus-case')).toBeVisible()
})

test('opening replay makes the project link inert too', async ({ page }) => {
  await openProjects(page)
  await page.getByRole('button', { name: /rever abertura/i }).click()
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'false')
  await expect.poll(() => page.locator('#nexus-project-link').evaluate((element) => element.closest('[inert]') !== null)).toBe(true)
  await page.keyboard.press('Escape')
  await expect.poll(() => page.locator('#nexus-project-link').evaluate((element) => element.closest('[inert]') !== null)).toBe(false)
})

for (const width of [320, 390]) {
  test(`project and case remain readable at ${width}px without hover`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await openProjects(page)
    await expect(page.locator('.project-inline-art')).toBeVisible()
    await expect(page.locator('.project-cursor-preview')).toBeHidden()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.locator('#nexus-project-link').click()
    await expect(page.locator('#case-title')).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.locator('.case-cta').scrollIntoViewIfNeeded()
    await expect(page.locator('.case-cta')).toBeInViewport()
  })
}

test('unknown routes show a useful not-found page', async ({ page }) => {
  await page.goto('/projetos/nao-existe')
  await expect(page.locator('#not-found-title')).toBeFocused()
  await expect(page.locator('.not-found a')).toHaveAttribute('href', '/')
  await expect(page.locator('.intro')).toHaveCount(0)
})

test('supplied media enables a manual video and contextual captures', async ({ page }) => {
  await page.route('**/src/data/nexus.ts*', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `export const nexusMedia = { video: '/projects/nexus/demo.mp4', captions: '/projects/nexus/captions.vtt', desktop: '/projects/nexus/desktop.webp', device: '/projects/nexus/device.webp' }; export const NEXUS_WHATSAPP_URL = 'https://wa.me/5518991150229';`,
  }))
  await page.route('**/projects/nexus/*.webp', (route) => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64'),
  }))
  await page.route('**/projects/nexus/captions.vtt', (route) => route.fulfill({ contentType: 'text/vtt', body: 'WEBVTT\n\n' }))
  const videos: string[] = []
  page.on('request', (request) => { if (request.url().endsWith('demo.mp4')) videos.push(request.url()) })
  await page.goto('/projetos/nexus')
  const video = page.locator('video')
  await expect(video).toHaveAttribute('controls', '')
  await expect(video).toHaveAttribute('playsinline', '')
  await expect(video).toHaveAttribute('preload', 'none')
  await expect(video).not.toHaveAttribute('autoplay')
  await expect(video.locator('track')).toHaveAttribute('srclang', 'pt-BR')
  await expect(page.locator('.case-capture')).toHaveCount(2)
  await expect(page.locator('.demo-pending')).toHaveCount(0)
  expect(videos).toEqual([])
})

test('invalid configured images fall back without broken image elements', async ({ page }) => {
  await page.route('**/src/data/nexus.ts*', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `export const nexusMedia = { cover: '/projects/nexus/missing.webp', desktop: '/projects/nexus/missing.webp' }; export const NEXUS_WHATSAPP_URL = 'https://wa.me/5518991150229';`,
  }))
  await page.route('**/projects/nexus/missing.webp', (route) => route.fulfill({ status: 404, body: '' }))
  await page.goto('/projetos/nexus')
  await expect(page.locator('.case-cover svg')).toBeVisible()
  await page.locator('.case-capture').scrollIntoViewIfNeeded()
  await expect(page.locator('.media-unavailable')).toBeVisible()
  await expect(page.locator('.case-cover img, .case-capture img')).toHaveCount(0)
})
