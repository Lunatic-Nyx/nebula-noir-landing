# Product Requirements — Nebula Noir Landing

**Status:** live product (post Spark/Vite). **Last reviewed:** 2026-10-07

This document replaces the original Spark e-commerce PRD (cart, checkout, occult/Art Deco copy). Visual chrome from that era is frozen; the product and words are not.

## Problem

Nebula Noir needs a brand surface that shows handmade Cybergoth / Industrial jewelry, upcoming stands, Instagram, and a way to ask for custom work — without running shop, cart, or payments on this domain. Buying stays on Etsy.

## Audience

Black scene, cosplay, nerd culture, festivals, club nights. Copy is hard and technical: faux leather, PVC, heavy chains, rivets, oversized rings, fluorescent neon. No Art Deco, 1920s, occult, or mystical wording.

## In scope

| Surface | Behavior |
|---|---|
| Intro | Loading screen on every visit to `/` |
| Hero | Existing layout; optional muted scroll-scrub video |
| Philosophy | CMS `brand_info` (or fixtures in Demo Mode) |
| Events | Published upcoming stands only |
| Gallery | Category filters, detail dialog, inquiry CTA — no price, no cart; optional per-product notice plus a global product notice in the dialog |
| Instagram | Cached posts from Instagram Login API (`instagram_business_basic`) |
| Contact | Name, email, message → `contact_inquiries`; best-effort notification email via Resend (`RESEND`) |
| Legal | Routes with `site_config.legal` overrides, fallback to code defaults; editable in admin (DE/EN, HTML): Impressum, Datenschutz, AGB, Widerruf, Versand, Custom Orders, Produkthinweise, Über uns |
| i18n | DE default, EN cookie `nn-locale`; `site_config.translations` overrides editable in admin |
| Fonts | Self-hosted Poiret One + Montserrat from `public/fonts/`, preloaded; no third-party font request, no cookie banner |
| Admin | Auth + `profiles.role = 'admin'`: dashboard, gallery, events, brand texts, categories, site/i18n/legal content, inquiries, IG sync, hero video, encrypted API keys, health |
| Demo Mode | Missing Supabase public env → fixtures, mutation toasts |

## Out of scope

- Shopping cart, checkout, on-site prices, stock
- Facebook Login, Messenger, Instagram publishing
- Public user accounts
- Replacing Etsy
- Restyling frozen components (see `AGENTS.md` Design Freeze)

## Success criteria

- Design freeze holds: colors, fonts (Poiret One, Montserrat, self-hosted), Framer Motion, existing classNames
- Empty env still renders (Demo Mode)
- Production reads live tables; empty live tables do not fall back to Unsplash/fixtures
- Admin uploads never expose R2 secrets to the client
- Legal links are routes, not dialogs
- Inquiry form does not double-submit; Demo Mode does not pretend a row was stored

## Experience qualities (current)

1. **Industrial** — hardware, neon on black, festival/club use
2. **Direct** — materials named, no mystique
3. **Gallery-first** — look and inquire; buy on Etsy

## Complexity

Medium application: App Router + CMS + object storage + cron, with a large frozen client island for motion.

## Constraints

- Next.js App Router at `app/`; shared UI at `src/`
- Path alias `@/*` → `src/*`
- R2 uploads server-side or presigned PUT (hero only)
- Instagram: `graph.instagram.com` only
- Proprietary license (`LICENSE`)
- Operator how-to: `USER_MANUAL.md`
