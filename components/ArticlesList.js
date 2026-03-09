import Link from 'next/link'
import styles from './Articles.module.css'
import ArticleCard from './ArticleCard'

function FillerCell({ src, alt = '', className }) {
  return (
    <div className={`${styles.filler} ${className || ''}`}>
      <img src={src} alt={alt} className={styles.fillerImg} />
    </div>
  )
}

// fillers for 4-column desktop layout
function getDesktopFillers(count) {
  const empty = (4 - (count % 4)) % 4
  if (empty === 1) return [<FillerCell key="fd1" src="/images/cvetok.png" className={styles.fillerDesktop} />]
  if (empty === 2) return [
    <FillerCell key="fd1" src="/images/daisy-left.png" className={styles.fillerDesktop} />,
    <FillerCell key="fd2" src="/images/daisy-right.png" className={styles.fillerDesktop} />,
  ]
  if (empty === 3) return [
    <FillerCell key="fd1" src="/images/trava1.png" className={styles.fillerDesktop} />,
    <FillerCell key="fd2" src="/images/trava2.png" className={styles.fillerDesktop} />,
    <FillerCell key="fd3" src="/images/trava3.png" className={styles.fillerDesktop} />,
  ]
  return []
}

// fillers for 2-column tablet layout
function getTabletFillers(count) {
  const empty = (2 - (count % 2)) % 2
  if (empty === 1) return [<FillerCell key="ft1" src="/images/cvetok.png" className={styles.fillerTablet} />]
  return []
}

export default function ArticlesList({ items = [], max = 4, showAllButton = true }) {
  const list = (items || []).slice(0, max)
  const showPlaceholders = list.length === 0

  return (
    <div className={styles.wrapper} id="articles">
      <div className={styles.grid}>
        {showPlaceholders
          ? new Array(4).fill(0).map((_, i) => (
              <ArticleCard key={i} title={`Article ${i + 1}`} />
            ))
          : [
              ...list.map((it, i) => (
                <ArticleCard
                  key={it._id || i}
                  title={it.title}
                  image={it.mainImage}
                  slug={it.slug?.current}
                  publishedAt={it.publishedAt}
                  category={it.category}
                  author={it.author}
                />
              )),
              ...getDesktopFillers(list.length),
              ...getTabletFillers(list.length),
            ]}
      </div>
      {showAllButton && (
        <Link href="/articles" className={styles.allButton}>
          Все статьи
        </Link>
      )}
    </div>
  )
}
