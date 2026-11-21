import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Highlighted, SearchBox } from '@/components/SearchBox'
import { CategoryArt, CategoryNav, Crumbs, PageContainer, useTitle } from '@/components/shared'
import { getCategory, POPULAR_SEARCHES, searchArticles, snippet, type Article } from '@/lib/content'
import { cn } from '@/lib/utils'

const PER_PAGE = 10

function Result({ article, query }: { article: Article; query: string }) {
  const category = getCategory(article.categorySlug)
  return (
    <li className="border-b py-6">
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <CategoryArt
              slug={article.categorySlug}
              className="size-7 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgb(45_52_49/0.12)]"
              iconClassName="size-7 rounded-full bg-transparent shadow-none [&_svg]:size-3.5 [&_svg]:stroke-2"
            />
            <span className="min-w-0 text-sm leading-[18px]">
              <span className="block font-medium">XO Academy</span>
              <span className="block truncate text-xs text-muted-foreground">helpcenter.xoscheduler.com › {category?.name}</span>
            </span>
          </div>
          <h2 className="mt-1">
            <Link
              to={`/articles/${article.slug}`}
              className="inline-block py-2 font-heading text-xl leading-7 font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand md:text-[21px]"
            >
              {article.title}
            </Link>
          </h2>
          <p className="mt-1.5 line-clamp-2 text-[15px] leading-[23px] text-[#434b47]">
            <Highlighted text={snippet(article, query)} query={query} />
          </p>
        </div>
        <CategoryArt
          slug={article.categorySlug}
          className="hidden h-[92px] w-[132px] shrink-0 items-center justify-center rounded-xl shadow-[inset_0_0_0_1px_rgb(45_52_49/0.08)] sm:flex"
          iconClassName="size-11 rounded-xl [&_svg]:size-5.5"
        />
      </div>
    </li>
  )
}

export function Search() {
  const [params] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const filter = params.get('cat') ?? ''
  const pageParam = Number(params.get('page') ?? '1')
  useTitle(query ? `Search: ${query}` : 'Search')

  const all = useMemo(() => searchArticles(query), [query])
  const results = filter ? all.filter((a) => a.categorySlug === filter) : all
  const pageCount = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const page = Math.min(Math.max(1, Number.isFinite(pageParam) ? pageParam : 1), pageCount)
  const start = (page - 1) * PER_PAGE
  const visible = results.slice(start, start + PER_PAGE)

  const hrefFor = (next: { cat?: string; page?: number }) => {
    const p = new URLSearchParams({ q: query })
    const cat = next.cat ?? filter
    if (cat) p.set('cat', cat)
    if ((next.page ?? 1) > 1) p.set('page', String(next.page))
    return `/search?${p}`
  }

  return (
    <PageContainer className="py-8 md:py-10">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
      <div className="mt-4 max-w-[820px]">
        <h1 className="font-heading text-3xl leading-9 tracking-[-0.03em] md:text-[44px] md:leading-[50px]">Search results</h1>
        <SearchBox key={query} initialQuery={query} variant="page" suggest={false} className="mt-6" />

        {query && (
          <p role="status" className="mt-7 text-muted-foreground">
            {results.length > 0 ? (
              <>
                <strong className="font-semibold text-foreground">{results.length === 1 ? '1 article' : `${results.length} articles`}</strong> match “{query}”
                {filter && ` in ${getCategory(filter)?.name}`}
              </>
            ) : (
              `No articles match “${query}”. Try a shorter word or a different term.`
            )}
          </p>
        )}

        {visible.length > 0 && (
          <ol className="mt-2">
            {visible.map((article) => (
              <Result key={article.slug} article={article} query={query} />
            ))}
          </ol>
        )}

        {results.length > PER_PAGE && (
          <nav aria-label="Pagination" className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {start + 1}–{Math.min(start + PER_PAGE, results.length)} of {results.length}
            </span>
            <span className="flex flex-wrap gap-2">
              {page > 1 && (
                <Link to={hrefFor({ page: page - 1 })} className="inline-flex min-h-11 items-center rounded-full border bg-card px-4 font-medium hover:bg-muted">
                  ← Previous
                </Link>
              )}
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to={hrefFor({ page: n })}
                  aria-current={n === page ? 'page' : undefined}
                  aria-label={`Page ${n}`}
                  className={cn(
                    'grid min-h-11 min-w-11 place-items-center rounded-full border font-semibold',
                    n === page ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted',
                  )}
                >
                  {n}
                </Link>
              ))}
              {page < pageCount && (
                <Link to={hrefFor({ page: page + 1 })} className="inline-flex min-h-11 items-center rounded-full border bg-card px-4 font-medium hover:bg-muted">
                  Next →
                </Link>
              )}
            </span>
          </nav>
        )}

        {(!query || results.length === 0) && (
          <div className="mt-10 space-y-8">
            <section aria-labelledby="popular-title">
              <h2 id="popular-title" className="font-heading text-xl">
                Popular searches
              </h2>
              <div className="-mx-4 mt-3 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible">
                {POPULAR_SEARCHES.map((term) => (
                  <Link key={term} to={`/search?q=${encodeURIComponent(term)}`} className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border bg-card px-4 text-sm hover:bg-muted">
                    {term}
                  </Link>
                ))}
              </div>
            </section>
            <section aria-labelledby="browse-title">
              <h2 id="browse-title" className="mb-3 font-heading text-xl">
                Browse by category
              </h2>
              <nav aria-labelledby="browse-title">
                <CategoryNav />
              </nav>
            </section>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
