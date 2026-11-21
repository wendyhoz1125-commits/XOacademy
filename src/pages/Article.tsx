import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArticleBody, ArticleMeta, CategoryArticleNav, Crumbs, Kicker, PageContainer, useTitle } from '@/components/shared'
import { articlesIn, categoryArt, getArticle, getCategory, groupOf, type Article as ArticleType } from '@/lib/content'
import { rememberArticle } from '@/lib/recent'
import { cn } from '@/lib/utils'
import { NotFound } from '@/pages/NotFound'

function SiblingLink({ article, direction }: { article?: ArticleType; direction: 'previous' | 'next' }) {
  if (!article) return <span className="hidden sm:block" />
  const isNext = direction === 'next'
  return (
    <Link
      to={`/articles/${article.slug}`}
      className={cn('group block min-h-11 rounded-xl border bg-card p-4.5 hover:bg-muted', isNext && 'sm:col-start-2 sm:text-right')}
    >
      <span className="block text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">{isNext ? 'Next →' : '← Previous'}</span>
      <span className="mt-1 block font-medium group-hover:underline group-hover:underline-offset-4">{article.title}</span>
    </Link>
  )
}

export function Article() {
  const { slug } = useParams()
  const article = getArticle(slug)
  useTitle(article?.title ?? 'Page not found')
  useEffect(() => {
    if (article) rememberArticle(article.slug)
  }, [article])
  if (!article) return <NotFound />

  const category = getCategory(article.categorySlug)
  const siblings = articlesIn(article.categorySlug)
  const index = siblings.findIndex((a) => a.slug === article.slug)
  const { group, position } = groupOf(article)

  return (
    <PageContainer className="py-8 md:py-10">
      <Crumbs
        items={[
          { label: 'Home', to: '/' },
          { label: category?.name ?? '', to: `/categories/${article.categorySlug}` },
          { label: article.title },
        ]}
      />
      <div className="mt-7 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <nav aria-labelledby="in-category" className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-6">
            <p id="in-category" className="mb-2 px-3 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              In this category
            </p>
            <CategoryArticleNav article={article} />
          </nav>
        </aside>

        <article className="min-w-0 max-w-[720px]">
          <header className="relative overflow-hidden rounded-3xl border p-6 md:p-9" style={{ background: categoryArt(article.categorySlug).gradient }}>
            <div aria-hidden className="absolute inset-0 bg-white/55" />
            <div className="relative">
              <Kicker className="text-[#1f4a41]">
                Article {String(position).padStart(2, '0')}
                {group.title && ` · ${group.title}`}
              </Kicker>
              <h1 className="mt-3.5 font-heading text-3xl leading-9 tracking-[-0.03em] md:text-[44px] md:leading-[50px]">{article.title}</h1>
              {article.excerpt && <p className="mt-3.5 text-lg text-[#2d3431] md:text-[19px] md:leading-[30px]">{article.excerpt}</p>}
              <ArticleMeta article={article} className="mt-5" />
            </div>
          </header>

          <div className="mt-7">
            <ArticleBody html={article.html} gradient={categoryArt(article.categorySlug).gradient} />
          </div>

          <nav aria-label="More in this category" className="mt-14 grid gap-3 sm:grid-cols-2">
            <SiblingLink article={siblings[index - 1]} direction="previous" />
            <SiblingLink article={siblings[index + 1]} direction="next" />
          </nav>
        </article>
      </div>
    </PageContainer>
  )
}
