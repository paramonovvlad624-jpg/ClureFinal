import Head from 'next/head'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import client from '../../lib/sanity'
import urlFor from '../../lib/imageUrl'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import styles from '../../components/InterviewPage.module.css'

const portableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.rtParagraph}>{children}</p>,
    h2: ({ children }) => <h2 className={styles.rtH2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.rtH3}>{children}</h3>,
    blockquote: ({ children }) => <blockquote className={styles.rtBlockquote}>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" className={styles.rtLink}>
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      const src = urlFor(value).width(1000).auto('format').url()
      return (
        <figure className={styles.rtFigure}>
          <img src={src} alt={value.alt || ''} className={styles.rtImage} />
          {value.caption && <figcaption className={styles.rtCaption}>{value.caption}</figcaption>}
        </figure>
      )
    },
  },
}

const INTERVIEW_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/interviews', label: 'Интервью' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
  { href: '/theory-fest', label: 'Theory Fest' },
]

const queryBySlug = `*[_type == "interview" && slug.current == $slug][0]{
  _id, title, excerpt, body, publishedAt, mainImage, guest, interviewer->{name}
}`

const queryMore = `*[_type == "interview" && slug.current != $slug] | order(publishedAt desc)[0...3]{
  _id, title, slug, publishedAt, mainImage, guest
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
  const slugs = await client.fetch(`*[_type == "interview" && defined(slug.current)]{ "slug": slug.current }`)
  const paths = (slugs || []).map((s) => ({ params: { slug: s.slug } }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const slug = params.slug
  const [interview, moreInterviews] = await Promise.all([
    client.fetch(queryBySlug, { slug }),
    client.fetch(queryMore, { slug }),
  ])

  if (!interview) {
    return { notFound: true }
  }

  return {
    props: { interview, moreInterviews: moreInterviews || [], slug },
  }
}

export default function InterviewPage({ interview, moreInterviews = [], slug }) {
  const imageUrl = interview.mainImage
    ? urlFor(interview.mainImage).width(1600).height(900).auto('format').url()
    : null

  return (
    <>
      <Head>
        <title>{interview.title} — Clure</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://clure.ru/" },
                { "@type": "ListItem", "position": 2, "name": "Interviews", "item": "https://clure.ru/interviews" },
                { "@type": "ListItem", "position": 3, "name": interview.title, "item": `https://clure.ru/interviews/${slug}` }
              ]
            })
          }}
        />
      </Head>
      <Navigation links={INTERVIEW_NAV} />

      <div className={styles.page}>
        <main className={styles.body}>
          {/* ── Header ── */}
          <header className={styles.header}>
            <h1 className={styles.interviewTitle}>{interview.title}</h1>
            <div className={styles.metaRow}>
              {interview.guest && <span>{interview.guest}</span>}
              {interview.guest && interview.publishedAt && <span>·</span>}
              {interview.publishedAt && <span>{formatDate(interview.publishedAt)}</span>}
            </div>
          </header>

          {/* ── Excerpt (Short Description) ── */}
          {interview.excerpt && (
            <div className={styles.excerptSection}>
              <p className={styles.excerptText}>{interview.excerpt}</p>
            </div>
          )}

          {/* ── Hero image ── */}
          {imageUrl && (
            <div className={styles.heroImage}>
              <img src={imageUrl} alt={interview.title} className={styles.heroImg} />
            </div>
          )}

          {/* ── Interview metadata ── */}
          {(interview.guest || interview.interviewer?.name) && (
            <div className={styles.intro}>
              <span className={styles.introLabel}>
                {interview.guest && <span className={styles.infoSpan}><strong>Гость:</strong> {interview.guest}</span>}
                {interview.guest && interview.interviewer?.name && <span className={styles.separator}>·</span>}
                {interview.interviewer?.name && <span className={styles.infoSpan}><strong>Интервьюер:</strong> {interview.interviewer.name}</span>}
              </span>
            </div>
          )}

          {/* ── Body content ── */}
          <article className={styles.content}>
            {interview.body && <PortableText value={interview.body} components={portableTextComponents} />}
          </article>

          {/* ── Related interviews ── */}
          {moreInterviews.length > 0 && (
            <section className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>Другие интервью</h2>
              <div className={styles.relatedGrid}>
                {moreInterviews.slice(0, 3).map((interview) => (
                  <Link
                    key={interview._id}
                    href={`/interviews/${interview.slug.current}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {interview.mainImage && (
                      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: '4px' }}>
                        <img
                          src={urlFor(interview.mainImage).width(400).height(400).auto('format').url()}
                          alt={interview.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <span style={{ fontSize: '14px', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>
                      {interview.guest}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: '500', lineHeight: '1.2' }} className={styles.title}>
                      {interview.title}
                    </span>
                    {interview.publishedAt && (
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                        {formatShortDate(interview.publishedAt)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Buy ticket button ── */}
          <div className={styles.ticketButtonSection}>
            <a href="/theory-fest" className={styles.ticketButton}>
              Купить Билет
            </a>
          </div>
        </main>
      </div>

      <Footer />
    </>
  )
}
