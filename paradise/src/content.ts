import type { Guide, GuideId } from './types'
import guides from './guides.json'

export async function loadGuide(id: GuideId, signal: AbortSignal): Promise<Guide> {
  const response = await fetch(`/content/${guides[id].output}`, {
    signal,
  })
  if (!response.ok) throw new Error('The guide could not be loaded. Please try again.')
  const guide = await response.json()
  if (
    guide.version !== 1 ||
    guide.id !== id ||
    typeof guide.title !== 'string' ||
    !guide.title ||
    !Array.isArray(guide.questions) ||
    guide.questions.length !== guides[id].topics ||
    !guide.questions.every(
      (q: Guide['questions'][number], i: number) =>
        q.number === i + 1 &&
        typeof q.title === 'string' &&
        q.title &&
        typeof q.section === 'string' &&
        q.section &&
        typeof q.markdown === 'string' &&
        q.markdown,
    )
  )
    throw new Error('The guide is unavailable. Please try again.')
  return guide
}
