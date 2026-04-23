import Head from 'next/head'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import styles from '../components/TheoryFest.module.css'

const MEROPRIYATIYA_NAV = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/interviews', label: 'Интервью' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
]

export default function MeropriyatiyaPage() {
  return (
    <>
      <Head>
        <title>Мероприятия — Clure</title>
      </Head>
      <Navigation links={MEROPRIYATIYA_NAV} />
      <Hero title="Мероприятия." fontFamily="sans" scrollTarget="events" />

      <section className={styles.page} style={{ minHeight: 'auto' }} id="events">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5vw', padding: '40px 24px', textAlign: 'center' }}>
          <Link href="/theory-fest" style={{ textDecoration: 'none' }}>
            <h2 className={styles.title} style={{ fontSize: 'clamp(36px, 7vw, 110px)', margin: 0, cursor: 'pointer' }}>Clure Theory Fest</h2>
          </Link>
          <div className={styles.infoRow} style={{ marginTop: 0 }}>
            <span>18<br className={styles.mobileBr} /> апреля</span>
            <span>москва<span className={styles.serifComma}>,</span><br className={styles.mobileBr} /> <a href="https://t.me/npo_melody" target="_blank" rel="noopener noreferrer" className={styles.infoLink}>нпо мелодия</a></span>
            <span>18+</span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
