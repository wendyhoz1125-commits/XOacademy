import {
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Compass,
  CalendarDays,
  Lightbulb,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'
import data from '@/data/content.json'
import { stripEmoji } from '@/lib/article'

export type Article = {
  slug: string
  categorySlug: string
  title: string
  excerpt: string
  html: string
  hasVideo: boolean
  minutes: number
  updatedAt: string
  plainText: string
}

export type Category = {
  name: string
  slug: string
  description: string
  order: number
}

const toPlainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Obvious corrections to source copy. Everything else is shown as published.
const DESCRIPTION_FIXES: Record<string, string> = {
  'settings-and-environment': 'Need to adjust fundamentals in the system, such as properties or sets? This is the right place.',
  dailies: 'Learn how to deal with dailies.',
  'get-ready-and-prepare-to-schedule': 'Set up everything you need to get started.',
}

export const categories: Category[] = data.categories
  .map((c) => ({ ...c, description: DESCRIPTION_FIXES[c.slug] ?? c.description }))
  .sort((a, b) => a.order - b.order)

export const articles: Article[] = data.articles.map((a) => {
  const plainText = toPlainText(a.html)
  return {
    slug: a.slug,
    categorySlug: a.categorySlug,
    title: stripEmoji(a.title),
    excerpt: a.excerpt ?? '',
    html: a.html,
    hasVideo: a.html.includes('<iframe'),
    minutes: Math.max(1, Math.ceil(plainText.split(' ').length / 200)),
    updatedAt: a.updatedAt,
    plainText,
  }
})

// Each category's artwork: a soft multi-point gradient plus a line icon. See DESIGN.md.
type Art = { gradient: string; Icon: LucideIcon }

const ART: Record<string, Art> = {
  'understanding-the-big-picture': {
    Icon: Compass,
    gradient:
      'radial-gradient(70% 90% at 0% 0%, #B9A3F5, transparent 60%), radial-gradient(70% 90% at 55% 0%, #8EF0E6, transparent 65%), radial-gradient(60% 80% at 100% 10%, #C8F7F0, transparent 70%), #E9FBF6',
  },
  'get-ready-and-prepare-to-schedule': {
    Icon: ClipboardCheck,
    gradient:
      'radial-gradient(55% 80% at 0% 0%, #FF7A8A, transparent 60%), radial-gradient(55% 80% at 30% 0%, #FFC46B, transparent 62%), radial-gradient(60% 90% at 80% 10%, #7FE3C0, transparent 65%), radial-gradient(50% 80% at 100% 0%, #9FE8F0, transparent 70%), #F4FBF2',
  },
  scheduling: {
    Icon: CalendarDays,
    gradient:
      'radial-gradient(70% 90% at 0% 0%, #D9C8A8, transparent 62%), radial-gradient(60% 90% at 65% 15%, #CDE8A8, transparent 65%), radial-gradient(55% 80% at 100% 0%, #A8E0B8, transparent 70%), #F2F7EC',
  },
  dailies: {
    Icon: Clock3,
    gradient:
      'radial-gradient(50% 70% at 0% 0%, #E8D9A0, transparent 62%), radial-gradient(55% 90% at 100% 35%, #6FD69A, transparent 66%), radial-gradient(45% 70% at 85% 0%, #B8EFC8, transparent 70%), #F8FBF5',
  },
  'settings-and-environment': {
    Icon: SlidersHorizontal,
    gradient:
      'radial-gradient(60% 90% at 0% 0%, #9AA8F0, transparent 62%), radial-gradient(55% 90% at 100% 0%, #2FD88A, transparent 66%), radial-gradient(60% 80% at 55% 35%, #9FE8D8, transparent 70%), #EEF9F6',
  },
  'frequently-asked-questions': {
    Icon: CircleHelp,
    gradient:
      'radial-gradient(65% 90% at 0% 0%, #E9C9B0, transparent 62%), radial-gradient(60% 90% at 100% 20%, #A8D8B8, transparent 66%), radial-gradient(60% 80% at 50% 40%, #DDE8D0, transparent 70%), #F5F8F1',
  },
  // Not public yet on the live site; ready for when it is published.
  'tips-and-tricks-to-make-life-smoother': {
    Icon: Lightbulb,
    gradient:
      'radial-gradient(60% 90% at 0% 0%, #F2C9A8, transparent 62%), radial-gradient(55% 80% at 40% 0%, #F5E1B0, transparent 65%), radial-gradient(60% 90% at 100% 10%, #D8E8B8, transparent 70%), #FBF8F1',
  },
}

const FALLBACK_ART = ART['frequently-asked-questions']
export const categoryArt = (slug: string): Art => ART[slug] ?? FALLBACK_ART

// Article order is unchanged; each group is defined by how many articles it takes in sequence.
const GROUPS: Record<string, { title: string; count: number }[]> = {
  'get-ready-and-prepare-to-schedule': [
    { title: 'Add your resources', count: 6 },
    { title: 'Qualify resources', count: 2 },
    { title: 'Build a curriculum', count: 5 },
    { title: 'Availability and properties', count: 3 },
  ],
}

export const COMMON_TASK_SLUGS = [
  'handling-a-sick-instructor-reassigning-a-class',
  'scheduling-run-the-xo-optimizer',
  'new-resource-instructor',
  'work-rules-define-duty-limits-and-rest-periods',
]

export const POPULAR_SEARCHES = ['Sick instructor', 'Run the optimizer', 'Work rules', 'Qualifications']

export const getCategory = (slug?: string) => categories.find((c) => c.slug === slug)
export const getArticle = (slug?: string) => articles.find((a) => a.slug === slug)
export const articlesIn = (slug: string) => articles.filter((a) => a.categorySlug === slug)
export const pluralArticles = (n: number) => `${n} ${n === 1 ? 'article' : 'articles'}`
export const categoryNumber = (slug: string) => String(categories.findIndex((c) => c.slug === slug) + 1).padStart(2, '0')

export function groupsFor(slug: string) {
  const list = articlesIn(slug)
  const groups = GROUPS[slug]
  if (!groups) return [{ title: null as string | null, items: list, start: 1 }]
  let index = 0
  return groups.map((g) => {
    const start = index + 1
    const items = list.slice(index, index + g.count)
    index += g.count
    return { title: g.title as string | null, items, start }
  })
}

export function groupOf(article: Article) {
  const groups = groupsFor(article.categorySlug)
  const group = groups.find((g) => g.items.some((a) => a.slug === article.slug)) ?? groups[0]
  const position = group.start + group.items.findIndex((a) => a.slug === article.slug)
  return { group, groups, position }
}

export function searchArticles(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return articles
    .map((article) => {
      const title = article.title.toLowerCase()
      const excerpt = article.excerpt.toLowerCase()
      const body = article.plainText.toLowerCase()
      let score = 0
      for (const term of terms) {
        const inTitle = title.includes(term)
        const inExcerpt = excerpt.includes(term)
        const inBody = body.includes(term)
        if (!inTitle && !inExcerpt && !inBody) return { article, score: 0 }
        score += (inTitle ? 10 : 0) + (inExcerpt ? 4 : 0) + (inBody ? 1 : 0)
      }
      return { article, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.article)
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Splits text into plain and matching parts so the UI can bold the query terms.
export function highlight(text: string, query: string) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp)
  if (!terms.length) return [{ text, match: false }]
  const pattern = new RegExp(`(${terms.join('|')})`, 'gi')
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, match: terms.some((t) => new RegExp(`^${t}$`, 'i').test(part)) }))
}

// A short passage around the first match, like a search engine snippet.
export function snippet(article: Article, query: string, length = 170) {
  const term = query.trim().split(/\s+/)[0]?.toLowerCase()
  if (term && article.excerpt.toLowerCase().includes(term)) return article.excerpt
  const at = term ? article.plainText.toLowerCase().indexOf(term) : -1
  if (at < 0) return article.excerpt || article.plainText.slice(0, length)
  const start = Math.max(0, at - 60)
  const text = article.plainText.slice(start, start + length).trim()
  return `${start > 0 ? '…' : ''}${text}…`
}
