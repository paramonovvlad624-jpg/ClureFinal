import { useEffect, useRef } from 'react'

export function useScrollAnimation(options = {}) {
  const ref = useRef(null)
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
  } = options

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay slightly to trigger animation smoothly
          setTimeout(() => {
            entry.target.classList.add('animate-in')
          }, 100)
          if (triggerOnce) {
            observer.unobserve(entry.target)
          }
        } else if (!triggerOnce) {
          entry.target.classList.remove('animate-in')
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(ref.current)

    // Check if element is already in view on mount
    const rect = ref.current.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(() => {
        ref.current?.classList.add('animate-in')
      }, 100)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, rootMargin, triggerOnce])

  return ref
}
