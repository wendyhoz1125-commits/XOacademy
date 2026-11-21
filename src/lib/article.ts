import DOMPurify from 'dompurify'

// The CMS content has no heading tags: structure is faked with short paragraphs and emoji.
// This rebuilds real structure at render time without changing the wording.

export type Heading = { id: string; text: string }

const LEADING_EMOJI = /^[\p{Extended_Pictographic}\p{Emoji_Modifier}‍️\s]+/u
const CALLOUT_EMOJI = /^(📌|📝|💡|⚠|❗)/u
const CALLOUT_KINDS: Record<string, { type: string; label: string }> = {
  '📌': { type: 'note', label: 'Note' },
  '📝': { type: 'note', label: 'Note' },
  '💡': { type: 'tip', label: 'Tip' },
  '⚠': { type: 'warning', label: 'Important' },
  '❗': { type: 'warning', label: 'Important' },
}
const LABELLED_CALLOUT = /^(Important|Note|Tip|Remember|Key Distinction|A Note About Costs)\s*[:—–]\s+(.{20,})$/s
const LEAD_LABEL = /^([A-Z][^:.—–()]{2,40}?)(:| —| –)\s+(.{20,})$/s
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

// Line icons (Lucide, ISC licence) used inside article content to make it quicker to scan.
const ICONS = {
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  tip: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
  steps: '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  done: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  next: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8m-4-4 4 4-4 4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
} as const
type IconName = keyof typeof ICONS

const svg = (name: IconName) =>
  '<svg aria-hidden="true" class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>'

// Picks an icon for a section from the words in its title.
const HEADING_ICONS: [RegExp, IconName][] = [
  [/video|watch|tutorial/i, 'play'],
  [/wrapping|result|summary|conclusion|benefit/i, 'done'],
  [/next step|what's next/i, 'next'],
  [/related|links/i, 'link'],
  [/example|scenario|workflow|use case/i, 'users'],
  [/tip|best practice|recommend/i, 'tip'],
  [/qualif|rule|compliance|permission/i, 'shield'],
  [/propert|setting|config|preset|filter/i, 'sliders'],
  [/time|slot|calendar|daily|availability|schedul/i, 'calendar'],
  [/step|how to|guide|create|add|manag|assign|import|build/i, 'steps'],
  [/intro|overview|understanding|what|why|big picture|terms|part \d/i, 'book'],
]
const iconForHeading = (text: string): IconName => HEADING_ICONS.find(([pattern]) => pattern.test(text))?.[1] ?? 'sparkles'

function addIcons(doc: Document) {
  for (const h2 of Array.from(doc.body.querySelectorAll('h2'))) {
    h2.insertAdjacentHTML('afterbegin', '<span class="ico-tile">' + svg(iconForHeading(h2.textContent ?? '')) + '</span>')
  }
  for (const callout of Array.from(doc.body.querySelectorAll('.callout'))) {
    const type = /callout-warning/.test(callout.className) ? 'warning' : /callout-tip/.test(callout.className) ? 'tip' : 'info'
    callout.insertAdjacentHTML('afterbegin', svg(type))
  }
  for (const example of Array.from(doc.body.querySelectorAll('.example'))) example.insertAdjacentHTML('afterbegin', svg('users'))
  for (const title of Array.from(doc.body.querySelectorAll('.terms'))) title.querySelectorAll('li').forEach((li) => li.insertAdjacentHTML('afterbegin', svg('book')))
}

// Wraps each section in its own block.
function wrapSections(doc: Document) {
  // Short answers without section titles (the FAQs) sit in a single card, with the text a bit larger.
  if (!doc.body.querySelector('h2')) {
    const card = doc.createElement('section')
    card.className = 'sec answer'
    card.append(...Array.from(doc.body.childNodes))
    doc.body.append(card)
    return
  }

  for (const h2 of Array.from(doc.body.children).filter((el) => el.tagName === 'H2')) {
    const section = doc.createElement('section')
    section.className = 'sec'
    h2.before(section)
    section.append(h2)
    while (section.nextElementSibling && section.nextElementSibling.tagName !== 'H2') section.append(section.nextElementSibling)
  }

  // A video that sits in the introduction, before any section, gets its own card so every video looks the same.
  for (const video of Array.from(doc.body.children).filter((el) => el.classList.contains('video'))) {
    const card = doc.createElement('section')
    card.className = 'sec video-card'
    const title = doc.createElement('h2')
    title.textContent = 'Video tutorial'
    video.before(card)
    card.append(title, video)
  }
}

// A paragraph that only points to a YouTube video or playlist (the link text is the URL itself) becomes a player.
function embedYoutubeLinks(doc: Document) {
  for (const link of Array.from(doc.body.querySelectorAll('p > a'))) {
    const href = link.getAttribute('href') ?? ''
    let src = ''
    try {
      const url = new URL(href)
      const host = url.hostname.replace(/^www\./, '')
      const playlist = url.searchParams.get('list')
      const video = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v')
      if (host === 'youtube.com' && url.pathname === '/playlist' && playlist) src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(playlist)}`
      else if ((host === 'youtube.com' || host === 'youtu.be') && video) src = `https://www.youtube.com/embed/${encodeURIComponent(video)}`
    } catch {
      continue
    }
    const paragraph = link.parentElement
    if (!src || !paragraph || (link.textContent ?? '').trim() !== href.trim()) continue
    const iframe = doc.createElement('iframe')
    iframe.setAttribute('src', src)
    iframe.setAttribute('allowfullscreen', 'true')
    iframe.setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
    link.remove()
    paragraph.textContent = (paragraph.textContent ?? '').replace(/[\s:—-]+$/, '')
    paragraph.after(iframe)
  }
}

// Some articles write each section title as a numbered list with a single short item. Treat those as section headings.
function titlesAsHeadings(doc: Document) {
  for (const list of Array.from(doc.body.querySelectorAll('ol'))) {
    const items = list.children
    const text = items[0]?.textContent?.trim() ?? ''
    if (items.length !== 1 || !list.nextElementSibling || text.length > 70 || /[.:;,!?]$/.test(text)) continue
    const heading = doc.createElement('p')
    heading.textContent = '📍 ' + text
    list.replaceWith(heading)
  }
}

// Paragraphs typed as "1) ...", "2) ..." become a real numbered list.
function groupNumbered(doc: Document) {
  const numbered = (el: Element | null) => el?.tagName === 'P' && /^\s*\d+\)\s/.test(el.textContent ?? '')
  for (const first of Array.from(doc.body.children)) {
    if (!first.isConnected || !numbered(first) || numbered(first.previousElementSibling)) continue
    const list = doc.createElement('ol')
    first.before(list)
    let cursor: Element | null = first
    while (numbered(cursor)) {
      const next: Element | null = (cursor as Element).nextElementSibling
      const li = doc.createElement('li')
      li.textContent = ((cursor as Element).textContent ?? '').replace(/^\s*\d+\)\s*/, '')
      list.append(li)
      ;(cursor as Element).remove()
      cursor = next
    }
  }
}

// The CMS exports a step as a numbered list whose first item is the title and whose other items start with "- ".
// Rebuild each one as a step: numbered title with its points as a bullet list underneath.
function groupSteps(doc: Document) {
  for (const list of Array.from(doc.body.querySelectorAll('ol'))) {
    const items = Array.from(list.children).filter((li) => li.tagName === 'LI')
    const bullet = (li: Element) => /^\s*-\s/.test(li.textContent ?? '')
    if (items.length < 2 || bullet(items[0]) || !items.slice(1).some(bullet)) continue

    const step = doc.createElement('div')
    step.className = 'step'
    const title = doc.createElement('p')
    title.className = 'step-title'
    title.textContent = items[0].textContent?.trim() ?? ''
    step.append(title)

    let ul: HTMLUListElement | null = null
    for (const li of items.slice(1)) {
      const text = (li.textContent ?? '').trim()
      if (bullet(li)) {
        if (!ul) {
          ul = doc.createElement('ul')
          step.append(ul)
        }
        const item = doc.createElement('li')
        item.textContent = text.replace(/^\s*-\s*/, '')
        ul.append(item)
      } else {
        const p = doc.createElement('p')
        p.textContent = text
        step.append(p)
        ul = null
      }
    }
    list.replaceWith(step)
  }
}

// Turns patterns the authors typed by hand into visual blocks: lead paragraph, labelled callouts, examples, term lists.
function enrichParagraphs(doc: Document) {
  const first = doc.body.firstElementChild
  if (first?.tagName === 'P' && !first.className && first.textContent && first.textContent.length > 60) first.className = 'lead'

  for (const p of Array.from(doc.body.children)) {
    if (p.tagName !== 'P' || p.className || p.children.length > 0) continue
    const text = p.textContent?.trim() ?? ''

    const callout = text.match(LABELLED_CALLOUT)
    if (callout) {
      const label = callout[1]
      const type = /important/i.test(label) ? 'warning' : /tip|remember/i.test(label) ? 'tip' : 'note'
      p.className = `callout callout-${type}`
      p.setAttribute('data-label', label.replace(/^A Note About Costs$/i, 'Note about costs'))
      p.textContent = callout[2].charAt(0).toUpperCase() + callout[2].slice(1)
      continue
    }

    const terms = text.match(/^Key Terms?:\s+(.+)$/is)
    if (terms) {
      const parts = terms[1].split(/;\s+/).filter(Boolean)
      if (parts.length >= 2) {
        const list = doc.createElement('ul')
        list.className = 'terms'
        for (const part of parts) {
          const m = part.match(/^([^(—:]{2,40}?)\s*(?:\((.+)\)|[—:]\s*(.+))\.?$/s)
          const li = doc.createElement('li')
          if (m) {
            const term = doc.createElement('strong')
            term.textContent = m[1].trim()
            li.append(term, doc.createTextNode((m[2] ?? m[3]).trim().replace(/\.$/, '')))
          } else li.textContent = part.replace(/\.$/, '')
          list.append(li)
        }
        p.replaceWith(list)
        continue
      }
    }

    // "Here's how to ...: do this; then this; then this." becomes a short intro followed by numbered steps.
    const procedure = text.match(/^([^:]{8,90}):\s+(.+)$/s)
    const parts = procedure?.[2].split(/;\s+/) ?? []
    if (procedure && parts.length >= 3 && parts.every((part) => part.length < 260)) {
      const intro = doc.createElement('p')
      intro.textContent = procedure[1] + ':'
      const steps = doc.createElement('ol')
      for (const part of parts) {
        const li = doc.createElement('li')
        const step = part.replace(/^(then|and)\s+/i, '').replace(/\.$/, '')
        li.textContent = step.charAt(0).toUpperCase() + step.slice(1)
        steps.append(li)
      }
      p.replaceWith(intro, steps)
      continue
    }

    const lead = text.match(LEAD_LABEL)
    if (lead) {
      const strong = doc.createElement('strong')
      strong.textContent = lead[1].trim()
      const isExample = /example/i.test(lead[1])
      if (isExample) {
        p.className = 'example'
        p.setAttribute('data-label', 'Example')
        strong.textContent = lead[1].replace(/\s*example\s*$/i, '').trim()
      }
      p.textContent = ''
      if (strong.textContent) p.append(strong, doc.createTextNode(lead[2] === ':' ? ': ' : ' — '))
      p.append(doc.createTextNode(lead[3]))
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
  embedYoutubeLinks(doc)
  titlesAsHeadings(doc)

  const headings: Heading[] = []
  const used = new Set<string>()

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
      if (isSection) {
        let id = slugify(text) || 'section'
        while (used.has(id)) id += '-2'
        used.add(id)
        heading.id = id
        headings.push({ id, text })
      }
    } else if (CALLOUT_EMOJI.test(raw)) {
      const callout = replaceTag(el, 'p', text, doc)
      const kind = CALLOUT_KINDS[raw.match(CALLOUT_EMOJI)?.[1] ?? ''] ?? CALLOUT_KINDS['📌']
      callout.className = `callout callout-${kind.type}`
      callout.setAttribute('data-label', kind.label)
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

  groupNumbered(doc)
  groupSteps(doc)
  enrichParagraphs(doc)

  for (const iframe of Array.from(doc.body.querySelectorAll('iframe'))) {
    // Name the video after the closest heading above it, or after the article's first heading.
    let previous = iframe.previousElementSibling
    while (previous && !/^H[23]$/.test(previous.tagName)) previous = previous.previousElementSibling
    const label = previous?.textContent ?? 'tutorial'
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

  wrapSections(doc)
  addIcons(doc)

  return { html: doc.body.innerHTML, headings }
}
