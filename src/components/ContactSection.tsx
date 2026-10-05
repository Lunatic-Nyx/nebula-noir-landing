'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useScrollTrigger } from '@/hooks/use-parallax'
import { motion } from 'framer-motion'
import { ArtDecoCorner } from './ArtDecoCorner'
import { ArtDecoAnimatedDivider } from './ArtDecoAnimatedDivider'
import { submitContact } from '@/lib/actions/contact'
import { useT } from '@/i18n/context'
import { SCROLL_OFFSET_VAR } from '@/lib/design'
import { EASE_DECO } from '@/lib/motion'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const { ref, isVisible } = useScrollTrigger(0.1)
  const t = useT()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contact.fillAll'))
      return
    }

    if (!formData.email.includes('@')) {
      toast.error(t('contact.invalidEmail'))
      return
    }

    setSubmitting(true)
    const result = await submitContact(formData)
    setSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }

    if (result.demo) {
      toast.success(t('contact.demoSent'))
    } else {
      toast.success(t('contact.sent'))
    }
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32 relative overflow-hidden max-w-full" ref={ref} style={{ scrollMarginTop: SCROLL_OFFSET_VAR }}>
      <div className="container max-w-4xl mx-auto px-4 md:px-6">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={isVisible ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.8, ease: EASE_DECO }}
        >
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="text-5xl md:text-7xl bioshock-glow-animated">✉</div>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-6 md:mb-8 uppercase tracking-normal sm:tracking-[0.15em] md:tracking-[0.25em] xl:tracking-[0.15em] bioshock-glow-animated px-4 whitespace-pre-line break-words">
            {t('contact.title')}
          </h2>
          <ArtDecoAnimatedDivider className="max-w-md mx-auto" />
          <p className="text-sm md:text-base lg:text-lg text-foreground/70 mt-6 md:mt-8 font-light px-4 leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
           className="relative p-6 md:p-10 lg:p-14 space-y-6 md:space-y-8 border-2 border-foreground/30 bg-background/50 max-w-full overflow-hidden"
          initial={{ opacity: 0, clipPath: 'inset(50% 50%)' }}
          animate={isVisible ? { opacity: 1, clipPath: 'inset(0% 0%)' } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_DECO }}
        >
          <ArtDecoCorner position="top-left" size={50} delay={0.5} />
          <ArtDecoCorner position="bottom-right" size={50} delay={0.6} />
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm uppercase tracking-[0.2em] text-foreground/90">
              {t('contact.name')}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border-0 border-b-2 border-foreground/30 focus:border-foreground rounded-none px-0 text-base transition-all duration-300"
              placeholder={t('contact.namePlaceholder')}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm uppercase tracking-[0.2em] text-foreground/90">
              {t('contact.email')}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background border-0 border-b-2 border-foreground/30 focus:border-foreground rounded-none px-0 text-base transition-all duration-300"
              placeholder={t('contact.emailPlaceholder')}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-sm uppercase tracking-[0.2em] text-foreground/90">
              {t('contact.message')}
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="bg-background border-2 border-foreground/30 focus:border-foreground min-h-[180px] text-base resize-none transition-all duration-300"
              placeholder={t('contact.messagePlaceholder')}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-background uppercase tracking-[0.15em] md:tracking-[0.25em] font-semibold py-4 md:py-6 text-sm md:text-base transition-all duration-500"
          >
            {t('contact.send')}
          </Button>

          <p className="text-center text-xs">
            <a href="/datenschutz" className="text-foreground/50 hover:text-foreground transition-colors underline">
              {t('footer.privacy')}
            </a>
          </p>
        </motion.form>

        <div className="mt-8 md:mt-12 text-center space-y-3 px-4">
          <p className="text-foreground/60 text-xs md:text-sm uppercase tracking-wider">
            {t('contact.leadTime')}
          </p>
          <p className="text-foreground/50 text-xs italic">
            {t('contact.handmade')}
          </p>
        </div>
      </div>
    </section>
  )
}
