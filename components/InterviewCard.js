import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from './Interviews.module.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InterviewCard({ title = 'Interview title', slug = null, publishedAt = null, guest = null }) {
  const router = useRouter()
  const date = formatDate(publishedAt)
  const guestName = guest || 'Guest'

  const handleClick = () => {
    if (slug) router.push(`/interviews/${slug}`)
  }

  return (
    <article
      className={styles.listItem}
      onClick={handleClick}
      style={slug ? { cursor: 'pointer' } : undefined}
    >
      <div className={styles.itemContent}>
        {guestName && <div className={styles.itemGuest}>{guestName}</div>}
        <div className={styles.itemTitle}>{title}</div>
      </div>
      {date && <div className={styles.itemDate}>{date}</div>}
    </article>
  )
}

