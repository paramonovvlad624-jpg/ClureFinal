import { useRouter } from 'next/router'
import Link from 'next/link'
import styles from './Interviews.module.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InterviewCard({ title = 'Interview title', slug = null, publishedAt = null, guest = null, interviewer = null }) {
  const router = useRouter()
  const date = formatDate(publishedAt)

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
        {interviewer?.name && <div className={styles.itemGuest}>Интервьюер · {interviewer.name}</div>}
        <div className={styles.itemTitle}>{guest && <strong>{guest} · </strong>}{title}</div>
      </div>
      {date && <div className={styles.itemDate}>{date}</div>}
    </article>
  )
}

