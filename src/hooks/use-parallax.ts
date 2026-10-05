import { useEffect, useRef, useState } from 'react'

export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.scrollY
      const elementTop = rect.top + scrolled
      const elementHeight = rect.height
      const windowHeight = window.innerHeight

      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const relativeScroll = scrolled - elementTop + windowHeight
        setOffset(relativeScroll * speed)
      }
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [speed])

  return { ref, offset }
}

export function useScrollTrigger(threshold: number = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return { ref, isVisible }
}
