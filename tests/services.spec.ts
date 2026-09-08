import { expect, test, type Page } from '@playwright/test'

async function enterSite(page: Page) {
  await page.goto('/')
  await page.keyboard.press('Escape')
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'true', { timeout: 7_000 })
}

async function openServices(page: Page) {
  await enterSite(page)
  await page.locator('#servicos-title').scrollIntoViewIfNeeded()
  await expect(page.locator('#servicos-title')).toBeVisible()
}

test('shows the manifesto, four offers, four process steps and the CTA', async ({ page }) => {
  await openServices(page)

  await expect(page.locator('#servicos .section-label')).toContainText('Serviços')
  await expect(page.locator('#servicos-title')).toContainText('Produto completo')
  await expect(page.locator('.services-sub')).toContainText('full-stack')
  await expect(page.locator('.offer')).toHaveCount(4)
  await expect(page.locator('.process-head')).toContainText('Como trabalho')
  await expect(page.locator('.process-step')).toHaveCount(4)
  await expect(page.getByRole('link', { name: /agendar conversa/i })).toBeVisible()
})

test('reveals the manifesto title lines fully (no clipped mask deadlock)', async ({ page }) => {
  await openServices(page)

  await expect.poll(() => page.locator('.title-inner').first().evaluate(
    (element) => new DOMMatrix(getComputedStyle(element).transform).m42,
  )).toBeLessThan(1)
  await expect(page.locator('#servicos-title')).toBeVisible()
})

test('reveals offers progressively while scrolling', async ({ page }) => {
  await enterSite(page)

  const lastOffer = page.locator('.offer').last()
  await expect(async () => {
    expect(await lastOffer.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeLessThan(1)
  }).toPass()
  await lastOffer.scrollIntoViewIfNeeded()
  await expect(async () => {
    expect(await lastOffer.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity))).toBeGreaterThan(0.95)
  }).toPass()
})

test('locks scrolling during the intro and releases it after', async ({ page }) => {
  await page.goto('/')

  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'true', { timeout: 7_000 })
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('CTA is reachable by keyboard and opens WhatsApp in a new tab', async ({ page }) => {
  await openServices(page)

  const cta = page.getByRole('link', { name: /agendar conversa/i })
  await expect(cta).toHaveAttribute('href', /wa\.me\/5518991150229/)
  await expect(cta).toHaveAttribute('target', '_blank')
  await cta.focus()
  await expect(cta).toBeFocused()

  const urlBefore = page.url()
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    cta.click(),
  ])
  expect(popup.url()).toContain('phone=5518991150229')
  expect(page.url()).toBe(urlBefore)
})

test('reduced motion keeps the services readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('.opening')).toHaveAttribute('data-ready', 'true', { timeout: 7_000 })

  await page.locator('#servicos-title').scrollIntoViewIfNeeded()
  await expect(page.locator('#servicos-title')).toBeVisible()
  await expect(page.locator('.offer').first()).toBeVisible()
  await expect(page.getByRole('link', { name: /agendar conversa/i })).toBeVisible()
})

test('the 390px services layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openServices(page)

  await page.locator('.cta-row').scrollIntoViewIfNeeded()
  await expect(async () => {
    const dimensions = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }))
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
  }).toPass()
})
