import { CategoryManager } from '@/components/admin/CategoryManager'
import { getCategories } from '@/lib/data'
import { isDemoMode } from '@/lib/env'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return <CategoryManager categories={categories} demo={isDemoMode()} />
}
