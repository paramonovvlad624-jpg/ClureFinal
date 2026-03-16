import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './Hero.module.css'

const BG_URL = '/images/bg.png'

export default function Hero({ title = 'Clure.', fontFamily, scrollTarget = 'articles', shortTitle = false, badgeLeft }) {
  const brandRef = useRef(null)

  useEffect(() => {
    const el = brandRef.current
    if (!el) return

    // Disable parallax on narrow viewports — mobile scroll events are
    // batched during momentum scrolling which makes JS parallax janky.
    const isMobile = () => window.innerWidth <= 600

    let ticking = false
    const onScroll = () => {
      if (isMobile()) return
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          const y = window.scrollY
          const speed = 0.35
          el.style.transform = `translateY(${y * speed}px)`
          el.style.opacity = Math.max(1 - y / 900, 0)
          ticking = false
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      // Reset styles when cleaning up so resizing doesn't leave stale transforms
      el.style.transform = ''
      el.style.opacity = ''
    }
  }, [])

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
          <img src={BG_URL} alt="" className={styles.bgImg} />
        </picture>
      </div>

      {/* Theory Fest banner */}
      <div className={styles.brandWrap}>
        <div
          ref={brandRef}
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
        <Link href="/theory-fest" className={`${styles.festBadge}${shortTitle ? ' ' + styles.festBadgeShortTitle : ''}`} style={badgeLeft ? { left: badgeLeft } : undefined}>
          <picture>
            <source srcSet={'/images/Banner.webp'} type="image/webp" />
            <img src="/images/Banner.png" alt="Clure Theory Fest" className={styles.festBadgeImg} />
          </picture>
        </Link>
      </div>
    </section>
  )
}
