import { Component, useEffect, useState, type ReactNode } from 'react'
import { CodeXml } from 'lucide-react'
import { loadGuide } from './content'
import type { Guide, GuideId } from './types'
import guides from './guides.json'
import { Reels } from './components/Reels'
import { ThemePicker } from './components/ThemePicker'
import { guideFromUrl, topicUrl } from './routes'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <div className="message-screen" role="alert">
        <h1>Let’s open the guide again.</h1>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    ) : (
      this.props.children
    )
  }
}

export function App() {
  const [guideId, setGuideId] = useState(guideFromUrl)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [updateReady, setUpdateReady] = useState(false)
  useEffect(() => {
    const followUrl = () => setGuideId(guideFromUrl())
    window.addEventListener('hashchange', followUrl)
    return () => window.removeEventListener('hashchange', followUrl)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    loadGuide(guideId, controller.signal)
      .then((loaded) => {
        if (!controller.signal.aborted) setGuide(loaded)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Please try again.')
      })
    return () => controller.abort()
  }, [guideId, retry])
  useEffect(() => {
    document.title = `brocode · ${guides[guideId].title} guide`
  }, [guideId])
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const controlled = Boolean(navigator.serviceWorker.controller)
    const updated = () => {
      if (controlled) setUpdateReady(true)
    }
    navigator.serviceWorker.addEventListener('controllerchange', updated)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', updated)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <span className="brand" aria-label="brocode">
          <CodeXml aria-hidden="true" size={25} />
          <span>
            brocode<span className="brand-dot">.</span>
          </span>
        </span>
        <div className="guide-picker">
          <label htmlFor="guide-select">Subject</label>
          <select
            id="guide-select"
            value={guideId}
            onChange={(event) => {
              window.location.hash = topicUrl(event.target.value as GuideId, 1)
            }}
          >
            {Object.entries(guides).map(([id, subject]) => (
              <option key={id} value={id}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>
        <ThemePicker />
        {updateReady && (
          <button className="refresh-button" onClick={() => window.location.reload()}>
            Refresh to update
          </button>
        )}
      </header>
      {guide?.id === guideId ? (
        <Reels key={guide.id} guide={guide} />
      ) : (
        <main className="message-screen">
          {error ? (
            <div role="alert">
              <h1>Couldn’t open the guide.</h1>
              <p>{error}</p>
              <button onClick={() => setRetry((value) => value + 1)}>Try again</button>
            </div>
          ) : (
            <p role="status">Opening your guide…</p>
          )}
        </main>
      )}
    </div>
  )
}
