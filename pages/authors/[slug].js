import Head from 'next/head'
import Link from 'next/link'
import client from '../../lib/sanity'
import urlFor from '../../lib/imageUrl'
import slugify from '../../lib/slugify'
import Navigation from '../../components/Navigation'
import ArticlesList from '../../components/ArticlesList'
import Footer from '../../components/Footer'
import styles from '../../components/ArticlePage.module.css'

const AUTHOR_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
]

const queryAllAuthors = `*[_type == "author"]{ _id, name, bio, image }`

const queryArticlesByAuthor = `*[_type == "article" && author._ref == $authorId] | order(publishedAt desc){
  _id, title, slug, publishedAt, mainImage, author->{name, image}
}`

const queryPlaylistCount = `count(*[_type == "playlist" && author._ref == $authorId])`

export async function getStaticPaths() {
  const authors = await client.fetch(queryAllAuthors)
  const paths = (authors || []).map((a) => ({ params: { slug: slugify(a.name) } }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const urlSlug = params.slug
  const allAuthors = await client.fetch(queryAllAuthors)
  const author = (allAuthors || []).find((a) => slugify(a.name) === urlSlug) || null

  if (!author) {
    return { notFound: true, revalidate: 60 }
  }

  const articles = await client.fetch(queryArticlesByAuthor, { authorId: author._id })
  const playlistCount = await client.fetch(queryPlaylistCount, { authorId: author._id })

  return {
    props: { author, articles: articles || [], playlistCount: playlistCount || 0 },
    revalidate: 60,
  }
}

export default function AuthorPage({ author, articles = [], playlistCount = 0 }) {
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
            <img src="/images/bg.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', filter: 'blur(25px)', display: 'block' }} />
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
              <h1 className={styles.articleTitle} style={{ fontSize: 'clamp(48px, 10vw, 90px)', margin: 0 }}>{author.name}</h1>
              {author.bio && (
                <div className={styles.authorBio}>
                  {author.bio.split('\n').filter(Boolean).map((p, i) => (
                    <span key={i}>{p}</span>
                  ))}
                </div>
              )}
            </div>

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

        <main className={styles.body}>

          {/* ── Author's articles ── */}
          {articles.length > 0 && (
            <section style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <div style={{ width: '100%', maxWidth: 900 }}>
                <ArticlesList items={articles} max={100} showAllButton={false} />
              </div>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </>
  )
}
