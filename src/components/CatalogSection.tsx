'use client'

import { useState } from 'react'
import { Category, Product } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { ProductDetailDialog } from './ProductDetailDialog'
import { Button } from '@/components/ui/button'
import { useScrollTrigger } from '@/hooks/use-parallax'
import { motion } from 'framer-motion'
import { useI18n } from '@/i18n/context'
import { resolveCategoryLabel } from '@/lib/categories'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
import { EASE_DECO } from '@/lib/motion'

interface CatalogSectionProps {
  products?: Product[]
  categories?: Category[]
}

export function CatalogSection({ products = [], categories = [] }: CatalogSectionProps) {
  const { locale, t } = useI18n()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const { ref, isVisible } = useScrollTrigger(0.1)

  const categoryLabel = (slug: string) => {
    const category = categories.find((item) => item.slug === slug)
    if (category) return resolveCategoryLabel(t, locale, category)
    const key = `categories.${slug}`
    const translated = t(key)
    return translated === key ? slug : translated
  }

  const filters = [
    { slug: 'all', label: t('categories.all') },
    ...categories.map((category) => ({
      slug: category.slug,
      label: resolveCategoryLabel(t, locale, category),
    })),
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setDetailDialogOpen(true)
  }

  return (
    <section id="catalog" className="py-24 md:py-32 relative overflow-hidden max-w-full" ref={ref} style={{ scrollMarginTop: SCROLL_OFFSET_VAR }}>
      <div className="absolute inset-0 opacity-3">
        <svg className="w-full h-full">
          <defs>
            <pattern id="catalog-pattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
              <circle cx="75" cy="75" r="40" stroke="white" strokeWidth="0.5" fill="none" />
              <circle cx="75" cy="75" r="20" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M 75 0 L 75 150 M 0 75 L 150 75" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#catalog-pattern)" />
        </svg>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={isVisible ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.8, ease: EASE_DECO }}
        >
          <h2 className="mb-6 break-words px-4 text-2xl uppercase tracking-[0.12em] sm:text-3xl sm:tracking-[0.18em] md:mb-8 md:text-4xl md:tracking-[0.25em] lg:text-5xl xl:text-6xl bioshock-glow-animated whitespace-pre-line">
            {t('catalog.title')}
          </h2>
          <div className="art-deco-divider max-w-md mx-auto!" />
          <p className="text-sm md:text-base lg:text-lg text-foreground/70 mt-6 md:mt-10 max-w-2xl mx-auto font-light leading-relaxed px-4">
            {t('catalog.subtitle')}
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 md:mb-16 px-4"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_DECO }}
        >
          {filters.map(category => (
            <Button
                key={category.slug}
                type="button"
                onClick={() => setSelectedCategory(category.slug)}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              className={`max-w-full whitespace-normal uppercase tracking-[0.12em] transition-all duration-500 px-4 py-2 text-xs font-semibold md:px-8 md:py-3 md:text-sm md:tracking-[0.2em] ${
                selectedCategory === category.slug 
                  ? 'bg-foreground text-background border-2 border-foreground bioshock-glow-animated' 
                  : 'border-2 border-foreground/50 bg-transparent text-foreground hover:border-foreground hover:bg-foreground/10'
              }`}
            >
              {category.label}
            </Button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-4">
          {filteredProducts.map((product, index) => (
            <motion.div 
              key={product.id}
              className="h-full"
              initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
              animate={isVisible ? { opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
              transition={{ duration: 0.6, delay: 0.3 + (index * 0.08), ease: EASE_DECO }}
            >
              <ProductCard product={product} onViewDetails={handleViewDetails} categoryLabel={categoryLabel(product.category)} />
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-foreground/60 uppercase tracking-wider">{t('catalog.empty')}</p>
          </div>
        )}
      </div>

      <ProductDetailDialog 
        product={selectedProduct}
        categoryLabel={selectedProduct ? categoryLabel(selectedProduct.category) : undefined}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </section>
  )
}
