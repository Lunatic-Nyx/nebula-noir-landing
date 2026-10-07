import { PRODUCTS } from '@/lib/products'
import type { BrandInfo, EventItem, GalleryItem, InstagramPost, Product } from '@/lib/types'

function productsToGallery(products: Product[]): GalleryItem[] {
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    image: p.image,
    alt: p.name,
  }))
}

export const fixtureGallery: GalleryItem[] = productsToGallery(PRODUCTS)

export const fixtureBrandInfo: BrandInfo[] = [
  {
    key: 'mission',
    title: 'Mission',
    body: 'Lautes Statement für die schwarze Szene, Cosplay und Nerdkultur. Keine Massenware.',
  },
  {
    key: 'identity',
    title: 'Identität',
    body: 'Cybergoth, Industrial, Cyberpunk, Dark Alternative. Neon auf Schwarz. Ketten, Nieten, große Ringe.',
  },
  {
    key: 'craft',
    title: 'Handwerk',
    body: 'Kunstleder, PVC, schwere Metallketten, Nieten, große Ringe, fluoreszierendes Neon. Von Hand. Keine Serie.',
  },
  {
    key: 'value_handwerk',
    title: 'Handwerk',
    body: 'Jedes Stück einzeln. Kunstleder, PVC, Ketten, Nieten, Neon – von uns verarbeitet.',
  },
  {
    key: 'value_aesthetik',
    title: 'Look',
    body: 'Schwarz, Metall, fluoreszierendes Neon. Industrial, Clublicht, Subkultur.',
  },
  {
    key: 'value_individualitaet',
    title: 'Statement',
    body: 'Laut tragen. Festivals, Clubs, Szene-Events.',
  },
  {
    key: 'value_inklusivitaet',
    title: 'Szene',
    body: 'Schwarze Szene, Cosplay, Nerdkultur. Jeder Körper, jedes Geschlecht.',
  },
  {
    key: 'quote',
    title: 'Zitat',
    body: 'Für Festivals, Clubnächte und Szene-Events.',
  },
]

export const fixtureEvents: EventItem[] = [
  {
    id: 'wgt-2026',
    title: 'Wave-Gotik-Treffen',
    venue: 'Agra-Messepark',
    city: 'Leipzig',
    startsAt: '2026-05-21T10:00:00+02:00',
    endsAt: '2026-05-25T22:00:00+02:00',
    description: 'Stand vor Ort. Aktuelle Stücke zum Anfassen.',
    url: 'https://www.wave-gotik-treffen.de',
  },
  {
    id: 'mera-2026',
    title: "M'era Luna",
    venue: 'Flugplatz',
    city: 'Hildesheim',
    startsAt: '2026-08-08T10:00:00+02:00',
    endsAt: '2026-08-09T23:00:00+02:00',
    description: 'Festival-Stand. Kollektion und Custom-Beratung.',
    url: 'https://www.meraluna.de',
  },
  {
    id: 'loyg-2026',
    title: 'LOYG Festival',
    venue: 'Bochumer Eventcenter, Rombacher Hütte 6–8',
    city: 'Bochum',
    startsAt: '2026-09-12T14:00:00+02:00',
    endsAt: '2026-09-12T22:00:00+02:00',
    description:
      'Stand im Künstlerbereich. Let Out Your Geek: Nerdkultur, Cosplay, Gaming, Musik. Samstag 14–22 Uhr, letzter Einlass 20 Uhr. Aftershow 22:30–03:30 (ab 18).',
    url: 'https://bochumer-eventcenter.de/',
  },
]

export const fixtureInstagram: InstagramPost[] = [
  '01','02','03','04','05','06','07','08','09','10',
].map((n, i) => ({
  id: `ig-${n}`,
  caption: '@nebula_noir.official',
  mediaType: 'IMAGE',
  mediaUrl: `/demo/instagram/${n}.jpg`,
  permalink: 'https://www.instagram.com/nebula_noir.official/',
  timestamp: new Date(Date.UTC(2026, 7, 1 + i * 3)).toISOString(),
}))
