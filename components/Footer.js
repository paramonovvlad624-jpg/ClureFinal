import Link from 'next/link'
import styles from './Footer.module.css'

const BG_URL = '/images/bg.png'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Blurred background */}
      <div className={styles.bg} aria-hidden="true">
        <img src={BG_URL} alt="" className={styles.bgImg} />
        <div className={styles.bgOverlay} />
      </div>

      {/* Content */}
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Clure home">
          Clure.
        </Link>

        <div className={styles.links}>
          <div className={styles.col}>
            <span className={styles.label}>ссылки</span>
            <ul className={styles.list}>
              <li><Link href="/articles">Статьи</Link></li>
              <li><Link href="/playlists">Плейлисты</Link></li>
              <li><Link href="/about">О нас</Link></li>
            </ul>
          </div>
          <div className={styles.col}>
            <span className={styles.label}>связь</span>
            <ul className={styles.list}>
              <li><a href="https://t.me/cluremag" target="_blank" rel="noopener noreferrer">Telegram</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
