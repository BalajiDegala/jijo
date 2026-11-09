export const themes = [
  { id: 'light', label: 'Light', description: 'Soft paper, forest green', color: '#f7f7f2' },
  { id: 'dark', label: 'Dark', description: 'Charcoal with mint accents', color: '#141d22' },
  { id: 'pink', label: 'Pink', description: 'Blush paper, berry ink', color: '#f9edf2' },
  {
    id: 'handwritten',
    label: 'Handwritten',
    description: 'A warm, personal notebook',
    color: '#eee8db',
  },
] as const

export type Theme = (typeof themes)[number]['id']
const storageKey = 'brocode-theme-v1'

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(storageKey)
    return themes.find((theme) => theme.id === saved)?.id ?? 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', themes.find((option) => option.id === theme)!.color)
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme)
  } catch {
    // Theme changes still work when the browser does not allow storage.
  }
}
