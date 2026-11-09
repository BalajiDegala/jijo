import { useLayoutEffect, useRef, useState } from 'react'
import { Palette, X } from 'lucide-react'
import { applyTheme, readTheme, saveTheme, themes, type Theme } from '../theme'

export function ThemePicker() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => applyTheme(theme), [theme])

  return (
    <>
      <button
        ref={opener}
        className="appearance-button"
        aria-label="Reading themes"
        title="Reading themes"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <Palette size={21} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        className="theme-dialog"
        aria-labelledby="theme-dialog-title"
        aria-describedby="theme-dialog-description"
        onClose={() => opener.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            event.currentTarget.close()
        }}
      >
        <div className="theme-dialog-heading">
          <div>
            <h2 id="theme-dialog-title">Make it yours.</h2>
            <p id="theme-dialog-description">A little comfort for your reading time.</p>
          </div>
          <button
            className="appearance-button"
            aria-label="Close themes"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <fieldset className="theme-options">
          <legend className="sr-only">Choose a reading theme</legend>
          {themes.map((option) => (
            <label key={option.id} className="theme-option" data-selected={theme === option.id}>
              <input
                type="radio"
                name="reading-theme"
                value={option.id}
                aria-label={option.label}
                checked={theme === option.id}
                onChange={() => {
                  setTheme(option.id)
                  saveTheme(option.id)
                }}
              />
              <span className="theme-preview" data-preview={option.id} aria-hidden="true">
                <span className="preview-eyebrow">ONE TOPIC AT A TIME</span>
                <span className="preview-title">Stay curious.</span>
                <span className="preview-lines">
                  <i />
                  <i />
                </span>
              </span>
              <span className="theme-name">{option.label}</span>
              <span className="theme-description">{option.description}</span>
            </label>
          ))}
        </fieldset>
        <button className="theme-done" onClick={() => dialog.current?.close()}>
          Done
        </button>
      </dialog>
    </>
  )
}
