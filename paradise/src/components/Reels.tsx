import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Guide } from '../types'
import { guideFromUrl, topicFromUrl, topicUrl } from '../routes'

const Answer = memo(function Answer({ markdown }: { markdown: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        h4: ({ children }) => <h2>{children}</h2>,
        h5: ({ children }) => <h3>{children}</h3>,
        table: ({ children }) => (
          <div className="table-scroll" role="region" aria-label="Comparison table" tabIndex={0}>
            <table>{children}</table>
          </div>
        ),
      }}
    >
      {markdown}
    </Markdown>
  )
})

export function Reels({ guide }: { guide: Guide }) {
  const { questions } = guide
  const [active, setActive] = useState(() => topicFromUrl(questions.length))
  const [jumpTo, setJumpTo] = useState(String(active + 1))
  const scroller = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  const scrollFrame = useRef(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  activeRef.current = active

  const moveTo = useCallback(
    (index: number, smooth = true) => {
      const feed = scroller.current
      if (!feed) return
      const bounded = Math.max(0, Math.min(questions.length - 1, index))
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      feed.scrollTo({
        top: bounded * feed.clientHeight,
        behavior: smooth && !reduceMotion ? 'smooth' : 'instant',
      })
      if (!smooth || reduceMotion) setActive(bounded)
    },
    [questions.length],
  )

  useLayoutEffect(() => {
    const feed = scroller.current!
    // Keep the current question in place when the phone rotates or its browser bar resizes.
    const resize = new ResizeObserver(() => moveTo(activeRef.current, false))
    moveTo(activeRef.current, false)
    resize.observe(feed)
    const followUrl = () => {
      if (guideFromUrl() === guide.id) moveTo(topicFromUrl(questions.length), false)
    }
    window.addEventListener('hashchange', followUrl)
    return () => {
      resize.disconnect()
      window.removeEventListener('hashchange', followUrl)
      cancelAnimationFrame(scrollFrame.current)
    }
  }, [moveTo, questions.length, guide.id])

  // Commit the visible topic's URL before paint so an immediate new navigation
  // cannot be overwritten by an effect left over from the previous render.
  useLayoutEffect(() => {
    if (guideFromUrl() === guide.id)
      window.history.replaceState(null, '', topicUrl(guide.id, active + 1))
    setJumpTo(String(active + 1))
  }, [active, guide.id])

  function jump() {
    const number = Number(jumpTo)
    const index =
      jumpTo.trim() && Number.isFinite(number)
        ? Math.max(0, Math.min(questions.length - 1, Math.trunc(number) - 1))
        : activeRef.current
    setJumpTo(String(index + 1))
    moveTo(index, false)
  }

  function onScroll() {
    cancelAnimationFrame(scrollFrame.current)
    scrollFrame.current = requestAnimationFrame(() => {
      const feed = scroller.current
      if (feed?.clientHeight)
        setActive(
          Math.max(
            0,
            Math.min(questions.length - 1, Math.round(feed.scrollTop / feed.clientHeight)),
          ),
        )
    })
  }
  function touchStart(event: TouchEvent) {
    if (event.touches.length !== 1 || (event.target as HTMLElement).closest('button')) {
      touch.current = null
      return
    }
    touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  function touchEnd(event: TouchEvent) {
    const start = touch.current
    touch.current = null
    if (!start || event.changedTouches.length !== 1) return
    const dx = event.changedTouches[0].clientX - start.x
    const dy = event.changedTouches[0].clientY - start.y
    if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx) * 1.5)
      moveTo(activeRef.current + (dy < 0 ? 1 : -1))
  }
  function keyboard(event: KeyboardEvent) {
    // Arrow keys inside an answer remain native reading/scrolling controls.
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target as HTMLElement).closest('.answer-scroll, input')
    )
      return
    const change =
      event.key === 'ArrowDown' || event.key === 'PageDown'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'PageUp'
          ? -1
          : 0
    if (change) {
      event.preventDefault()
      moveTo(activeRef.current + change)
    }
  }

  return (
    <main className="reader" onKeyDown={keyboard}>
      <div
        className="reel-feed"
        ref={scroller}
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label={`${guide.title} topic feed`}
      >
        {questions.map((question, index) => (
          <article
            className="reel"
            key={question.number}
            aria-hidden={index !== active}
            inert={index !== active}
            aria-labelledby={`question-${question.number}`}
          >
            {Math.abs(index - active) <= 1 && (
              <div className="question-card">
                <div
                  className="question-header swipe-zone"
                  onTouchStart={touchStart}
                  onTouchEnd={touchEnd}
                  onTouchCancel={() => {
                    touch.current = null
                  }}
                >
                  <div className="question-meta">
                    <span>TOPIC {String(question.number).padStart(2, '0')}</span>
                    <span>
                      {question.number} / {questions.length}
                    </span>
                  </div>
                  <h1 id={`question-${question.number}`}>{question.title}</h1>
                  <p className="section-label">{question.section}</p>
                </div>
                <div
                  className="answer-scroll"
                  tabIndex={0}
                  role="region"
                  aria-label={`Topic ${question.number} details`}
                >
                  <div className="answer">
                    <Answer markdown={question.markdown} />
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      <footer className="reader-footer">
        <div className="topic-jump">
          <label htmlFor="topic-number">Jump to topic</label>
          <input
            id="topic-number"
            type="number"
            inputMode="numeric"
            min={1}
            max={questions.length}
            step={1}
            value={jumpTo}
            onChange={(event) => setJumpTo(event.target.value)}
            onBlur={jump}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.blur()
              }
            }}
          />
          <span className="topic-total">/ {questions.length}</span>
          <input
            className="topic-slider"
            type="range"
            aria-label="Browse topics"
            aria-valuetext={`Topic ${active + 1} of ${questions.length}`}
            min={1}
            max={questions.length}
            step={1}
            value={active + 1}
            onChange={(event) => moveTo(Number(event.target.value) - 1, false)}
          />
        </div>
        <div
          className="reader-navigation swipe-zone"
          onTouchStart={touchStart}
          onTouchEnd={touchEnd}
          onTouchCancel={() => {
            touch.current = null
          }}
        >
          <p>
            {active === questions.length - 1
              ? 'You’ve reached the last topic.'
              : 'Swipe up for the next topic.'}
            <span>Scroll to read more.</span>
          </p>
          <div className="reel-controls">
            <button
              aria-label="Previous topic"
              title="Previous topic"
              disabled={active === 0}
              onClick={() => moveTo(activeRef.current - 1)}
            >
              <ArrowUp size={21} aria-hidden="true" />
            </button>
            <button
              className="next-question"
              aria-label="Next topic"
              title="Next topic"
              disabled={active === questions.length - 1}
              onClick={() => moveTo(activeRef.current + 1)}
            >
              <ArrowDown size={21} aria-hidden="true" />
            </button>
          </div>
        </div>
      </footer>
      <span className="sr-only" role="status" aria-live="polite">
        Topic {active + 1} of {questions.length}: {questions[active].title}
      </span>
    </main>
  )
}
