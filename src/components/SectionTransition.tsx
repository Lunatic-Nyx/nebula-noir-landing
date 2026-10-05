'use client'

import { useParallax } from '@/hooks/use-parallax'
import { motion } from 'framer-motion'
import { EASE_DECO } from '@/lib/motion'

export function SectionTransition() {
  const { ref, offset } = useParallax(0.3)

  return (
    <div 
      ref={ref} 
      className="relative h-24 flex items-center justify-center overflow-hidden bg-background"
      style={{ 
        transform: `translateY(${offset * 0.05}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: EASE_DECO }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-foreground to-transparent opacity-30"
      />

      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5, ease: EASE_DECO }}
        className="relative z-10 bg-background px-6"
      >
        <span className="text-4xl text-foreground spark-theme-bioshock-glow spark-theme-moon-symbol">
          ☾
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.5, 0] }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent"
      />
    </div>
  )
}
