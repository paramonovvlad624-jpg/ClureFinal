import Head from 'next/head'
import Link from 'next/link'
import client from '../../lib/sanity'
import urlFor from '../../lib/imageUrl'
import slugify from '../../lib/slugify'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import styles from '../../components/ArticlePage.module.css'

const ARTICLE_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
]

const queryBySlug = `*[_type == "article" && slug.current == $slug][0]{
  _id, title, excerpt, body, publishedAt, mainImage, author->{name, slug, image}, playlist->{title, url, platform}
}`

const queryMore = `*[_type == "article" && slug.current != $slug] | order(publishedAt desc)[0...3]{
  _id, title, slug, publishedAt, mainImage, author->{name, slug}
}`

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function getStaticPaths() {
  const slugs = await client.fetch(`*[_type == "article" && defined(slug.current)]{ "slug": slug.current }`)
  const paths = (slugs || []).map((s) => ({ params: { slug: s.slug } }))
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const slug = params.slug
  const [article, moreArticles] = await Promise.all([
    client.fetch(queryBySlug, { slug }),
    client.fetch(queryMore, { slug }),
  ])

  if (!article) {
    return { notFound: true, revalidate: 60 }
  }

  return {
    props: { article, moreArticles: moreArticles || [] },
    revalidate: 60,
  }
}

export default function ArticlePage({ article, moreArticles = [] }) {
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1600).height(900).auto('format').url()
    : null

  // Split plain-text body into paragraphs
  const paragraphs = (article.body || '')
    .split(/\n/)
    .map((line, i) => <p key={i}>{line || '\u00A0'}</p>)

  return (
    <>
      <Head>
        <title>{article.title} — Clure</title>
      </Head>
      <Navigation links={ARTICLE_NAV} />

      <div className={styles.page}>
        <main className={styles.body}>
          {/* ── Header ── */}
          <header className={styles.header}>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <div className={styles.metaRow}>
              {article.author?.name && (
                <Link href={`/authors/${slugify(article.author.name)}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {article.author.name}
                </Link>
              )}
              {article.author?.name && article.publishedAt && <span>·</span>}
              {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            </div>
          </header>

          {/* ── Hero image ── */}
          {imageUrl && (
            <section className={styles.heroImage}>
              <img
                src={imageUrl}
                alt={article.mainImage?.alt || article.title}
                className={styles.heroImg}
              />
            </section>
          )}

          {/* ── Intro ── */}
          {article.excerpt && (
            <section className={styles.intro}>
              <p className={styles.introText}>{article.excerpt}</p>
            </section>
          )}

          {/* ── Playlist ── */}
          {article.playlist?.url && (
            <section className={styles.playlistSection}>
              <a
                href={article.playlist.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.playlistLink}
              >
                <span className={styles.playlistIcon}>♫</span>
                <span className={styles.playlistText}>
                  <span className={styles.playlistTitle}>{article.playlist.title}</span>
                  <span className={styles.playlistCta}>Слушать плейлист →</span>
                </span>
              </a>
            </section>
          )}

          {/* ── Article body ── */}
          <article className={styles.articleSection}>
            <div className={styles.articleContent}>
              <div className={styles.richText}>{paragraphs}</div>
            </div>
          </article>

          {/* ── More articles ── */}
          {moreArticles.length > 0 && (
            <aside className={styles.moreSection}>
              <h2 className={styles.moreLabel}>Больше статей</h2>
              <div className={styles.moreList}>
                {moreArticles.map((item) => {
                  const img = item.mainImage
                    ? urlFor(item.mainImage).width(600).height(760).auto('format').url()
                    : null
                  return (
                    <Link
                      key={item._id}
                      href={`/articles/${item.slug?.current || ''}`}
                      className={styles.moreCard}
                    >
                      <div className={styles.moreCardImage}>
                        {img && (
                          <img src={img} alt={item.title} className={styles.moreCardImg} />
                        )}
                      </div>
                      <div className={styles.moreCardContent}>
                        <span className={styles.moreCardTitle}>{item.title}</span>
                        <div className={styles.moreCardMeta}>
                          {item.author?.name && <span>{item.author.name}</span>}
                          {item.author?.name && item.publishedAt && <span>·</span>}
                          {item.publishedAt && <span>{formatShortDate(item.publishedAt)}</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </aside>
          )}
        </main>
      </div>

      <Footer />
    </>
  )
}
