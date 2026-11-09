import type { GuideId } from './types'
import guides from './guides.json'

export function guideFromUrl(): GuideId {
  const id = window.location.hash.match(/^#\/guide\/([^/]+)(?:\/|$)/)?.[1]
  return id && Object.hasOwn(guides, id) ? (id as GuideId) : 'kubernetes'
}

export function topicFromUrl(total: number) {
  const match = window.location.hash.match(
    /^#\/(?:guide\/([^/]+)\/(\d+)|q\/(\d+)|learn\/kubernetes-(\d+))$/,
  )
  if (match?.[1] && !Object.hasOwn(guides, match[1])) return 0
  return Math.max(0, Math.min(total - 1, Number(match?.[2] ?? match?.[3] ?? match?.[4] ?? 1) - 1))
}

export function topicUrl(guide: GuideId, number: number) {
  return `#/guide/${guide}/${number}`
}
