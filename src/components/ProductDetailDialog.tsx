'use client'

import { Product } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnvelopeSimple, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n, useT } from '@/i18n/context'
import { useSiteConfig } from '@/components/SiteConfigProvider'
import { IMAGE_FILTER } from '@/lib/design'
import { EASE_DECO } from '@/lib/motion'

interface ProductDetailDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryLabel?: string
}

export function ProductDetailDialog({ product, open, onOpenChange, categoryLabel }: ProductDetailDialogProps) {
  const t = useT()
  const { locale } = useI18n()
  const site = useSiteConfig()
  if (!product) return null

  const productNotice = (product.notice ?? '').trim()
  const globalNotice = (
    locale === 'en'
      ? site.productNotice?.en || site.productNotice?.de
      : site.productNotice?.de || site.productNotice?.en
  )?.trim() ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-2 border-foreground bg-background p-0 sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] md:w-[calc(100vw-4rem)] md:max-w-[calc(100vw-4rem)] lg:w-[calc(100vw-6rem)] lg:max-w-6xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">{product.description}</DialogDescription>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
              exit={{ opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
              transition={{ duration: 0.6, ease: EASE_DECO }}
              className="relative flex flex-col h-full"
            >
              <button
                onClick={() => onOpenChange(false)}
                aria-label={t('common.close')}
                className="absolute top-4 right-4 z-50 p-2 bg-background/80 backdrop-blur-sm border border-foreground/30 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                <X size={24} weight="bold" />
              </button>

              <div className="grid flex-1 gap-0 overflow-y-auto overscroll-contain md:grid-cols-2">
                <motion.div 
                  className="relative aspect-square md:aspect-auto bg-muted overflow-hidden md:min-h-[400px]"
                  initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)' }}
                  animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
                  transition={{ duration: 0.8, delay: 0.2, ease: EASE_DECO }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{ filter: IMAGE_FILTER }}
                  />
                  {product.madeToOrder && (
                    <Badge className="absolute top-6 left-6 bg-primary/90 text-primary-foreground uppercase tracking-[0.15em] text-sm nebula-glow px-4 py-2">
                      {t('catalog.madeToOrder')}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </motion.div>

                <motion.div 
                  className="flex flex-col justify-between overflow-y-auto p-5 sm:p-8 md:p-12"
                  initial={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
                  animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE_DECO }}
                >
                  <div>
                    <motion.h2 
                      className="mb-6 break-words text-2xl uppercase tracking-[0.12em] sm:text-3xl sm:tracking-[0.16em] md:text-4xl md:tracking-[0.2em] lg:text-5xl bioshock-glow-animated"
                      initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 0.5, delay: 0.4, ease: EASE_DECO }}
                    >
                      {product.name}
                    </motion.h2>

                    <motion.div 
                      className="art-deco-divider mb-8"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5, ease: EASE_DECO }}
                    />

                    <motion.p 
                      className="text-base md:text-lg text-foreground/80 leading-relaxed mb-8 font-light"
                      initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 0.5, delay: 0.6, ease: EASE_DECO }}
                    >
                      {product.description}
                    </motion.p>

                    {product.madeToOrder && product.estimatedDays && (
                      <motion.div 
                        className="mb-8 p-4 border-l-2 border-primary bg-primary/5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.7, ease: EASE_DECO }}
                      >
                        <p className="text-sm text-foreground/70 uppercase tracking-wider">
                          ⧗ {t('catalog.productionTime', { days: product.estimatedDays })}
                        </p>
                        <p className="text-xs text-foreground/50 mt-2 italic">
                          {t('catalog.handmade')}
                        </p>
                      </motion.div>
                    )}

                    <motion.div 
                      className="space-y-4 text-sm text-foreground/60 font-light leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8, ease: EASE_DECO }}
                    >
                      <p className="uppercase tracking-wider">
                        <strong className="text-foreground/90">{t('catalog.materialLabel')}:</strong> {t('catalog.material')}
                      </p>
                      <p className="uppercase tracking-wider">
                        <strong className="text-foreground/90">{t('catalog.originLabel')}:</strong> {t('catalog.origin')}
                      </p>
                      <p className="uppercase tracking-wider">
                        <strong className="text-foreground/90">{t('catalog.categoryLabel')}:</strong> {categoryLabel ?? t(`categories.${product.category}`)}
                      </p>
                    </motion.div>

                    {productNotice || globalNotice ? (
                      <motion.div
                        className="mt-8 p-4 border-l-2 border-primary bg-primary/5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.85, ease: EASE_DECO }}
                      >
                        <p className="text-xs text-foreground/70 uppercase tracking-wider">
                          {t('catalog.notice')}
                        </p>
                        {productNotice ? (
                          <p className="mt-2 whitespace-pre-line text-sm font-light leading-relaxed text-foreground/80">
                            {productNotice}
                          </p>
                        ) : null}
                        {globalNotice ? (
                          <p className="mt-2 whitespace-pre-line text-sm font-light leading-relaxed text-foreground/80">
                            {globalNotice}
                          </p>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </div>

                  <motion.div 
                    className="mt-8 pt-8 border-t-2 border-foreground/20 flex flex-wrap items-center justify-between gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.9, ease: EASE_DECO }}
                  >
                    <div className="min-w-0 break-words text-2xl font-light tracking-wider text-foreground sm:text-3xl md:text-5xl bioshock-glow">
                      {categoryLabel ?? t(`categories.${product.category}`)}
                    </div>
                    <Button
                      asChild
                      className="flex w-full items-center justify-center gap-3 border-2 border-foreground bg-transparent px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-foreground transition-all duration-500 hover:bg-foreground hover:text-background sm:px-8 sm:text-base sm:tracking-[0.2em] lg:w-auto"
                    >
                      <a href="/#contact" onClick={() => onOpenChange(false)}>
                        <EnvelopeSimple size={24} weight="bold" />
                        {t('catalog.inquire')}
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
