# Theme kit vs live UI

**Last reviewed:** 2026-10-05

The folder `src/themes/nebula-noir-theme/` is a visual kit from the Spark-era theme package. **GitHub Spark is gone.** Class prefix `spark-theme-*` is CSS namespacing, not an SDK.

The live look is frozen. Do not restyle `src/index.css`, `src/styles/theme.css`, or `src/themes/nebula-noir-theme/styles.css`. Do not swap live sections for unused kit slots.

## What is live

| Asset | Used by |
|---|---|
| `styles.css` (`spark-theme-*`) | Imported in `app/layout.tsx` |
| `LoadingScreen.tsx` | `src/components/HomePage.tsx` intro on `/` |
| Aliases `.bioshock-glow`, `.metallic-border`, `.art-deco-*` | Existing landing components |

Live landing tree: `app/page.tsx` → `HomePage` → `HeroSection`, `AboutSection`, `EventsSection`, `CatalogSection`, `InstagramSection`, `ContactSection`, `FooterSection`, `Navigation`, `ArtDecoBackground`, etc.

Fonts: Poiret One and Montserrat are **self-hosted** (`public/fonts/`, `@font-face` in `src/styles/fonts.css`) and preloaded via `<link rel="preload">` in `app/layout.tsx`. Do not switch to `next/font` and do not reintroduce the Google Fonts URL. There is no cookie banner: fonts are same-origin, so no consent is needed. Do not put `class="dark"` on `<html>`.

## What is not live

The unused Spark-era kit slots — `Hero.tsx`, `Navigation.tsx`, `Card.tsx`, `BackgroundEffects.tsx` (canvas lines; live uses `ArtDecoBackground`), theme `SectionDivider.tsx`, `ThemeDemo.tsx` — plus the `index.ts` / `sparkTheme` registry were removed as dead code. The kit folder now contains only `styles.css` and `LoadingScreen.tsx`, the two live assets.

The theme `SectionDivider` was never live; the site uses `SectionTransition` / existing dividers.

## Classes you may reuse on new UI

New admin/legal chrome must match existing section language:

- `bioshock-glow`, `bioshock-glow-animated`
- `metallic-border`
- `art-deco-*`
- `spark-theme-*`
- `nebula-glow-hover`

Moon glyph: wrap `☾` with `spark-theme-moon-symbol` so it opens upward (U). Do not put that class on a node that also runs a transform animation.

## Integration anti-patterns

- Importing theme `Hero` / `Navigation` instead of the frozen live components
- Editing Tailwind className strings on existing elements without a confirmed bug
- Reducing Framer Motion
- Pointing new work at `App.tsx` (there is none; this is App Router)

Operator-facing usage: `USER_MANUAL.md`. Agent rules: `AGENTS.md`.
