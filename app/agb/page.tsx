import type { Metadata } from 'next'
import { LegalPage, legalPageMetadata } from '@/components/LegalPage'

export function generateMetadata(): Promise<Metadata> {
  return legalPageMetadata('agb')
}

export default function Page() {
  return <LegalPage section="agb" />
}
