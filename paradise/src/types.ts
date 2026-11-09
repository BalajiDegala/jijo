import type guides from './guides.json'

export type GuideId = keyof typeof guides

export interface GuideQuestion {
  number: number
  title: string
  section: string
  markdown: string
}

export interface Guide {
  version: 1
  id: GuideId
  title: string
  source: string
  sourceHash: string
  questions: GuideQuestion[]
}
