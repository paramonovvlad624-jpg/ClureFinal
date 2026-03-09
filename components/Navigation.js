import { useState } from 'react'
import Link from 'next/link'
import styles from './Navigation.module.css'

const DEFAULT_LINKS = [
  { href: '/articles', label: 'Статьи' },
  { href: '/playlists', label: 'Плейлисты' },
  { href: '/about', label: 'О нас' },
]

export default function Navigation({ links = DEFAULT_LINKS, accentColor }) {
  const [open, setOpen] = useState(false)

  const accentStyle = accentColor ? { background: accentColor } : undefined

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <button
        className={styles.toggle}
        style={accentStyle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <span className={`${styles.bar} ${open ? styles.barOpen : ''}`} />
        <span className={`${styles.bar} ${open ? styles.barOpen : ''}`} />
        <span className={`${styles.bar} ${open ? styles.barOpen : ''}`} />
      </button>

      <ul className={`${styles.list} ${open ? styles.listOpen : ''}`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={styles.item}
              style={accentStyle}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
