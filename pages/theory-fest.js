import Head from 'next/head'
import Script from 'next/script'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import styles from '../components/TheoryFest.module.css'

const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
]

export default function TheoryFestPage() {
  return (
    <>
      <Head>
        <title>Clure Theory Fest — 1 year anniversary</title>
        <meta name="theme-color" content="#1b40b0" />
        <style>{`
          html, body { background: #1b40b0 !important; }
        `}</style>
      </Head>

      <div className={styles.page}>
        <Navigation links={NAV_LINKS} accentColor="rgba(27, 64, 176, 0.75)" />

        <header className={styles.hero}>
          <h1 className={styles.title}>Clure Theory Fest</h1>
          <p className={styles.subtitle}>1 year anniversary</p>
          <div className={styles.infoRow}>
            <span>18<br className={styles.mobileBr} /> апреля</span>
            <span>москва<span className={styles.serifComma}>,</span><br className={styles.mobileBr} /> <a href="https://t.me/npo_melody" target="_blank" rel="noopener noreferrer" className={styles.infoLink}>нпо мелодия</a></span>
            <span>18+</span>
          </div>
          <div className={styles.tape}>
            <picture>
              <source srcSet={'/images/1-new.webp'} type="image/webp" />
              <img src="/images/1-new.png" alt="" className={`${styles.tapePiece} ${styles.piece1}`} />
            </picture>
            <picture>
              <source srcSet={'/images/2.webp'} type="image/webp" />
              <img src="/images/2.png" alt="" className={`${styles.tapePiece} ${styles.piece2}`} />
            </picture>
            <div className={`${styles.tapePiece} ${styles.piece3}`}> 
              <a href="https://t.me/sudeall" target="_blank" rel="noopener noreferrer" className={styles.papinySlesy}>
                SUDEAL
              </a>
            </div>
            <div className={`${styles.tapePiece} ${styles.piece4}`}>
              <a href="https://t.me/papinyslezyiworldwide" target="_blank" rel="noopener noreferrer" className={`${styles.papinySlesy} ${styles.papinySlesyLong}`}>
                папины слёзы
              </a>
            </div>
          </div>
        </header>

        <div className={styles.ticketSection}>
          <button
            id="buy-ticket-btn"
            type="button"
            className={styles.ticketBtn}
            data-tc-event="69acc131c2a0a8102c515693"
            data-tc-token="eyJhbGciOiJIUzI1NiIsImlzcyI6InRpY2tldHNjbG91ZC5ydSIsInR5cCI6IkpXVCJ9.eyJwIjoiNjlhNzI4NWI4YWQwMTllNzFlODljMjliIn0.7Oreh61Lt5J0lbo4pXAw37BV6uokCjEzuLQNCjcs7ZQ"
          >
            <picture>
              <source srcSet={'/images/Buyticketlong.webp'} type="image/webp" />
              <img src="/images/Buyticketlong.png" alt="Купить билет" className={styles.ticketBtnImg} />
            </picture>
          </button>
        </div>
      </div>

      <Footer overlayColor="#1b40b0" shadowColor="rgba(27, 64, 176, 0.5)" />

      <Script
        src="https://ticketscloud.com/static/scripts/widget/tcwidget.js"
        strategy="lazyOnload"
      />
    </>
  )
}
