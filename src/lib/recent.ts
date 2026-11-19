// Recently viewed articles, kept per browser. Storage can be unavailable (private mode, blocked site data), so every access is guarded.
const KEY = 'xo-academy:recent'
const MAX = 5

export function getRecent(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function rememberArticle(slug: string) {
  try {
    const next = [slug, ...getRecent().filter((s) => s !== slug)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Not saving is fine: the list is a convenience.
  }
}
