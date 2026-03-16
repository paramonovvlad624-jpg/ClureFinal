import Head from 'next/head'
import Link from 'next/link'
import client from '../../lib/sanity'
import urlFor from '../../lib/imageUrl'
import slugify from '../../lib/slugify'
import Navigation from '../../components/Navigation'
import ArticlesList from '../../components/ArticlesList'
import Footer from '../../components/Footer'
import styles from '../../components/ArticlePage.module.css'
import s from '../../components/Playlists.module.css'

const AUTHOR_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
  { href: '/theory-fest', label: 'Theory Fest' },
]

const queryAllAuthors = `*[_type == "author"]{ _id, name, bio, image, spotify }`

const queryArticlesByAuthor = `*[_type == "article" && author._ref == $authorId] | order(publishedAt desc){
  _id, title, slug, publishedAt, mainImage, author->{name, image}
}`

const queryPlaylistCount = `count(*[_type == "playlist" && author._ref == $authorId])`

const queryPlaylistsByAuthor = `*[_type == "playlist" && author._ref == $authorId] | order(order asc, _createdAt desc){
  _id, title, url, platform, description
}`

export async function getStaticPaths() {
  const authors = await client.fetch(queryAllAuthors)
  const paths = (authors || []).map((a) => ({ params: { slug: slugify(a.name) } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const urlSlug = params.slug
  const allAuthors = await client.fetch(queryAllAuthors)
  const author = (allAuthors || []).find((a) => slugify(a.name) === urlSlug) || null

  if (!author) {
    return { notFound: true }
  }

  const articles = await client.fetch(queryArticlesByAuthor, { authorId: author._id })
  const playlistCount = await client.fetch(queryPlaylistCount, { authorId: author._id })
  const playlists = await client.fetch(queryPlaylistsByAuthor, { authorId: author._id })

  return {
    props: { author, articles: articles || [], playlistCount: playlistCount || 0, playlists: playlists || [] },
  }
}

export default function AuthorPage({ author, articles = [], playlistCount = 0, playlists = [] }) {
  const imageUrl = author.image
    ? urlFor(author.image).width(400).height(400).auto('format').url()
    : null

  return (
    <>
      <Head>
        <title>{author.name} — Clure</title>
      </Head>
      <Navigation links={AUTHOR_NAV} />

      <div className={styles.page} style={{ minHeight: 'auto' }}>
        {/* ── Author header (full-width) ── */}
        <header style={{ padding: '120px 30px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden', color: 'var(--color-white)' }}>
          {/* Blurred background */}
          <div style={{ position: 'absolute', top: -60, left: -60, right: -60, bottom: -60, zIndex: 0, pointerEvents: 'none' }}>
            <picture>
              <source srcSet={'/images/bg.webp'} type="image/webp" />
              <img src="/images/bg.png" alt="" width="1600" height="900" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', filter: 'blur(25px)', display: 'block' }} />
            </picture>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%',
            maxWidth: 900,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Row 1: avatar + name + bio */}
            <div className={styles.authorRow}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={author.name}
                  className={styles.authorAvatar}
                />
              )}
              <h1 className={styles.articleTitle} style={{ fontSize: 'clamp(48px, 10vw, 90px)', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 900, letterSpacing: '-0.02em' }}>{author.name}</h1>
            </div>

            {/* Spotify link */}
            {author.spotify && (
              <a
                href={author.spotify}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 20px',
                  borderRadius: 20,
                  background: 'rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                Spotify
              </a>
            )}

            {/* Row 2: stats (centered) */}
            <div className={styles.authorStats}>
              <div className={styles.authorStat}>
                <span className={styles.authorStatNum}>
                  {articles.length}
                </span>
                {articles.length === 1 ? 'статья' : articles.length >= 2 && articles.length <= 4 ? 'статьи' : 'статей'}
              </div>
              <div className={styles.authorStat}>
                <span className={styles.authorStatNum}>
                  {playlistCount}
                </span>
                {playlistCount === 1 ? 'плейлист' : playlistCount >= 2 && playlistCount <= 4 ? 'плейлиста' : 'плейлистов'}
              </div>
            </div>

          </div>
        </header>

        {/* ── Author's articles (full-width, same as home) ── */}
        {articles.length > 0 && (
          <ArticlesList items={articles} max={100} showAllButton={false} />
        )}

        <main className={styles.body} style={{ paddingTop: 10, paddingBottom: 10 }}>

          {/* ── Author's playlists ── */}
          {playlists.length > 0 && (
            <section style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
              <div 
                className={s.list} 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.06)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: 16, 
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {playlists.map((p, i) => (
                  <a
                    key={p._id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.item}
                    style={{ 
                      background: 'transparent',
                      borderBottom: i === playlists.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 0
                    }}
                  >
                    <div className={s.info}>
                      <span className={s.title}>{p.title}</span>
                      {p.description && (
                        <span className={s.description}>{p.description}</span>
                      )}
                    </div>
                    <div className={s.itemSuffix}>
                      {p.platform && (
                        <span className={s.platform}>
                          {{
                            spotify: 'Spotify',
                            'apple-music': 'Apple Music',
                            'youtube-music': 'YouTube Music',
                            'yandex-music': 'Яндекс Музыка',
                          }[p.platform] || ''}
                        </span>
                      )}
                      <span className={s.arrow}>→</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <div>
        <Footer />
      </div>
    </>
  )
}
