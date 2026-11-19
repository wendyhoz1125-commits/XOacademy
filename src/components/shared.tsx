import { ArrowRight, LogIn, PlayCircle } from 'lucide-react'
import { Fragment, useEffect, useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { normalizeArticle } from '@/lib/article'
import { articlesIn, categories, categoryArt, getCategory, groupsFor, pluralArticles, type Article } from '@/lib/content'
import { cn } from '@/lib/utils'

// Same destination as "Log In" on xoscheduler.com.
export const APP_URL = 'https://app.xoscheduler.com/'

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | XO Academy`
  }, [title])
}

export function PageContainer({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8', className)}>{children}</div>
}

export function Kicker({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-xs font-semibold tracking-[0.06em] text-brand uppercase', className)}>{children}</p>
}

// Official XO mark from the brand Figma file.
export function XoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 57.23 28.24" fill="currentColor" className={className}>
      <path d="M43.1 .12C35.3.12 28.96 6.43 28.96 14.18s6.34 14.06 14.14 14.06 14.13-6.31 14.13-14.06S50.9.12 43.1.12Zm0 24.16c-5.6 0-10.16-4.53-10.16-10.1S37.5 4.07 43.1 4.07s10.15 4.53 10.15 10.1-4.56 10.1-10.15 10.1Z" />
      <path d="M12.82 14.93 4.63 26.99c-.41.61-1.21.99-2.07.99h-.19c-1.8 0-2.94-1.57-2.07-2.85l7.08-10.3c.37-.52.37-1.15 0-1.68L.31 2.85C-.57 1.57.57 0 2.37 0c.86 0 1.65.37 2.07.98l8.38 12.09c.4.58.4 1.28.01 1.86Z" />
      <path d="m15.25 15.01 8.19 12.06c.41.61 1.21.99 2.07.99h.19c1.8 0 2.94-1.57 2.07-2.85l-7.08-10.3c-.37-.52-.37-1.15 0-1.68l7.08-10.3C28.64 1.65 27.5.08 25.7.08c-.86 0-1.65.37-2.07.98l-8.37 12.09c-.4.58-.41 1.28-.01 1.86Z" />
    </svg>
  )
}

// The tic-tac-toe motif from the brand footer.
export function GridMotif({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 300 300" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M100 20v260M200 20v260M20 100h260M20 200h260" />
      <path d="M130 130l40 40M170 130l-40 40M30 130l40 40M70 130l-40 40M230 130l40 40M270 130l-40 40" strokeLinecap="round" strokeWidth="4" />
      <circle cx="250" cy="50" r="20" strokeWidth="4" />
      <circle cx="250" cy="250" r="20" strokeWidth="4" />
    </svg>
  )
}

// Category artwork. With children (the category name) it adds a white fade at the bottom so the text stays readable.
export function CategoryArt({
  slug,
  className,
  iconClassName,
  children,
}: {
  slug: string
  className?: string
  iconClassName?: string
  children?: React.ReactNode
}) {
  const { gradient, Icon } = categoryArt(slug)
  return (
    <span className={cn('relative flex overflow-hidden', className)} style={{ background: gradient }}>
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 bg-[repeating-linear-gradient(118deg,transparent_0_22px,rgb(255_255_255/0.16)_22px_24px)]',
          children && 'bg-[repeating-linear-gradient(118deg,transparent_0_22px,rgb(255_255_255/0.16)_22px_24px),linear-gradient(to_top,rgb(255_255_255/0.92),rgb(255_255_255/0.45)_42%,transparent_72%)]',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'relative grid size-13 shrink-0 place-items-center rounded-2xl bg-white/75 text-foreground shadow-[0_6px_18px_rgb(45_52_49/0.1)]',
          iconClassName,
        )}
      >
        <Icon className="size-6" strokeWidth={1.7} />
      </span>
      {children}
    </span>
  )
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        {items.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="min-w-0">
              {item.to ? (
                <BreadcrumbLink render={<Link to={item.to} />} className="inline-flex min-h-6 items-center underline underline-offset-4">
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function ArticleMeta({ article, className }: { article: Article; className?: string }) {
  return (
    <span className={cn('flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.04em] uppercase', className)}>
      <span className="rounded-full border px-2.5 py-1 text-muted-foreground">{article.minutes} min read</span>
      {article.hasVideo && (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-brand">
          <PlayCircle aria-hidden className="size-3.5" />
          Video
        </span>
      )}
    </span>
  )
}

export function ArticleList({ items, start }: { items: Article[]; start?: number }) {
  return (
    <ol className="overflow-hidden rounded-2xl border bg-card">
      {items.map((article, index) => (
        <li key={article.slug} className="border-t first:border-t-0">
          <Link
            to={`/articles/${article.slug}`}
            className="group flex min-h-11 items-center gap-4 px-4 py-3.5 hover:bg-muted focus-visible:-outline-offset-2 md:px-5"
          >
            {start !== undefined && (
              <span aria-hidden className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
                {String(start + index).padStart(2, '0')}
              </span>
            )}
            <span className="min-w-0 flex-1 font-medium group-hover:underline group-hover:underline-offset-4">{article.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground uppercase">
              {article.hasVideo && <span className="sr-only">Includes video, </span>}
              {article.minutes} min
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export function TaskList({ items }: { items: Article[] }) {
  return (
    <ul className="border-t">
      {items.map((article) => (
        <li key={article.slug} className="border-b">
          <Link to={`/articles/${article.slug}`} className="group flex min-h-11 items-center justify-between gap-4 px-1 py-4 focus-visible:-outline-offset-2">
            <span className="min-w-0">
              <span className="block font-medium group-hover:underline group-hover:underline-offset-4">{article.title}</span>
              <span className="mt-0.5 block text-sm font-medium text-brand">{getCategory(article.categorySlug)?.name}</span>
            </span>
            <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" strokeWidth={2.2} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function ArticleBody({ html }: { html: string }) {
  const body = useMemo(() => normalizeArticle(html).html, [html])
  return <div className="article-body" dangerouslySetInnerHTML={{ __html: body }} />
}

const navRow = 'flex min-h-11 items-center justify-between gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium text-[#434b47] hover:bg-muted'
const navActive = 'bg-brand/12 text-foreground shadow-[inset_0_0_0_1px_rgb(47_93_83/0.35)] hover:bg-brand/12'

export function CategoryNav({ onNavigate, currentArticleCategory }: { onNavigate?: () => void; currentArticleCategory?: string }) {
  return (
    <ul className="space-y-0.5">
      {categories.map((category) => {
        const count = articlesIn(category.slug).length
        return (
          <li key={category.slug}>
            <NavLink
              to={`/categories/${category.slug}`}
              onClick={onNavigate}
              className={({ isActive }) => cn(navRow, (isActive || currentArticleCategory === category.slug) && navActive)}
            >
              <span className="min-w-0 flex-1">{category.name}</span>
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                <span className="sr-only">, {pluralArticles(count)}</span>
                <span aria-hidden>{count}</span>
              </span>
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

// Topics of the current category, with the current article marked. Used beside articles and in the mobile menu.
export function CategoryArticleNav({ article, onNavigate }: { article: Article; onNavigate?: () => void }) {
  const category = getCategory(article.categorySlug)
  const groups = groupsFor(article.categorySlug)
  const currentGroup = groups.find((g) => g.items.some((a) => a.slug === article.slug))?.title ?? 'all'
  const links = (items: Article[]) => (
    <ul className="ml-3 space-y-0.5 border-l pl-2.5">
      {items.map((a) => (
        <li key={a.slug}>
          <NavLink
            to={`/articles/${a.slug}`}
            onClick={onNavigate}
            className={({ isActive }) => cn(navRow, 'text-sm font-normal', isActive && cn(navActive, 'font-medium'))}
          >
            {a.title}
          </NavLink>
        </li>
      ))}
    </ul>
  )
  return (
    <div>
      <Link to={`/categories/${article.categorySlug}`} onClick={onNavigate} className={cn(navRow, 'font-semibold text-foreground')}>
        <span>{category?.name}</span>
        <span className="text-xs font-normal text-muted-foreground tabular-nums">{articlesIn(article.categorySlug).length}</span>
      </Link>
      {groups.length === 1 ? (
        <div className="mt-1">{links(groups[0].items)}</div>
      ) : (
        <Accordion multiple defaultValue={[currentGroup]} className="mt-1">
          {groups.map((g) => (
            <AccordionItem key={g.title} value={g.title ?? 'all'} className="not-last:border-b-0">
              <AccordionTrigger heading="none" className="min-h-11 items-center rounded-md px-3 py-2.5 text-[15px] font-medium text-[#434b47] hover:bg-muted hover:no-underline">
                {g.title}
              </AccordionTrigger>
              <AccordionContent className="pt-0.5 pb-2 text-base">{links(g.items)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

export function LoginBanner({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="login-title"
      className={cn('on-dark relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl bg-hero p-7 text-white md:p-10', className)}
      style={{
        backgroundImage:
          'radial-gradient(60% 120% at 100% 0%, rgb(79 127 116 / 0.6), transparent 65%), radial-gradient(50% 120% at 0% 100%, rgb(47 93 83 / 0.7), transparent 70%)',
      }}
    >
      <div className="relative min-w-0 flex-[1_1_26rem]">
        <p className="text-xs font-semibold tracking-[0.08em] text-hero-accent uppercase">XO Scheduler</p>
        <h2 id="login-title" className="mt-2.5 font-heading text-2xl leading-8 tracking-[-0.02em] md:text-[32px] md:leading-10">
          Ready to plan? Log in to XO Scheduler
        </h2>
        <p className="mt-2 max-w-xl text-[17px] leading-[26px] text-hero-muted">Put these guides into practice in your own schedule.</p>
      </div>
      <a
        href={APP_URL}
        className="relative inline-flex min-h-13 items-center gap-2.5 rounded-full bg-white px-7 font-semibold text-foreground transition-colors hover:bg-hero-muted"
      >
        <LogIn aria-hidden className="size-5" />
        Log in
      </a>
    </section>
  )
}
