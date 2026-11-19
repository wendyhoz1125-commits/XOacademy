import DOMPurify from 'dompurify'

// The CMS content has no heading tags: structure is faked with short paragraphs and emoji.
// This rebuilds real structure at render time without changing the wording.

export type Heading = { id: string; text: string }

const LEADING_EMOJI = /^[\p{Extended_Pictographic}\p{Emoji_Modifier}‍️\s]+/u
const CALLOUT_EMOJI = /^(📌|💡|⚠|❗)/u
const SECTION_NAMES = /^(wrapping up|real-world examples|result|next step|what's next|introduction|related)/i

export const stripEmoji = (text: string) => text.replace(LEADING_EMOJI, '').trim()

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function looksLikeHeading(text: string) {
  return (
    text.length <= 70 &&
    text.split(/\s+/).length <= 10 &&
    !/[.:;,!?…]$/.test(text) &&
    !/^[-–•]/.test(text) &&
    !text.includes('→') &&
    !/^in this video/i.test(text) &&
    /^[A-Z0-9]/.test(text)
  )
}

const isLooseItem = (el: Element | null) => el?.tagName === 'P' && /^\s*-\s/.test(el.textContent ?? '')

function replaceTag(el: Element, tag: string, text: string, doc: Document) {
  const next = doc.createElement(tag)
  next.textContent = text
  el.replaceWith(next)
  return next
}

// Groups runs of "- item" paragraphs into a list, taking in the unmarked first item when there is one.
function groupLooseLists(doc: Document) {
  for (const first of Array.from(doc.body.children)) {
    if (!first.isConnected || !isLooseItem(first) || isLooseItem(first.previousElementSibling)) continue
    const items: Element[] = []
    const before = first.previousElementSibling
    const beforeText = before?.textContent?.trim() ?? ''
    const twoBack = before?.previousElementSibling?.textContent?.trim() ?? ''
    const hasEmoji = stripEmoji(beforeText) !== beforeText
    const followsRelated = /related/i.test(twoBack)
    const followsIntro = twoBack.endsWith(':') || /^\d+\)/.test(twoBack)
    if (before?.tagName === 'P' && beforeText.length < 60 && ((!hasEmoji && followsIntro) || followsRelated)) {
      items.push(before)
    }
    let cursor: Element | null = first
    while (isLooseItem(cursor)) {
      items.push(cursor as Element)
      cursor = (cursor as Element).nextElementSibling
    }
    const list = doc.createElement('ul')
    items[0].before(list)
    for (const item of items) {
      const li = doc.createElement('li')
      li.textContent = stripEmoji((item.textContent ?? '').replace(/^\s*-\s*/, ''))
      list.append(li)
      item.remove()
    }
  }
}

export function normalizeArticle(raw: string) {
  const clean = DOMPurify.sanitize(raw, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'referrerpolicy'],
  })
  const doc = new DOMParser().parseFromString(clean, 'text/html')

  for (const p of Array.from(doc.body.querySelectorAll('p'))) {
    if (!p.textContent?.trim() && !p.querySelector('img,iframe')) p.remove()
  }
  groupLooseLists(doc)

  const headings: Heading[] = []
  const used = new Set<string>()
  let lastHeading = 'Video tutorial'

  for (const el of Array.from(doc.body.children)) {
    if (el.tagName !== 'P' || el.querySelector('img,iframe,a')) continue
    const raw = el.textContent?.trim() ?? ''
    const text = stripEmoji(raw)
    const hasEmoji = text !== raw

    if (looksLikeHeading(text)) {
      if (!el.nextElementSibling) {
        el.textContent = text
        continue
      }
      const isSection = (hasEmoji || SECTION_NAMES.test(text)) && !/^\d+\)/.test(text)
      const heading = replaceTag(el, isSection ? 'h2' : 'h3', text, doc)
      lastHeading = text
      if (isSection) {
        let id = slugify(text) || 'section'
        while (used.has(id)) id += '-2'
        used.add(id)
        heading.id = id
        headings.push({ id, text })
      }
    } else if (CALLOUT_EMOJI.test(raw)) {
      replaceTag(el, 'p', text, doc).className = 'callout'
    } else if (hasEmoji) {
      el.textContent = text
    }
  }

  // Keep the outline sequential: a subsection heading that comes before any section becomes a section.
  let seenSection = false
  for (const heading of Array.from(doc.body.querySelectorAll('h2, h3'))) {
    if (heading.tagName === 'H2') seenSection = true
    else if (!seenSection) replaceTag(heading, 'h2', heading.textContent ?? '', doc)
  }

  for (const li of Array.from(doc.body.querySelectorAll('li'))) {
    const first = li.firstChild?.nodeName === 'P' ? li.firstChild.firstChild : li.firstChild
    if (first?.nodeType === Node.TEXT_NODE) first.textContent = (first.textContent ?? '').replace(LEADING_EMOJI, '')
  }

  for (const iframe of Array.from(doc.body.querySelectorAll('iframe'))) {
    const previous = iframe.previousElementSibling
    const label = /^H[23]$/.test(previous?.tagName ?? '') ? previous?.textContent : lastHeading
    iframe.setAttribute('title', `Video: ${label}`)
    iframe.setAttribute('loading', 'lazy')
    iframe.removeAttribute('class')
    const wrapper = doc.createElement('div')
    wrapper.className = 'video'
    iframe.before(wrapper)
    wrapper.append(iframe)
  }

  for (const img of Array.from(doc.body.querySelectorAll('img'))) {
    img.setAttribute('loading', 'lazy')
    img.removeAttribute('class')
  }

  return { html: doc.body.innerHTML, headings }
}
