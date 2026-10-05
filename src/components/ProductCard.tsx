'use client'

import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from '@phosphor-icons/react'
import { ArtDecoCorner } from './ArtDecoCorner'
import { useT } from '@/i18n/context'
import { IMAGE_FILTER } from '@/lib/design'

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
  categoryLabel?: string
}

export function ProductCard({ product, onViewDetails, categoryLabel }: ProductCardProps) {
  const t = useT()
  return (
    <div 
      className="group relative bg-card transition-all duration-500 nebula-glow-hover overflow-hidden metallic-border cursor-pointer art-deco-card-hover spark-theme-card-wrapper"
      onClick={() => onViewDetails(product)}
    >
      <div className="spark-theme-card-corners" />
      <ArtDecoCorner position="top-left" size={40} delay={0} />
      <ArtDecoCorner position="bottom-right" size={40} delay={0.1} />
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="aspect-square overflow-hidden bg-muted relative" style={{ filter: IMAGE_FILTER }}>
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
          loading="lazy"
        />
        {product.madeToOrder && (
          <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground uppercase tracking-[0.15em] text-xs nebula-glow">
            {t('catalog.madeToOrder')}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <Eye size={48} weight="bold" className="text-foreground spark-theme-bioshock-glow" />
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6 space-y-3 md:space-y-4 relative z-10">
        <div>
          <h3 className="text-lg md:text-xl lg:text-2xl mb-2 md:mb-3 group-hover:text-foreground transition-colors uppercase tracking-[0.15em] spark-theme-bioshock-glow line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs md:text-sm text-foreground/70 leading-relaxed font-light line-clamp-2">
            {product.description}
          </p>
        </div>

        {product.madeToOrder && product.estimatedDays && (
          <p className="text-xs text-foreground/50 italic uppercase tracking-wider">
            ⧗ {t('catalog.days', { days: product.estimatedDays })}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-4 md:pt-6 border-t border-foreground/20">
          <div className="min-w-0 text-base md:text-lg lg:text-xl font-light text-foreground tracking-wider spark-theme-bioshock-glow truncate">
            {categoryLabel ?? t(`categories.${product.category}`)}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(product)
            }}
            className="shrink-0 bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.2em] font-semibold flex items-center gap-2 transition-all duration-500 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm spark-theme-art-deco-button"
          >
            {t('catalog.details')}
          </Button>
        </div>
      </div>
    </div>
  )
}
