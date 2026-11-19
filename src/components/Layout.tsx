import { LogIn, Menu, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { SearchBox } from '@/components/SearchBox'
import { APP_URL, CategoryArticleNav, CategoryNav, GridMotif, PageContainer, XoMark } from '@/components/shared'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { getArticle } from '@/lib/content'
import { cn } from '@/lib/utils'

function Logo() {
  return (
    <Link to="/" aria-label="XO Academy home" className="-mx-1 flex min-h-11 shrink-0 items-center gap-2.5 rounded-md px-1">
      <XoMark className="h-5 w-10" />
      <span className="font-heading text-[22px] tracking-[0.01em]">Academy</span>
    </Link>
  )
}

function LoginButton({ className }: { className?: string }) {
  return (
    <a href={APP_URL} className={cn(buttonVariants(), 'gap-2 rounded-full px-5 font-semibold', className)}>
      <LogIn aria-hidden className="size-4.5" />
      Log in
    </a>
  )
}

function SiteHeader() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const showSearch = pathname !== '/' && pathname !== '/search'
  const article = pathname.startsWith('/articles/') ? getArticle(pathname.split('/')[2]) : undefined

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <PageContainer className="flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {showSearch && <SearchBox key={pathname} variant="header" className="hidden max-w-sm md:block" />}
          <LoginButton className="hidden sm:inline-flex" />
          {showSearch && (
            <Link to="/search" aria-label="Search articles" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'rounded-full md:hidden')}>
              <Search aria-hidden className="size-5" />
            </Link>
          )}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger render={<Button variant="outline" className="rounded-full lg:hidden" />}>
              <Menu aria-hidden className="size-5" />
              Menu
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,88vw)] overflow-y-auto bg-background">
              <SheetHeader>
                <SheetTitle className="font-heading text-lg">Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Menu" className="space-y-6 px-2 pb-8">
                <LoginButton className="mx-3 w-[calc(100%-1.5rem)] sm:hidden" />
                {article && (
                  <div>
                    <p className="mb-2 px-3 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">In this category</p>
                    <CategoryArticleNav article={article} onNavigate={() => setMenuOpen(false)} />
                  </div>
                )}
                <div>
                  <p className="mb-2 px-3 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">All categories</p>
                  <CategoryNav onNavigate={() => setMenuOpen(false)} currentArticleCategory={article?.categorySlug} />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </PageContainer>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="on-dark relative overflow-hidden bg-primary text-primary-foreground">
      <GridMotif className="absolute top-1/2 right-4 size-[68px] -translate-y-1/2 text-white opacity-25 md:right-8 md:size-[84px]" />
      <PageContainer className="relative flex flex-col gap-2 py-8 pr-24 md:flex-row md:items-center md:justify-between md:py-10 md:pr-36">
        <span className="flex items-center gap-2.5">
          <XoMark className="h-4.5 w-9" />
          <span className="font-heading text-xl">Academy</span>
        </span>
        <span className="text-xs text-[#c4ccc8]">© {new Date().getFullYear()} XO Scheduler</span>
      </PageContainer>
    </footer>
  )
}

export function Layout() {
  const { pathname, search, hash } = useLocation()
  const navigationType = useNavigationType()
  const main = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // New pages start at the top with focus on the content. Back and forward keep the browser's own scroll position.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (hash || navigationType === 'POP') return
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [pathname, search, hash, navigationType])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" ref={main} tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
