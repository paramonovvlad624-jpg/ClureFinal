import { useState, useMemo } from 'react'
import Head from 'next/head'
import client from '../../lib/sanity'
import Navigation from '../../components/Navigation'
import Hero from '../../components/Hero'
import ArticlesList from '../../components/ArticlesList'
import Footer from '../../components/Footer'
import filterStyles from '../../components/Filters.module.css'

const ARTICLES_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
]

export default function ArticlesPage({ articles = [] }) {
  const [authorFilter, setAuthorFilter] = useState('all')
  const [dateSort, setDateSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const authors = useMemo(() => {
    const names = [...new Set(articles.map((a) => a.author?.name).filter(Boolean))]
    return names.sort()
  }, [articles])

  const filtered = useMemo(() => {
    let list = [...articles]
    if (authorFilter !== 'all') {
      list = list.filter((a) => a.author?.name === authorFilter)
    }
    list.sort((a, b) => {
      const da = new Date(a.publishedAt || 0)
      const db = new Date(b.publishedAt || 0)
      return dateSort === 'newest' ? db - da : da - db
    })
    return list
  }, [articles, authorFilter, dateSort])

  return (
    <>
      <Head>
        <title>Статьи — Clure</title>
      </Head>
      <Navigation links={ARTICLES_NAV} />
      <Hero title="Статьи." fontFamily="sans" scrollTarget="articles-filter" />

      {/* ── Filters ── */}
      <div id="articles-filter" className={filterStyles.bar}>
        <button
          className={filterStyles.toggle}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <span className={filterStyles.toggleLabel}>Фильтры</span>
          <span className={`${filterStyles.toggleIcon} ${filtersOpen ? filterStyles.toggleIconOpen : ''}`}>+</span>
        </button>
        <div className={`${filterStyles.content} ${filtersOpen ? filterStyles.contentOpen : ''}`}>
        <div className={filterStyles.contentInner}>
        <div className={filterStyles.group}>
          <span className={filterStyles.label}>Автор</span>
          <div className={filterStyles.pills}>
            <button
              className={`${filterStyles.pill} ${authorFilter === 'all' ? filterStyles.active : ''}`}
              onClick={() => setAuthorFilter('all')}
            >
              Все
            </button>
            {authors.map((name) => (
              <button
                key={name}
                className={`${filterStyles.pill} ${authorFilter === name ? filterStyles.active : ''}`}
                onClick={() => setAuthorFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className={filterStyles.group}>
          <span className={filterStyles.label}>Дата</span>
          <div className={filterStyles.pills}>
            <button
              className={`${filterStyles.pill} ${dateSort === 'newest' ? filterStyles.active : ''}`}
              onClick={() => setDateSort('newest')}
            >
              Новые
            </button>
            <button
              className={`${filterStyles.pill} ${dateSort === 'oldest' ? filterStyles.active : ''}`}
              onClick={() => setDateSort('oldest')}
            >
              Старые
            </button>
          </div>
        </div>
        </div>
        </div>
      </div>

      <main style={{ paddingBottom: 0 }}>
        <ArticlesList items={filtered} max={100} showAllButton={false} />
      </main>
      <Footer />
    </>
  )
}

export async function getStaticProps() {
  let articles = []
  try {
    articles = await client.fetch(
      '*[_type == "article"] | order(publishedAt desc){_id, title, excerpt, slug, publishedAt, mainImage, author->{name, slug, image}}'
    )
  } catch (e) {
    // ignore if Sanity is not configured yet
  }
  return { props: { articles: articles || [] }, revalidate: 60 }
}
