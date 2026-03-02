import Head from 'next/head'
import Link from 'next/link'
import client from '../lib/sanity'
import urlFor from '../lib/imageUrl'
import slugify from '../lib/slugify'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import s from '../components/About.module.css'

const ABOUT_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
]

const BG_URL = '/images/bg.png'

export default function AboutPage({ authors = [] }) {
  return (
    <>
      <Head>
        <title>О нас — Clure</title>
      </Head>
      <Navigation links={ABOUT_NAV} />
      <Hero title="О нас." fontFamily="sans" scrollTarget="about-content" />

      <div id="about-content" className={s.wrapper}>
        <div className={s.bg} aria-hidden="true">
          <img src={BG_URL} alt="" className={s.bgImg} />
        </div>
        <div className={s.content}>
          <p className={s.lead}>
            Clure - это творческое музыкальное объединение, возникшее в Москве в 2025 году.
          </p>
          <p className={s.text}>
            Мы<br />
            организовываем концерты<br />
            пишем статьи<br />
            собираем плейлисты<br />
            снимаем живые выступления<br />
            любим музыку.
          </p>
          <p className={s.text}>
            Designed, assembled, and made in moscow.
          </p>
        </div>

        {authors.length > 0 && (
          <div className={s.content} style={{ marginTop: 10 }}>
            <h2 className={s.heading}>MEET THE TEAM</h2>
            <div className={s.authors}>
              {authors.map((a) => {
                const avatar = a.image
                  ? urlFor(a.image).width(200).height(200).auto('format').url()
                  : null
                return (
                  <Link key={a._id} href={`/authors/${slugify(a.name)}`} className={s.authorCard}>
                    {avatar && (
                      <img src={avatar} alt={a.name} className={s.authorAvatar} />
                    )}
                    <span className={s.authorName}>{a.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}

export async function getStaticProps() {
  let authors = []
  try {
    authors = await client.fetch('*[_type == "author"] | order(name asc){_id, name, image}')
  } catch (e) {
    // ignore
  }
  return { props: { authors: authors || [] }, revalidate: 60 }
}
