import Link from 'next/link'
import styles from './Footer.module.css'

const BG_URL = '/images/bg.png'

export default function Footer({ overlayColor, shadowColor }) {
  return (
    <footer
      className={styles.footer}
      style={shadowColor ? { '--footer-shadow': shadowColor } : undefined}
    >
      {/* Blurred background */}
      <div className={styles.bg} aria-hidden="true">
        <picture>
          <source srcSet={BG_URL.replace(/\.png$/i, '.webp')} type="image/webp" />
          <img src={BG_URL} alt="" className={styles.bgImg} />
        </picture>
        <div className={styles.bgOverlay} style={overlayColor ? { background: overlayColor } : undefined} />
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
              <li><a href="mailto:cluremag@yandex.ru">cluremag@yandex.ru</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
