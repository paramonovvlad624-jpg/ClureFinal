import { useState } from 'react'
import Link from 'next/link'
import { useNavigation } from '../context/NavigationContext'
import styles from './Navigation.module.css'

export default function Navigation() {
  const { navLinks, accentColor } = useNavigation()
  const [open, setOpen] = useState(false)

  const accentStyleWithVar = accentColor ? { '--nav-accent': accentColor, '--nav-hover-bg': '#ffffff' } : undefined

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <button
        className={styles.toggle}
        style={accentStyleWithVar}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <span className={`${styles.bar} ${open ? styles.barOpen : ''}`} />
        <span className={`${styles.bar} ${open ? styles.barOpen : ''}`} />
        <span className={`${styles.bar} ${open ? styles.barOpen : ''}`} />
      </button>

      <ul className={`${styles.list} ${open ? styles.listOpen : ''}`}>
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={styles.item}
              style={accentStyleWithVar}
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
