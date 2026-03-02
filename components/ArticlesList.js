import styles from './Articles.module.css'
import ArticleCard from './ArticleCard'

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
          : list.map((it, i) => (
              <ArticleCard
                key={it._id || i}
                title={it.title}
                image={it.mainImage}
                slug={it.slug?.current}
                publishedAt={it.publishedAt}
                category={it.category}
                author={it.author}
              />
            ))}
      </div>
      {showAllButton && (
        <a href="/articles" className={styles.allButton}>
          Все статьи
        </a>
      )}
    </div>
  )
}
