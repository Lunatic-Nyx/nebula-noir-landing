import type { Category } from '@/lib/types'

/** Code defaults used in Demo Mode and as the initial gallery seed. */
const DEFAULT_CATEGORIES: Category[] = [
  { slug: 'chokers', label: 'Chokers', labelEn: 'Chokers', sortOrder: 1 },
  { slug: 'bracelets', label: 'Armbänder', labelEn: 'Bracelets', sortOrder: 2 },
  { slug: 'rings', label: 'Ringe', labelEn: 'Rings', sortOrder: 3 },
  { slug: 'earrings', label: 'Ohrringe', labelEn: 'Earrings', sortOrder: 4 },
  { slug: 'accessories', label: 'Accessoires', labelEn: 'Accessories', sortOrder: 5 },
]

export const fixtureCategories: Category[] = DEFAULT_CATEGORIES

/**
 * Label resolution order:
 * 1. the DB `label_en`/`label` (operator-editable, authoritative),
 * 2. the i18n override/default for `categories.<slug>` (legacy/Demo),
 * 3. the raw slug.
 */
export function resolveCategoryLabel(
  t: (path: string, vars?: Record<string, string | number>) => string,
  locale: 'de' | 'en',
  category: Pick<Category, 'slug' | 'label' | 'labelEn'>
): string {
  const dbLabel = locale === 'en' ? category.labelEn || category.label : category.label
  if (dbLabel && dbLabel.trim().length > 0) return dbLabel
  const key = `categories.${category.slug}`
  const translated = t(key)
  return translated === key ? category.slug : translated
}
