import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import catalog from '../src/guides.json' with { type: 'json' }

test('the question, long answer, table and navigation are accessible', async ({ page }) => {
  test.setTimeout(60000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of ['q/71', 'q/81', ...Object.keys(catalog).map((id) => `guide/${id}/1`)]) {
    await page.goto(`/#/${route}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()
    expect(result.violations).toEqual([])
  }
})
