import { Link } from 'react-router-dom'
import { PageContainer, useTitle } from '@/components/shared'
import { buttonVariants } from '@/components/ui/button'

export function NotFound() {
  useTitle('Page not found')
  return (
    <PageContainer className="py-16">
      <h1 className="font-heading text-3xl leading-9 tracking-[-0.03em] md:text-[44px] md:leading-[50px]">Page not found</h1>
      <p className="mt-3 max-w-[68ch] text-lg text-muted-foreground">This page may have moved. Search from the home page or browse the categories.</p>
      <Link to="/" className={buttonVariants({ className: 'mt-6 rounded-full px-5 font-semibold' })}>
        Go to the home page
      </Link>
    </PageContainer>
  )
}
