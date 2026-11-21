import { useParams } from 'react-router-dom'
import { ArticleBody, ArticleList, CategoryArt, CategoryNav, Crumbs, Kicker, PageContainer, useTitle } from '@/components/shared'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { articlesIn, categories, categoryNumber, getCategory, groupsFor, pluralArticles } from '@/lib/content'
import { NotFound } from '@/pages/NotFound'

const FAQ_SLUG = 'frequently-asked-questions'
const GROUP_CODES = 'ABCDEFGH'

export function Category() {
  const { slug } = useParams()
  const category = getCategory(slug)
  useTitle(category?.name ?? 'Page not found')
  if (!category) return <NotFound />

  const list = articlesIn(category.slug)
  const minutes = list.reduce((sum, a) => sum + a.minutes, 0)
  const groups = groupsFor(category.slug)
  const isFaq = category.slug === FAQ_SLUG

  return (
    <PageContainer className="py-8 md:py-10">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: category.name }]} />
      <div className="mt-7 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <nav aria-labelledby="categories-nav" className="sticky top-24">
            <p id="categories-nav" className="mb-3 px-3 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              Categories
            </p>
            <CategoryNav />
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          <header className="flex flex-wrap items-center justify-between gap-8">
            <div className="min-w-0 flex-[1_1_22rem]">
              <Kicker>
                Category {categoryNumber(category.slug)} of {String(categories.length).padStart(2, '0')}
              </Kicker>
              <h1 className="mt-3 font-heading text-3xl leading-9 tracking-[-0.03em] md:text-[44px] md:leading-[50px]">{category.name}</h1>
              <p className="mt-3.5 max-w-[68ch] text-lg text-muted-foreground">{category.description}</p>
              <p className="mt-2.5 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                {pluralArticles(list.length)} · about {minutes} min
              </p>
            </div>
            <CategoryArt
              slug={category.slug}
              className="hidden h-[162px] w-[300px] items-center justify-center rounded-2xl md:flex"
              iconClassName="size-21 rounded-3xl [&_svg]:size-10"
            />
          </header>

          {isFaq ? (
            <Accordion className="overflow-hidden rounded-2xl border bg-card">
              {list.map((article) => (
                <AccordionItem key={article.slug} value={article.slug} className="not-last:border-b">
                  <AccordionTrigger heading="h2" className="min-h-11 gap-4 rounded-none px-5 py-4 text-base font-medium hover:bg-muted hover:no-underline">
                    {article.title}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pt-1 pb-5 text-base">
                    <ArticleBody html={article.html} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="space-y-10">
              {groups.map((group, index) => (
                <section key={group.title ?? 'all'} aria-label={group.title ?? 'Articles'}>
                  {group.title && (
                    <h2 className="mb-3 flex items-baseline gap-3 font-heading text-xl leading-7">
                      <span aria-hidden className="text-xs font-semibold text-brand">
                        {GROUP_CODES[index]}
                      </span>
                      {group.title}
                    </h2>
                  )}
                  <ArticleList items={group.items} start={group.start} />
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
