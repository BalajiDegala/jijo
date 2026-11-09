import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { startStaticServer } from './static-server'

const themes = [
  { id: 'light', label: 'Light', color: '#f7f7f2' },
  { id: 'dark', label: 'Dark', color: '#141d22' },
  { id: 'pink', label: 'Pink', color: '#f9edf2' },
  { id: 'handwritten', label: 'Handwritten', color: '#eee8db' },
]

for (const theme of themes) {
  test(`${theme.label}: choose, keep the current topic, and remember after reload`, async ({
    page,
  }) => {
    await page.goto('/#/guide/cicd/100')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('Coordinated deployment to 50 microservices')
    await page.getByRole('button', { name: 'Reading themes', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('radio', { name: theme.label, exact: true }).check()
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id)
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', theme.color)
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Reading themes', exact: true })).toBeFocused()
    await expect(heading).toContainText('Coordinated deployment to 50 microservices')
    await expect(page).toHaveURL(/#\/guide\/cicd\/100$/)
    await page.getByRole('combobox', { name: 'Subject' }).selectOption('terraform')
    await expect(heading).toContainText('What is Terraform')
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id)
    await page.reload()
    await expect(heading).toContainText('What is Terraform')
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id)
    await page.getByRole('button', { name: 'Reading themes', exact: true }).click()
    await expect(page.getByRole('radio', { name: theme.label, exact: true })).toBeChecked()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test(`${theme.label}: accessible reader, theme picker, and small-screen layout`, async ({
    page,
  }) => {
    test.setTimeout(60000)
    await page.addInitScript(
      (themeId) => localStorage.setItem('brocode-theme-v1', themeId),
      theme.id,
    )
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/#/guide/terraform/89')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Using for_each on EC2 instances',
    )
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('button', { name: 'Reading themes', exact: true })).toBeInViewport()
    await expect(page.getByRole('combobox', { name: 'Subject' })).toBeInViewport()
    await expect(page.getByRole('slider')).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(
      await page
        .locator('.reel[aria-hidden="false"] .answer-scroll')
        .evaluate((el) => el.clientHeight),
    ).toBeGreaterThan(60)
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([])
    await page.getByRole('button', { name: 'Reading themes', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([])
    await page.getByRole('button', { name: 'Done', exact: true }).click()
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Using for_each on EC2 instances',
    )
    await expect(page.getByRole('slider')).toBeInViewport()
  })
}

test('theme selection still works when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError')
      },
    })
  })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('button', { name: 'Reading themes', exact: true }).click()
  await page.getByRole('radio', { name: 'Dark', exact: true }).check()
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(errors).toEqual([])
})

test('handwriting fonts and every theme work after the server disconnects', async ({
  page,
  context,
  browserName,
}) => {
  const server = await startStaticServer()
  try {
    await page.goto(server.url)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (!navigator.serviceWorker.controller)
        await new Promise<void>((resolve) =>
          navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
            once: true,
          }),
        )
    })
    await server.close()
    if (browserName !== 'webkit') await context.setOffline(true)
    for (const theme of themes) {
      await page.getByRole('button', { name: 'Reading themes', exact: true }).click()
      await page.getByRole('radio', { name: theme.label, exact: true }).check()
      await page.getByRole('button', { name: 'Done', exact: true }).click()
      await page.reload()
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme.id)
    }
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.fonts.check('700 24px Kalam'))).toBe(true)
    expect(
      await page
        .getByRole('heading', { level: 1 })
        .evaluate((el) => getComputedStyle(el).fontFamily),
    ).toContain('Kalam')
  } finally {
    await server.close()
  }
})
