import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SearchBox } from '@/components/SearchBox'
import { CategoryArt, GridMotif, HelpBanner, PageContainer, TaskList, useTitle } from '@/components/shared'
import {
  articlesIn,
  categories,
  categoryNumber,
  COMMON_TASK_SLUGS,
  getArticle,
  pluralArticles,
  POPULAR_SEARCHES,
  type Article,
} from '@/lib/content'

const heroGlow =
  'radial-gradient(70% 95% at 90% 0%, rgb(79 127 116 / 0.55), transparent 60%), radial-gradient(55% 85% at 0% 100%, rgb(47 93 83 / 0.7), transparent 70%)'

export function Home() {
  useTitle('Help center')
  const tasks = COMMON_TASK_SLUGS.map((slug) => getArticle(slug)).filter((a): a is Article => Boolean(a))

  return (
    <>
      {/* Only the decoration is clipped, so the search suggestions can extend below the banner. */}
      <section className="on-dark relative z-10 bg-hero text-white" style={{ backgroundImage: heroGlow }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <GridMotif className="absolute -top-8 -right-24 size-80 text-hero-accent opacity-20 md:-right-10 md:size-[520px]" />
        </div>
        <PageContainer className="relative py-12 md:py-24">
          <p className="text-xs font-semibold tracking-[0.08em] text-hero-accent uppercase md:text-[13px]">XO Scheduler · Help center</p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl leading-[42px] tracking-[-0.03em] md:text-6xl md:leading-[64px]">
            What Would You Like to Learn Today?
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-hero-muted">
            Explore guides and resources to get to know XO Scheduler, understand its features, and make the most of its tools for scheduling simulators, instructors, and classrooms.
          </p>
          <SearchBox variant="hero" className="mt-8 max-w-[680px]" />
          <p className="mt-4 text-sm text-hero-muted">
            Popular:{' '}
            {POPULAR_SEARCHES.slice(0, 3).map((term, i) => (
              <span key={term}>
                {i > 0 && ' · '}
                <Link to={`/search?q=${encodeURIComponent(term)}`} className="inline-flex min-h-11 items-center text-hero-accent underline underline-offset-4">
                  {term}
                </Link>
              </span>
            ))}
          </p>
        </PageContainer>
      </section>

      <PageContainer className="space-y-14 py-12 md:space-y-[72px] md:py-[72px]">
        <section aria-labelledby="sections-title">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="sections-title" className="font-heading text-2xl leading-8 tracking-[-0.02em] md:text-[32px] md:leading-10">
              All categories
            </h2>
            <span className="text-[13px] text-muted-foreground">{categories.length} categories · start with 01</span>
          </div>

          <ol className="mt-5 space-y-3 sm:hidden">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/categories/${category.slug}`}
                  className="flex min-h-11 items-center gap-3.5 rounded-2xl border bg-card p-3 focus-visible:-outline-offset-2"
                >
                  <CategoryArt slug={category.slug} className="size-16 shrink-0 items-center justify-center rounded-2xl" iconClassName="size-10 rounded-xl [&_svg]:size-5" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold tracking-[0.06em] text-brand uppercase">
                      Category {categoryNumber(category.slug)} · {pluralArticles(articlesIn(category.slug).length)}
                    </span>
                    <span className="mt-1 block font-heading text-[17px] leading-6 font-medium">{category.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <ol className="mt-7 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug} className="flex">
                <Link
                  to={`/categories/${category.slug}`}
                  className="group flex w-full flex-col rounded-3xl border bg-card shadow-[0_1px_2px_rgb(45_52_49/0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#2d3431]/25 hover:shadow-[0_20px_48px_rgb(45_52_49/0.14)] focus-visible:-outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="relative block p-1.5">
                    <CategoryArt slug={category.slug} className="h-28 items-start rounded-[18px] p-4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.5)]" iconClassName="size-12 rounded-2xl bg-white/80 backdrop-blur [&_svg]:size-6" />
                    <span aria-hidden className="absolute top-5.5 right-5.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold tracking-[0.08em] text-foreground tabular-nums backdrop-blur">
                      {categoryNumber(category.slug)}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col px-6 pt-4 pb-6">
                    <h3 className="font-heading text-xl leading-7 font-medium tracking-[-0.01em]">{category.name}</h3>
                    <span className="mt-2 mb-5 line-clamp-3 text-[15px] leading-[22px] text-muted-foreground">{category.description}</span>
                    <span className="mt-auto flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-medium text-muted-foreground">{pluralArticles(articlesIn(category.slug).length)}</span>
                      <span aria-hidden className="grid size-9 place-items-center rounded-full border bg-background transition duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px" />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="tasks-title">
          <h2 id="tasks-title" className="font-heading text-2xl leading-8 tracking-[-0.02em] md:text-[32px] md:leading-10">
            Common tasks
          </h2>
          <div className="mt-4">
            <TaskList items={tasks} />
          </div>
        </section>

        <HelpBanner />
      </PageContainer>
    </>
  )
}
