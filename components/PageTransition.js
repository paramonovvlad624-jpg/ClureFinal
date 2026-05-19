import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styles from './PageTransition.module.css'

export default function PageTransition({ children }) {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsTransitioning(true)
    }

    const handleRouteChangeComplete = () => {
      setIsTransitioning(false)
    }

    router.events?.on('routeChangeStart', handleRouteChangeStart)
    router.events?.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events?.off('routeChangeStart', handleRouteChangeStart)
      router.events?.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])

  return (
    <div className={`${styles.wrapper} ${isTransitioning ? styles.exiting : styles.entering}`}>
      {children}
    </div>
  )
}
