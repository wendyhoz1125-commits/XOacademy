// Takes a read-only snapshot of the live help center so the prototype runs on real content.
// Usage: node scripts/fetch-content.mjs
import { mkdir, writeFile } from 'node:fs/promises'

const BASE = 'https://helpcenter.xoscheduler.com'
const get = async (path) => {
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

const absolute = (html) => (html ?? '').replace(/src="\/(uploads|api\/media)\//g, `src="${BASE}/$1/`)

const categories = await get('/api/categories')
const articles = []
for (const category of categories) {
  const list = await get(`/api/articles?category=${category.slug}`)
  for (const item of list) {
    const full = await get(`/api/articles/${item.slug}`)
    articles.push({
      slug: full.slug,
      categorySlug: category.slug,
      title: full.title,
      excerpt: full.excerpt,
      html: absolute(full.contentHtml),
      sections: full.contentSections ?? null,
      order: full.orderIndex,
      updatedAt: full.updatedAt,
    })
  }
}

await mkdir('src/data', { recursive: true })
await writeFile(
  'src/data/content.json',
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      categories: categories.map(({ name, slug, description, orderIndex }) => ({
        name,
        slug,
        description,
        order: orderIndex,
      })),
      articles,
    },
    null,
    1,
  ),
)
console.log(`${categories.length} categories, ${articles.length} articles`)
