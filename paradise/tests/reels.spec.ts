import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { startStaticServer } from './static-server'
import type { Guide } from '../src/types'
import catalog from '../src/guides.json' with { type: 'json' }

const original = readFileSync('docs/mdfiles/Kubernetes_Interview_Preparation_Guide.md', 'utf8')
const guide: Guide = JSON.parse(readFileSync('public/content/feed.json', 'utf8'))
const additionalGuides: Guide[] = Object.entries(catalog)
  .filter(([id]) => id !== 'kubernetes')
  .map(([, subject]) => JSON.parse(readFileSync(`public/content/${subject.output}`, 'utf8')))
const current = (page: Page) => page.locator('.reel[aria-hidden="false"]')

test('all 110 questions preserve the complete source wording and order', async ({ request }) => {
  const response = await request.get('/content/feed.json')
  expect(response.ok()).toBe(true)
  const feed: Guide = await response.json()
  expect(feed.questions).toHaveLength(110)
  expect(feed.sourceHash).toBe(createHash('sha256').update(original).digest('hex'))
  expect(feed.questions.map((q) => q.number)).toEqual(Array.from({ length: 110 }, (_, i) => i + 1))
  const normalized = original.replaceAll('\r\n', '\n')
  const sourceQuestions = normalized
    .slice(normalized.indexOf('### Q1:'), normalized.indexOf('## Interview Tips'))
    .replace(/^## Section .+$/gm, '')
    .trim()
    .replace(/\n{3,}/g, '\n\n')
  const reassembled = feed.questions
    .map((q) => `### Q${q.number}: ${q.title}\n\n${q.markdown}`)
    .join('\n\n')
  expect(reassembled.replace(/\n{3,}/g, '\n\n')).toBe(sourceQuestions)
})

test('opens directly to a question and its full answer with only previous and next controls', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
  await expect(page.getByRole('heading', { name: 'The Simple Answer', exact: true })).toBeVisible()
  await expect(current(page).locator('.answer')).toContainText('Kubernetes is the port authority.')
  await expect(page.getByRole('button')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Previous topic' })).toBeDisabled()
  await expect(page.getByRole('combobox', { name: 'Subject', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox')).toHaveCount(0)
  await expect(page.getByRole('progressbar')).toHaveCount(0)
})

test('buttons, keyboard and reload keep one question in view', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Next topic' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[1].title)
  await expect(page).toHaveURL(/#\/guide\/kubernetes\/2$/)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[1].title)
  await page.getByRole('button', { name: 'Previous topic' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
  await page.getByRole('region', { name: 'Kubernetes topic feed', exact: true }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[1].title)
  await page.keyboard.press('PageUp')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
})

test('reading a long answer does not skip it and the following answer starts at the top', async ({
  page,
}) => {
  await page.goto('/#/q/81')
  const answer = page.getByRole('region', { name: 'Topic 81 details', exact: true })
  await answer.waitFor()
  expect(await answer.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
  await answer.focus()
  await page.keyboard.press('PageDown')
  await expect.poll(() => answer.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[80].title)
  await answer.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(
    page.getByRole('heading', { name: 'The Most Common Cause', exact: true }),
  ).toBeInViewport()
  await page.getByRole('button', { name: 'Next topic' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[81].title)
  await expect
    .poll(() =>
      current(page)
        .locator('.answer-scroll')
        .evaluate((el) => el.scrollTop),
    )
    .toBe(0)
})

test('vertical swipes advance and return without responding to a horizontal swipe', async ({
  page,
  context,
  browserName,
}) => {
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor()
  async function swipe(dx: number, dy: number) {
    const header = current(page).locator('.question-header')
    const box = (await header.boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    if (browserName === 'chromium') {
      const cdp = await context.newCDPSession(page)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
      for (const fraction of [0.25, 0.5, 0.75, 1])
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x + dx * fraction, y: y + dy * fraction }],
        })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await cdp.detach()
    } else {
      await header.dispatchEvent('touchstart', { touches: [{ clientX: x, clientY: y }] })
      await header.dispatchEvent('touchend', {
        changedTouches: [{ clientX: x + dx, clientY: y + dy }],
      })
    }
  }
  await swipe(75, 0)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
  await swipe(0, -65)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[1].title)
  await swipe(0, 65)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
})

test('old lesson links map to the feed and the last question has a real end', async ({ page }) => {
  await page.goto('/#/learn/kubernetes-055')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[54].title)
  await expect(page).toHaveURL(/#\/guide\/kubernetes\/55$/)
  await page.goto('/#/q/110')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[109].title)
  await expect(current(page).locator('.answer')).toContainText(
    'Scan all container images for non-root compliance before pushing to the registry.',
  )
  await expect(page.getByRole('button', { name: 'Next topic' })).toBeDisabled()
  await page.getByRole('button', { name: 'Previous topic' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[108].title)
  await page.goto('/#/topics')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
})

test('long titles and tables fit small screens and rotation keeps the current question', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const n of [1, 37, 71, 81, 110]) {
    await page.goto(`/#/q/${n}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[n - 1].title)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(
      await current(page)
        .locator('.answer-scroll')
        .evaluate((el) => el.clientHeight),
    ).toBeGreaterThan(80)
    await expect(page.getByRole('button', { name: 'Next topic' })).toBeInViewport()
  }
  await page.goto('/#/q/71')
  await page.setViewportSize({ width: 320, height: 568 })
  await expect(page.getByRole('table')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[70].title)
  await expect(page.getByRole('button', { name: 'Next topic' })).toBeInViewport()
  expect(
    await current(page)
      .locator('.answer-scroll')
      .evaluate((el) => el.clientHeight),
  ).toBeGreaterThan(60)
  expect(errors).toEqual([])
})

test('the complete guide works after the server disconnects', async ({
  page,
  context,
  browserName,
}) => {
  const server = await startStaticServer()
  try {
    await page.goto(server.url)
    await page.getByRole('heading', { level: 1 }).waitFor()
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
    await page.reload()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
    await page.goto(`${server.url}/#/q/110`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[109].title)
    await expect(current(page).locator('.answer')).toContainText(
      'Scan all container images for non-root compliance before pushing to the registry.',
    )
    // None of these subjects were opened online: all must be precached.
    for (const subject of additionalGuides) {
      await page.getByRole('combobox', { name: 'Subject', exact: true }).selectOption(subject.id)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(subject.questions[0].title)
      await page
        .getByRole('spinbutton', { name: 'Jump to topic' })
        .fill(String(subject.questions.length))
      await page.getByRole('spinbutton', { name: 'Jump to topic' }).press('Enter')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        subject.questions.at(-1)!.title,
      )
      await page.reload()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        subject.questions.at(-1)!.title,
      )
    }
  } finally {
    await server.close()
  }
})

test.describe('recoverable content failure', () => {
  test.use({ serviceWorkers: 'block' })
  test('offers retry if the guide cannot load', async ({ page }) => {
    await page.route('**/content/feed.json', (route) =>
      route.fulfill({ status: 503, body: 'Unavailable' }),
    )
    await page.goto('/')
    await expect(page.getByRole('alert')).toContainText('Couldn’t open the guide')
    await page.unroute('**/content/feed.json')
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(guide.questions[0].title)
  })
})
