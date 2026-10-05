'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE_DECO } from '@/lib/motion'
const logoSvg = '/images/IMG_0085_(1).svg'

interface LoadingScreenProps {
  onLoadingComplete?: () => void
  duration?: number
}

export default function LoadingScreen({ onLoadingComplete, duration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [viewport, setViewport] = useState({ w: 1200, h: 800 })

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setIsComplete(true)
          onLoadingComplete?.()
        }, 800)
      }
    }, 16)

    return () => clearInterval(interval)
  }, [duration, onLoadingComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: EASE_DECO }}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
          style={{ background: 'oklch(0.08 0 0)' }}
        >
          <div className="spark-theme-crt-overlay" />
          <div className="spark-theme-scanline" />

          <svg className="spark-theme-loading-frame-svg">
            <g className="top-left-loading-corner">
              <motion.line
                x1="30"
                y1="30"
                x2="30"
                y2="150"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1="30"
                y1="30"
                x2="150"
                y2="30"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1="45"
                y1="45"
                x2="45"
                y2="120"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1="45"
                y1="45"
                x2="120"
                y2="45"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="top-right-loading-corner">
              <motion.line
                x1={viewport.w - 30}
                y1="30"
                x2={viewport.w - 30}
                y2="150"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1={viewport.w - 150}
                y1="30"
                x2={viewport.w - 30}
                y2="30"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1={viewport.w - 45}
                y1="45"
                x2={viewport.w - 45}
                y2="120"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1={viewport.w - 120}
                y1="45"
                x2={viewport.w - 45}
                y2="45"
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="bottom-right-loading-corner">
              <motion.line
                x1={viewport.w - 30}
                y1={viewport.h - 150}
                x2={viewport.w - 30}
                y2={viewport.h - 30}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1={viewport.w - 150}
                y1={viewport.h - 30}
                x2={viewport.w - 30}
                y2={viewport.h - 30}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1={viewport.w - 45}
                y1={viewport.h - 120}
                x2={viewport.w - 45}
                y2={viewport.h - 45}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1={viewport.w - 120}
                y1={viewport.h - 45}
                x2={viewport.w - 45}
                y2={viewport.h - 45}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="bottom-left-loading-corner">
              <motion.line
                x1="30"
                y1={viewport.h - 150}
                x2="30"
                y2={viewport.h - 30}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0 }}
              />
              <motion.line
                x1="30"
                y1={viewport.h - 30}
                x2="150"
                y2={viewport.h - 30}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
              <motion.line
                x1="45"
                y1={viewport.h - 120}
                x2="45"
                y2={viewport.h - 45}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              />
              <motion.line
                x1="45"
                y1={viewport.h - 45}
                x2="120"
                y2={viewport.h - 45}
                className="frame-line-loading"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
              />
            </g>

            <g className="loading-moon-accents">
              <g transform="rotate(-90 95 95)">
                <motion.text
                  x="95"
                  y="95"
                  className="moon-symbol-loading"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  ☾
                </motion.text>
              </g>
              <g transform={`rotate(-90 ${viewport.w - 95} 95)`}>
                <motion.text
                  x={viewport.w - 95}
                  y="95"
                  className="moon-symbol-loading"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  ☾
                </motion.text>
              </g>
              <g transform={`rotate(-90 ${viewport.w - 95} ${viewport.h - 95})`}>
                <motion.text
                  x={viewport.w - 95}
                  y={viewport.h - 95}
                  className="moon-symbol-loading"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  ☾
                </motion.text>
              </g>
              <g transform={`rotate(-90 95 ${viewport.h - 95})`}>
                <motion.text
                  x="95"
                  y={viewport.h - 95}
                  className="moon-symbol-loading"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                >
                  ☾
                </motion.text>
              </g>
            </g>
          </svg>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: EASE_DECO, delay: 0.3 }}
              className="text-center space-y-6 sm:space-y-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex justify-center"
              >
                <img 
                  src={logoSvg} 
                  alt="Nebula Noir Logo" 
                  className="w-32 h-32 sm:w-48 sm:h-48 object-contain spark-theme-logo-glow"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(102, 51, 153, 0.2))'
                  }}
                />
              </motion.div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-foreground" />
                  <h1 
                    className="text-2xl tracking-[0.4em] uppercase spark-theme-bioshock-glow"
                    style={{ fontFamily: "'Poiret One', cursive" }}
                  >
                    Nebula Noir
                  </h1>
                  <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-foreground" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="text-xs tracking-[0.3em] text-muted-foreground uppercase"
                >
                  Cybergoth Industrial
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="space-y-3"
                >
                  <div className="relative w-[min(20rem,80vw)] h-[3px] bg-border/30 mx-auto overflow-hidden">
                    <motion.div
                      className="absolute inset-0 h-full bg-gradient-to-r from-foreground via-primary to-foreground"
                      style={{ 
                        width: `${progress}%`,
                        boxShadow: '0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(102, 51, 153, 0.3)'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                    
                    <motion.div
                      className="absolute top-0 h-full w-1 bg-foreground"
                      style={{ 
                        left: `${progress}%`,
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="flex items-center justify-between w-[min(20rem,80vw)] mx-auto text-xs tracking-[0.2em] text-muted-foreground"
                  >
                    <span>LOADING</span>
                    <span className="spark-theme-bioshock-glow">{Math.round(progress)}%</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
