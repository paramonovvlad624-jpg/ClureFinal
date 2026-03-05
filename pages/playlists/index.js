import Head from 'next/head'
import client from '../../lib/sanity'
import Navigation from '../../components/Navigation'
import Hero from '../../components/Hero'
import Footer from '../../components/Footer'
import s from '../../components/Playlists.module.css'

const PLAYLISTS_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/about', label: 'О нас' },
]

const PLATFORM_LABELS = {
  spotify: 'Spotify',
  'apple-music': 'Apple Music',
  'youtube-music': 'YouTube Music',
  'yandex-music': 'Яндекс Музыка',
  other: '',
}

export default function PlaylistsPage({ playlists = [] }) {
  return (
    <>
      <Head>
        <title>Плейлисты — Clure</title>
      </Head>
      <Navigation links={PLAYLISTS_NAV} />
      <Hero title="Плейлисты." fontFamily="sans" scrollTarget="playlists-content" />

      {playlists.length === 0 ? (
        <p className={s.empty}>Скоро здесь появятся плейлисты</p>
      ) : (
        <div id="playlists-content" className={s.list}>
          {playlists.map((p) => (
            <a
              key={p._id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={s.item}
              style={{ border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 16 }}
            >
              <div className={s.info}>
                <span className={s.title}>{p.title}</span>
                {(p.author?.name || p.description) && (
                  <span className={s.description}>
                    {p.author?.name}{p.author?.name && p.description ? ' · ' : ''}{p.description}
                  </span>
                )}
              </div>
              <div className={s.itemSuffix}>
                {p.platform && PLATFORM_LABELS[p.platform] && (
                  <span className={s.platform}>{PLATFORM_LABELS[p.platform]}</span>
                )}
                <span className={s.arrow}>→</span>
              </div>
            </a>
          ))}
        </div>
      )}

      <Footer />
    </>
  )
}

export async function getStaticProps() {
  let playlists = []
  try {
    playlists = await client.fetch(
      '*[_type == "playlist"] | order(order asc, _createdAt desc){_id, title, url, platform, description, author->{name}}'
    )
  } catch (e) {
    // ignore if Sanity is not configured yet
  }
  return { props: { playlists: playlists || [] } }
}
