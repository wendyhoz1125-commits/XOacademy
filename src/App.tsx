import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Article } from '@/pages/Article'
import { Category } from '@/pages/Category'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import { Search } from '@/pages/Search'

// The site can live under a sub-path (GitHub Pages: /XOacademy/). Vite exposes it as BASE_URL.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

// Routes match the live site so existing links keep working.
function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories/:slug" element={<Category />} />
          <Route path="/articles/:slug" element={<Article />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
