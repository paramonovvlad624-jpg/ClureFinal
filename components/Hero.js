import Link from 'next/link'
import styles from './Hero.module.css'

const BG_URL = '/images/bg.png'

export default function Hero({ title = 'Clure.', fontFamily, scrollTarget = 'articles', shortTitle = false, badgeLeft }) {


  const brandClass = fontFamily === 'sans'
    ? `${styles.brand} ${styles.brandSans}`
    : styles.brand

  const handleClick = () => {
    const target = document.getElementById(scrollTarget)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className={styles.hero} aria-label="Hero">
      {/* Blurred background image */}
      <div className={styles.bg} aria-hidden="true">
        <picture>
          <source srcSet={BG_URL.replace(/\.png$/i, '.webp')} type="image/webp" />
          <img src={BG_URL} alt="" className={styles.bgImg} width="1920" height="1080" loading="eager" fetchpriority="high" />
        </picture>
      </div>

      {/* Brand title */}
      <div className={styles.brandWrap}>
        <div
          className={brandClass}
          aria-label={title}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleClick() }}
          style={{ cursor: 'pointer' }}
        >
          {fontFamily === 'sans' && title.endsWith('.') ? (
            <>{title.slice(0, -1)}<span className={styles.brandDot}>.</span></>
          ) : (
            title
          )}
        </div>
      </div>
    </section>
  )
}
