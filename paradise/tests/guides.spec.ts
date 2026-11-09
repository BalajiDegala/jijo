import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import type { Guide } from '../src/types'
import catalog from '../src/guides.json' with { type: 'json' }
import wordingEdits from '../scripts/website-wording.json' with { type: 'json' }

const guides: Guide[] = Object.values(catalog).map((subject) =>
  JSON.parse(readFileSync(`public/content/${subject.output}`, 'utf8')),
)
const bannedWording = /interview|question|quetion/i

test('CI/CD publishes all 110 complete topics with only the four wording edits', async ({
  request,
}) => {
  const original = readFileSync(
    'docs/mdfiles/CICD_Pipelines_Interview_Preparation_Guide.md',
    'utf8',
  )
  const response = await request.get('/content/cicd.json')
  expect(response.ok()).toBe(true)
  const guide: Guide = await response.json()
  expect(guide.id).toBe('cicd')
  expect(guide.questions).toHaveLength(110)
  expect(guide.sourceHash).toBe(createHash('sha256').update(original).digest('hex'))
  expect(guide.questions.map((topic) => topic.number)).toEqual(
    Array.from({ length: 110 }, (_, i) => i + 1),
  )
  const normalized = original.replaceAll('\r\n', '\n')
  const expected = normalized
    .slice(normalized.indexOf('### Q1:'), normalized.indexOf('## Interview Tips'))
    .replace(/^## Section .+$/gm, '')
    .replace('The interview-winning detail:', 'The key detail:')
    .replace('For interviews:', 'In practice:')
    .replace('Why this matters for interviews:', 'Why this matters in practice:')
    .replace('advanced questions', 'advanced topics')
    .trim()
    .replace(/\n{3,}/g, '\n\n')
  expect(
    guide.questions
      .map((topic) => `### Q${topic.number}: ${topic.title}\n\n${topic.markdown}`)
      .join('\n\n'),
  ).toBe(expected)
  for (const published of guides)
    expect(JSON.stringify(published.questions)).not.toMatch(bannedWording)
  expect(await (await request.get('/manifest.webmanifest')).text()).not.toMatch(bannedWording)
})

for (const guide of guides) {
  const total = guide.questions.length
  const jumpTarget = Math.min(100, total)
  test(`${guide.title}: all source topics are complete and in order`, async ({ request }) => {
    const original = readFileSync(`docs/mdfiles/${catalog[guide.id].source}`, 'utf8')
    const response = await request.get(`/content/${catalog[guide.id].output}`)
    expect(response.ok()).toBe(true)
    const published: Guide = await response.json()
    expect(published.id).toBe(guide.id)
    expect(published.questions).toHaveLength(catalog[guide.id].topics)
    expect(published.sourceHash).toBe(createHash('sha256').update(original).digest('hex'))
    expect(published.questions.map((topic) => topic.number)).toEqual(
      Array.from({ length: total }, (_, i) => i + 1),
    )
    const normalized = original.replaceAll('\r\n', '\n')
    const sourceBody = normalized
      .slice(normalized.indexOf('### Q1:'), normalized.indexOf('## Interview Tips'))
      .replace(/^## Section .+$/gm, '')
      .trim()
      .replace(/\n{3,}/g, '\n\n')
    const expected = wordingEdits.reduce(
      (text, [before, after]) => text.replaceAll(before, after),
      sourceBody,
    )
    expect(
      published.questions
        .map((topic) => `### Q${topic.number}: ${topic.title}\n\n${topic.markdown}`)
        .join('\n\n'),
    ).toBe(expected)
    expect(JSON.stringify(published.questions)).not.toMatch(bannedWording)
  })

  test(`${guide.title}: direct jump, slider, and reload`, async ({ page }) => {
    await page.goto(`/#/guide/${guide.id}/1`)
    const heading = page.getByRole('heading', { level: 1 })
    const number = page.getByRole('spinbutton', { name: 'Jump to topic' })
    const slider = page.getByRole('slider', { name: 'Browse topics' })
    await expect(heading).toHaveText(guide.questions[0].title)
    await number.fill(String(jumpTarget))
    await number.press('Enter')
    await expect(heading).toHaveText(guide.questions[jumpTarget - 1].title)
    await expect(slider).toHaveValue(String(jumpTarget))
    await expect(page).toHaveURL(new RegExp(`#/guide/${guide.id}/${jumpTarget}$`))
    await page.reload()
    await expect(heading).toHaveText(guide.questions[jumpTarget - 1].title)
    await slider.focus()
    await slider.press('End')
    await expect(heading).toHaveText(guide.questions[total - 1].title)
    await expect(number).toHaveValue(String(total))
    await expect(page.getByRole('button', { name: 'Next topic' })).toBeDisabled()
    await slider.press('Home')
    await expect(heading).toHaveText(guide.questions[0].title)
    await slider.press('ArrowRight')
    await expect(heading).toHaveText(guide.questions[1].title)
    await expect(number).toHaveValue('2')
    // Clicking the track jumps across the guide without repeated next actions.
    const box = (await slider.boundingBox())!
    await slider.click({ position: { x: box.width * 0.8, y: box.height / 2 } })
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(total * 0.6)
    await number.fill('999')
    await number.press('Enter')
    await expect(heading).toHaveText(guide.questions[total - 1].title)
    await number.fill('0')
    await number.press('Enter')
    await expect(heading).toHaveText(guide.questions[0].title)
    await number.fill('')
    await number.press('Tab')
    await expect(number).toHaveValue('1')
  })

  test(`${guide.title}: neutral wording and controls fit small screens`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    const longest = guide.questions.reduce((a, b) =>
      a.title.length > b.title.length ? a : b,
    ).number
    for (const n of new Set([1, 9, 12, 20, 21, jumpTarget, longest, total])) {
      await page.goto(`/#/guide/${guide.id}/${n}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[n - 1].title)
      expect(await page.locator('body').innerText()).not.toMatch(bannedWording)
      expect(await page.locator('body').ariaSnapshot()).not.toMatch(bannedWording)
      expect(await page.title()).not.toMatch(bannedWording)
      expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toMatch(
        bannedWording,
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await expect(page.getByRole('slider')).toBeInViewport()
      await expect(page.getByRole('combobox', { name: 'Subject', exact: true })).toBeInViewport()
      await expect(page.getByRole('button', { name: 'Next topic' })).toBeInViewport()
      expect(
        await page
          .locator('.reel[aria-hidden="false"] .answer-scroll')
          .evaluate((el) => el.clientHeight),
      ).toBeGreaterThan(60)
    }
    const beforeRotation = await page.getByRole('heading', { level: 1 }).innerText()
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(beforeRotation)
    await expect(page.getByRole('slider')).toBeInViewport()
  })
}

test('guide switching and browser history retain the correct guide and topic', async ({ page }) => {
  await page.goto('/#/guide/kubernetes/100')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[0].questions[99].title)
  await page.getByRole('combobox', { name: 'Subject', exact: true }).selectOption('cicd')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[1].questions[0].title)
  await expect(page.getByRole('combobox', { name: 'Subject', exact: true })).toHaveValue('cicd')
  await page.getByRole('spinbutton').fill('100')
  await page.getByRole('spinbutton').press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[1].questions[99].title)
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[0].questions[99].title)
  await page.goForward()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[1].questions[99].title)
})

test('the subject selector opens all seven guides with the correct topic counts', async ({
  page,
}) => {
  await page.goto('/')
  const selector = page.getByRole('combobox', { name: 'Subject', exact: true })
  await expect(selector.locator('option')).toHaveCount(7)
  expect(guides.reduce((sum, guide) => sum + guide.questions.length, 0)).toBe(719)
  for (const guide of guides) {
    await selector.selectOption(guide.id)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
    await expect(page).toHaveURL(new RegExp(`#/guide/${guide.id}/1$`))
    await expect(page.getByRole('slider')).toHaveAttribute('max', String(guide.questions.length))
    await expect(page).toHaveTitle(`brocode · ${guide.title} guide`)
  }
})

test.describe('CI/CD loading recovery', () => {
  test.use({ serviceWorkers: 'block' })
  test('can switch away from a failed guide and retry the correct guide', async ({ page }) => {
    await page.route('**/content/cicd.json', (route) =>
      route.fulfill({ status: 503, body: 'Unavailable' }),
    )
    await page.goto('/#/guide/cicd/100')
    await expect(page.getByRole('alert')).toContainText('Couldn’t open the guide')
    await page.getByRole('combobox', { name: 'Subject', exact: true }).selectOption('kubernetes')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[0].questions[0].title)
    await page.getByRole('combobox', { name: 'Subject', exact: true }).selectOption('cicd')
    await expect(page.getByRole('alert')).toContainText('Couldn’t open the guide')
    await page.unroute('**/content/cicd.json')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guides[1].questions[0].title)
  })
})
