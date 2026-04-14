import Link from 'next/link'
import styles from './Interviews.module.css'
import InterviewCard from './InterviewCard'

export default function InterviewsList({ items = [], max = 100, showAllButton = false }) {
  const list = (items || []).slice(0, max)
  const showPlaceholders = list.length === 0

  return (
    <div className={styles.wrapper} id="interviews">
      <div className={styles.list}>
        {showPlaceholders
          ? new Array(5).fill(0).map((_, i) => (
              <InterviewCard key={i} title={`Interview ${i + 1}`} guest="Guest Name" />
            ))
          : list.map((it, i) => (
              <InterviewCard
                key={it._id || i}
                title={it.title}
                slug={it.slug?.current}
                publishedAt={it.publishedAt}
                guest={it.guest}
                interviewer={it.interviewer}
              />
            ))}
      </div>
    </div>
  )
}
