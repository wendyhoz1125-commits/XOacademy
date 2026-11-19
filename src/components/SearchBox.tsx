import { Clock3, Search, X } from 'lucide-react'
import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { getArticle, getCategory, highlight, POPULAR_SEARCHES, searchArticles, type Article } from '@/lib/content'
import { getRecent } from '@/lib/recent'
import { cn } from '@/lib/utils'

const MAX_SUGGESTIONS = 6

export function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlight(text, query).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-sm bg-brand/14 px-0.5 font-semibold text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

const variants = {
  hero: { box: 'h-[60px] pl-5 pr-2 shadow-[0_0_0_6px_rgb(255_255_255/0.08)]', input: 'text-[17px] md:text-[17px]' },
  header: { box: 'h-11 pl-3.5 pr-1.5', input: 'text-[15px] md:text-[15px]' },
  page: { box: 'h-14 pl-5 pr-1.5', input: 'text-[17px] md:text-[17px]' },
}

export function SearchBox({
  initialQuery = '',
  variant = 'header',
  suggest = true,
  className,
}: {
  initialQuery?: string
  variant?: keyof typeof variants
  suggest?: boolean
  className?: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const root = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Returning focus to the field after Escape must not reopen the panel.
  const keepClosed = useRef(false)
  const id = useId()
  const panelId = `${id}-panel`

  const q = query.trim()
  const results = useMemo(() => searchArticles(q), [q])
  const recent = useMemo(() => (open ? getRecent().map(getArticle).filter((a): a is Article => Boolean(a)) : []), [open])
  const typing = q.length >= 2
  const showPanel = suggest && open && (typing || q.length === 0)
  const style = variants[variant]

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!q) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  // Arrow keys move through the options in the panel; Escape closes it and returns to the field.
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      if (document.activeElement !== inputRef.current) {
        keepClosed.current = true
        inputRef.current?.focus()
      }
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    const items = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-option]') ?? [])
    if (!items.length) return
    event.preventDefault()
    const index = items.indexOf(document.activeElement as HTMLElement)
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1
    if (next < 0) inputRef.current?.focus()
    else items[Math.min(next, items.length - 1)].focus()
  }

  const option = 'block rounded-xl px-3 py-2.5 hover:bg-muted focus-visible:bg-muted focus-visible:outline-offset-0'

  return (
    <form
      ref={root}
      role="search"
      onSubmit={submit}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget)) setOpen(false)
      }}
      className={cn('relative w-full text-foreground', className)}
    >
      <label htmlFor={id} className="sr-only">
        Search articles
      </label>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-full border border-[#2d3431]/20 bg-card transition-shadow focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(47_93_83/0.18)]',
          style.box,
        )}
      >
        <Search aria-hidden className="size-5 shrink-0 text-brand" />
        <Input
          ref={inputRef}
          id={id}
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          aria-controls={showPanel ? panelId : undefined}
          aria-expanded={showPanel}
          placeholder={variant === 'hero' ? 'Search articles, e.g. work rules' : 'Search articles'}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (keepClosed.current) keepClosed.current = false
            else setOpen(true)
          }}
          className={cn(
            'h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 shadow-none outline-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden',
            style.input,
          )}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X aria-hidden className="size-4.5" />
          </button>
        )}
        {variant === 'page' && (
          <button type="submit" className="min-h-11 shrink-0 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/85">
            Search
          </button>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {showPanel && typing ? `${results.length} results` : ''}
      </p>

      {showPanel && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-40 mt-2.5 overflow-hidden rounded-2xl border bg-popover text-left text-popover-foreground shadow-[0_18px_48px_rgb(45_52_49/0.16)]"
        >
          {typing ? (
            results.length > 0 ? (
              <>
                <p className="flex justify-between px-5 pt-3.5 pb-1.5 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  <span>Articles</span>
                  <span>{results.length} results</span>
                </p>
                <ul className="max-h-[60vh] overflow-y-auto px-2 pb-2">
                  {results.slice(0, MAX_SUGGESTIONS).map((article) => (
                    <li key={article.slug}>
                      <Link data-option to={`/articles/${article.slug}`} onClick={() => setOpen(false)} className={option}>
                        <span className="block font-medium">
                          <Highlighted text={article.title} query={q} />
                        </span>
                        <span className="block text-sm text-muted-foreground">{getCategory(article.categorySlug)?.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  data-option
                  to={`/search?q=${encodeURIComponent(q)}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between border-t bg-muted/60 px-5 font-medium text-brand hover:bg-muted focus-visible:-outline-offset-2"
                >
                  See all {results.length} results for “{q}”
                  <span aria-hidden className="hidden text-xs text-muted-foreground sm:inline">
                    ↑ ↓ · Enter · Esc
                  </span>
                </Link>
              </>
            ) : (
              <p className="px-5 py-4 text-muted-foreground">
                No articles match “{q}”. Try a shorter word, or browse the sections.
              </p>
            )
          ) : (
            <>
              <p className="px-5 pt-4 pb-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">Popular searches</p>
              <div className="flex flex-wrap gap-2 px-5 pb-4">
                {POPULAR_SEARCHES.map((term) => (
                  <Link
                    key={term}
                    data-option
                    to={`/search?q=${encodeURIComponent(term)}`}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm hover:bg-muted"
                  >
                    {term}
                  </Link>
                ))}
              </div>
              {recent.length > 0 && (
                <>
                  <p className="border-t px-5 pt-4 pb-1.5 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">Recently viewed</p>
                  <ul className="px-2 pb-2">
                    {recent.map((article) => (
                      <li key={article.slug}>
                        <Link data-option to={`/articles/${article.slug}`} onClick={() => setOpen(false)} className={cn(option, 'flex items-center gap-3')}>
                          <Clock3 aria-hidden className="size-4.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 font-medium">{article.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </form>
  )
}
