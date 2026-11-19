import { Link } from 'react-router-dom'
import { SearchBox } from '@/components/SearchBox'
import { CategoryArt, GridMotif, LoginBanner, PageContainer, TaskList, useTitle } from '@/components/shared'
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
            How can we help you plan today?
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-hero-muted">
            Guides for scheduling simulators, instructors and classrooms, from your first resource to daily changes.
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
              All sections
            </h2>
            <span className="text-[13px] text-muted-foreground">{categories.length} sections · start with 01</span>
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
                      Section {categoryNumber(category.slug)} · {pluralArticles(articlesIn(category.slug).length)}
                    </span>
                    <span className="mt-1 block font-heading text-[17px] leading-6 font-medium">{category.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <ol className="mt-7 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
            {categories.map((category) => (
              <li key={category.slug} className="flex">
                <Link
                  to={`/categories/${category.slug}`}
                  className="group flex w-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-[0_10px_30px_rgb(45_52_49/0.1)] focus-visible:-outline-offset-2"
                >
                  <CategoryArt slug={category.slug} className="h-42 flex-col justify-between p-5">
                    <h3 className="relative font-heading text-[21px] leading-[26px] font-medium tracking-[-0.01em] text-[#1f2523]">{category.name}</h3>
                  </CategoryArt>
                  <span className="flex flex-1 flex-col gap-2 p-5">
                    <span className="self-start rounded-full bg-primary px-2.5 py-1 text-xs font-semibold tracking-[0.06em] text-primary-foreground uppercase">
                      Section {categoryNumber(category.slug)}
                    </span>
                    <span className="text-[15px] leading-[22px] text-muted-foreground">{category.description}</span>
                    <span className="mt-auto pt-2 text-xs text-muted-foreground">{pluralArticles(articlesIn(category.slug).length)}</span>
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

        <LoginBanner />
      </PageContainer>
    </>
  )
}
