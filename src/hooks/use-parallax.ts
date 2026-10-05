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
    const currentRef = ref.current
    if (!currentRef) return

    // A section taller than the viewport can never reach a ratio threshold of
    // `threshold` (e.g. 6075px section in a 568px viewport → max ratio 0.093).
    // Clamp to a reachable ratio so tall sections still reveal on scroll, while
    // short sections keep their original timing.
    const observerFor = (element: Element) => {
      const height = (element as HTMLElement).offsetHeight || 1
      const reachable = Math.min(1, window.innerHeight / height)
      const safeThreshold = Math.min(threshold, Math.max(0.01, reachable * 0.9))
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsVisible(true)
        },
        { threshold: safeThreshold }
      )
      observer.observe(element)
      return observer
    }

    let observer = observerFor(currentRef)

    const onResize = () => {
      observer.disconnect()
      observer = observerFor(currentRef)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [threshold])

  return { ref, isVisible }
}
