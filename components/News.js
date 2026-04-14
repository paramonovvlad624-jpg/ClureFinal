import { useRouter } from 'next/router'
import styles from './News.module.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PLATFORM_LABELS = {
  spotify: 'Spotify',
  'apple-music': 'Apple Music',
  'youtube-music': 'YouTube Music',
  'yandex-music': 'Яндекс Музыка',
  other: '',
}

const TYPE_LABELS = {
  interview: 'ИНТЕРВЬЮ',
  playlist: 'ПЛЕЙЛИСТ',
}

function NewsItem({ item, type }) {
  const router = useRouter()

  if (type === 'interview') {
    const handleClick = () => {
      if (item.slug?.current) router.push(`/interviews/${item.slug.current}`)
    }

    return (
      <article
        className={styles.item}
        onClick={handleClick}
        style={item.slug?.current ? { cursor: 'pointer' } : undefined}
      >
        <div className={styles.typeTag}>{TYPE_LABELS[type]}</div>
        <div className={styles.itemContent}>
          {item.interviewer?.name && <div className={styles.itemMeta}>Интервьюер · {item.interviewer.name}</div>}
          <div className={styles.itemTitle}>{item.guest && <strong>{item.guest} · </strong>}{item.title}</div>
        </div>
        {item.publishedAt && <div className={styles.itemDate}>{formatDate(item.publishedAt)}</div>}
      </article>
    )
  }

  if (type === 'playlist') {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.item}
      >
        <div className={styles.typeTag}>{TYPE_LABELS[type]}</div>
        <div className={styles.itemContent}>
          {(item.author?.name || item.title) && (
            <div className={styles.itemMeta}>
              {item.title}{item.author?.name && item.title ? ' · ' : ''}{item.author?.name}
            </div>
          )}
          <div className={styles.itemTitle}>{item.description}</div>
        </div>
        <div className={styles.itemSuffix}>
          {item.platform && PLATFORM_LABELS[item.platform] && (
            <span className={styles.platform}>{PLATFORM_LABELS[item.platform]}</span>
          )}
          <span className={styles.arrow}>→</span>
        </div>
      </a>
    )
  }

  return null
}

export default function News({ interviews = [], playlists = [], max = 6 }) {
  // Combine and sort items with timestamps
  const combinedItems = [
    ...interviews.map(i => ({ ...i, _type: 'interview', timestamp: new Date(i.publishedAt || 0).getTime() })),
    ...playlists.map(p => ({ ...p, _type: 'playlist', timestamp: new Date(p._createdAt || 0).getTime() }))
  ]
  
  // Sort by timestamp descending
  combinedItems.sort((a, b) => b.timestamp - a.timestamp)
  
  const list = combinedItems.slice(0, max)
  const showPlaceholders = list.length === 0

  return (
    <div className={styles.wrapper} id="news">
      <div className={styles.header}>
        <h2 className={styles.title}>Новое</h2>
      </div>
      <div className={styles.list}>
        {showPlaceholders
          ? new Array(4).fill(0).map((_, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.typeTag}>НОВОСТЬ</div>
                <div className={styles.itemContent}>
                  <div className={styles.itemMeta}>Meta</div>
                  <div className={styles.itemTitle}>News item {i + 1}</div>
                </div>
              </div>
            ))
          : list.map((item, i) => (
              <NewsItem
                key={item._id || i}
                item={item}
                type={item._type === 'interview' ? 'interview' : 'playlist'}
              />
            ))}
      </div>
    </div>
  )
}
