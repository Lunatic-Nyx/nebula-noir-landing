# Benutzerhandbuch — Nebula Noir

**Stand:** 2026-10-05 · **Produkt:** Galerie- und Marken-Website (kein Shop)

Dieses Handbuch gilt für Besucher der öffentlichen Site und für Betreiberinnen im Admin. Technische Einrichtung steht in `README.md` und `DEPLOYMENT.md`.

Die Oberfläche ist Deutsch (Standard) und Englisch. Labels unten: **DE** / *EN*.

---

## 1. Was die Site ist

Nebula Noir ist Statementschmuck (Cybergoth, Industrial, Cyberpunk, Dark Alternative): Kunstleder, PVC, schwere Ketten, Nieten, große Ringe, fluoreszierendes Neon. Zielgruppe: schwarze Szene, Cosplay, Nerdkultur, Festivals, Clubnächte.

Die Website ist:

- Markenauftritt und Galerie
- Event-Termine (Stände)
- Instagram-Gitter (`@nebula_noir.official`)
- Kontakt / Maßanfertigung
- Rechtstexte (Impressum, Datenschutz, AGB, Widerruf, Versand)

Kaufen bleibt auf **Etsy**: [etsy.com/shop/nebulanoirnn](https://www.etsy.com/shop/nebulanoirnn).

## 2. Was die Site nicht ist

- Kein Warenkorb, kein Checkout, keine Preise in der Galerie
- Kein Instagram-Publishing, kein Facebook Login, kein Messenger
- Kein öffentliches Nutzerkonto (nur Admin-Login)
- Demo Mode speichert nichts in der Cloud

---

## 3. Öffentliche Website

Adresse: Startseite `/`. Unterseiten (Impressum usw.) haben dieselbe Navigation zurück zur Startseite.

### 3.1 Intro (nur `/`)

Beim Aufruf von `/` läuft jedes Mal der Ladebildschirm (ca. 3,5 s): Wortmarke, CRT-Overlay, Rahmen. Währenddessen ist der Body-Scroll gesperrt.

- Nicht wegklicken, nicht scrollen — danach startet die Seite.
- `prefers-reduced-motion`: Animationen werden reduziert; Lenis-Smooth-Scroll ist aus.

### 3.2 Navigation

Oben fixiert:

| Link DE | EN | Ziel |
|---|---|---|
| Kollektion | Collection | `/#catalog` |
| Philosophie | Philosophy | `/#about` |
| Events | Events | `/#events` (nur wenn Termine vorhanden) |
| Instagram | Instagram | `/#instagram` (nur wenn Posts vorhanden) |
| Anfragen | Inquiries | `/#contact` |

Logo und Wortmarke führen nach `/`. Instagram-Icon in der Nav öffnet das offizielle Profil.

Ab Viewport `xl` sind die Textlinks sichtbar. Darunter: Hamburger **Menü** / *Menu*. Tippen auf einen Eintrag schließt das Menü.

Hash-Links rutschen nicht unter die fixe Leiste (`scroll-padding`).

### 3.3 Sprache

Schalter **DE / EN** (Nav, Footer, Admin, Login). Speichert Cookie `nn-locale` (1 Jahr). Standard ohne Cookie: Deutsch. `<html lang>` folgt der Wahl.

Wechsel gilt für Nav, Hero, Philosophie, Kollektion, Events, Instagram-Überschriften, Kontakt, Footer, Login, Admin-Chrome. Rechtstexte bleiben Deutsch (gesetzliche Seiten).

### 3.4 Hero

Oben: Logo, **NEBULA NOIR**, Mond-Trenner, Tagline **Cybergoth Industrial**, Kurztext, zwei CTAs:

- **Kollektion entdecken** / *Explore collection* → `#catalog`
- **Unsere Philosophie** / *Our philosophy* → `#about`

Optional: stummes Hintergrundvideo, das beim Scrollen durch die Timeline scrubbt (kein Player, kein Ton). Ohne Video bleibt das geometrische Hintergrundmuster.

`prefers-reduced-motion`: Video bleibt auf Frame 0.

### 3.5 Philosophie (`#about`)

Mission, Identität, Handwerk, Werte, Zitat. Texte kommen aus `brand_info` (oder Demo-Fixtures). Admin ändert sie unter **Info**.

### 3.6 Events (`#events`)

Nur **veröffentlichte und noch nicht abgelaufene** Termine. Vergangene Stände (z. B. WGT, M’era Luna nach Enddatum) erscheinen auf der Landing nicht.

Karte: Titel, Ort, Zeitraum, Beschreibung, optionaler externer Link **Details**.

Leere Liste: Sektion und Nav-Link entfallen (kein doppelter Trenner vor der Galerie).

### 3.7 Kollektion (`#catalog`)

Filter:

- Alle Stücke / All pieces
- Chokers
- Armbänder / Bracelets
- Ringe / Rings
- Ohrringe / Earrings
- Accessoires / Accessories

Karten: Bild, Titel, Kategorie (kein Euro-Preis), **Details**. Hover (feiner Pointer): Graustufen → Farbe.

Dialog **Details**:

- Bild, Name, Beschreibung
- Material, Herkunft, Kategorie
- **Anfrage senden** / *Send inquiry* springt zu `#contact`
- Kein Warenkorb

### 3.8 Instagram (`#instagram`)

Gitter der gecachten Posts. Klick öffnet den Permalink auf Instagram. Follow-Link: `@nebula_noir.official`.

Leere Tabelle bei konfiguriertem Supabase: Sektion ausgeblendet (keine Fake-Fixtures). Demo Mode: lokale Demo-Bilder.

### 3.9 Anfragen (`#contact`)

Felder: Name, E-Mail, Nachricht. Alle Pflicht. Client- und Server-Prüfung (E-Mail mit `@`, Längenlimits).

- Live: Zeile in `contact_inquiries`, Toast **Nachricht ist raus…**
- Demo: Toast **Demo Mode: Nachricht lokal bestätigt, nicht gespeichert.**
- Doppelklick während des Sendens sendet nicht zweimal.

Hinweis: Maßanfertigungen in der Regel 2–4 Wochen.

### 3.10 Footer und Rechtliches

Spalten Shop / Info / Rechtliches. Etsy öffnet den Shop in einem neuen Tab.

Statische Routen (Site-Chrome, keine Dialoge):

| Pfad | Inhalt |
|---|---|
| `/impressum` | Impressum (§ 5 TMG) — Platzhalter für Name/Adresse ersetzen |
| `/datenschutz` | Datenschutzerklärung |
| `/agb` | AGB |
| `/widerruf` | Widerruf |
| `/versand` | Versand |
| `/custom-orders` | Custom Orders |
| `/ueber-uns` | Über uns |

### 3.11 Darstellung und Bewegung

- Custom Cursor-Glow nur bei feinem Pointer; Touch behält den Systemcursor.
- CRT-Scanline und geometrische Hintergründe sind Teil des Looks (Design Freeze).
- Öffentliche Seiten: Lenis Smooth-Scroll. Dialoge, Sheets, `/admin`, `/login`: natives Scrollen.

---

## 4. Admin

### 4.1 Login — `/login`

E-Mail + Passwort (Supabase Auth). **Eintreten** / *Enter*.

Voraussetzungen für echtes Auth:

1. Supabase-Projekt, Schema `supabase/reset.sql`
2. E-Mail-Provider an
3. Nutzer existiert in `auth.users`
4. `profiles.role = 'admin'` für diese UUID

Ohne Admin-Rolle nach Login: **403 — Kein Admin**. Nicht-eingeloggt auf `/admin`: Redirect nach `/login`.

Passwort zurücksetzen: im Supabase Dashboard (kein Self-Service auf der Site).

### 4.2 Demo Mode

Wenn `NEXT_PUBLIC_SUPABASE_URL` oder `NEXT_PUBLIC_SUPABASE_ANON_KEY` fehlen:

- `/login` → Button führt direkt ins Admin-Preview
- Banner: Speichern deaktiviert
- Uploads und Sync no-op mit Toast
- Öffentliche Seite nutzt Fixtures

Zum Live-Betrieb beide Public-Keys setzen, Service Role nur serverseitig.

### 4.3 Übersicht — `/admin`

Zeigt:

- Demo Mode an/aus
- R2 konfiguriert/fehlt
- Instagram konfiguriert/fehlt

Nav: Übersicht, Galerie, Events, Info, Anfragen, Instagram, Hero-Video, Site (`/`), DE/EN, Logout.

### 4.4 Galerie — `/admin/gallery`

**Upload**

1. Datei: JPEG, PNG, WebP, GIF, max. **10 MB** (SVG wird aus Sicherheitsgründen abgelehnt)
2. Titel (Pflicht), Beschreibung, Kategorie
3. **Hochladen** → Server schreibt nach R2 `gallery/{uuid}.{ext}` und eine Zeile `gallery_images` (`published: true`)
4. Startseite und Admin-Galerie werden revalidiert

Ohne R2: Fehler *R2 ist nicht konfiguriert*.

**Liste**

- **Edit**: Prompt ändert den Titel (Beschreibung/Published/Sort bleiben wie geladen).
- **Delete**: löscht DB-Zeile und R2-Objekt, wenn `r2_key` gesetzt ist.

Unpublished-Schalter gibt es in der UI nicht; öffentlich sichtbar sind nur `published = true`.

### 4.5 Events — `/admin/events`

**Neues Event:** Titel, Venue, Stadt, Start (`datetime-local`, Pflicht), Ende, Beschreibung, URL, Checkbox **Published**.

Gespeichert als ISO-Zeit. Die Landing listet nur published + zukünftig/laufend.

Liste: Titel, Stadt, Venue, **Löschen**. Kein Inline-Edit — zum Ändern neu anlegen oder in Supabase editieren.

### 4.6 Info — `/admin/info`

Ein Formular pro `brand_info`-Key (nicht `hero_video` — das steuert das Video):

| Key | Rolle auf der Site |
|---|---|
| `mission` | Philosophie, Karte Mission |
| `identity` | Philosophie, Identität |
| `craft` | Philosophie, Handwerk |
| `value_handwerk` | Werte |
| `value_aesthetik` | Werte |
| `value_individualitaet` | Werte |
| `value_inklusivitaet` | Werte |
| `quote` | Zitat |

Titel + Body speichern. Copy-Regeln: Cybergoth / Industrial / Cyberpunk / Dark Alternative. Kein Art Deco, 1920er, Okkult, Mystik. Materialien und Szene konkret benennen.

### 4.7 Anfragen — `/admin/inquiries`

Kontaktformular-Eingänge: Name, E-Mail, Nachricht, Zeit.

- **Gelesen** / **Ungelesen** toggelt `read`
- **Löschen** entfernt die Anfrage (DSGVO-Löschung; braucht die `contact_admin_delete`-Policy aus `reset.sql`)
- Anon darf INSERT, nicht SELECT — nur Admins sehen die Liste

Antworten: per eigener Mail an die angegebene Adresse (kein In-App-Mailer).

### 4.8 Instagram — `/admin/instagram`

Button **Jetzt synchronisieren** / *Sync now*:

- Liest Medien über `graph.instagram.com` (`instagram_business_basic`)
- IMAGE, VIDEO-Thumbnail, CAROUSEL erste Still
- Kopiert Stills nach R2 `instagram/…`, wenn R2 da ist (CDN-URLs laufen ab)
- Upsert in `instagram_posts`
- Refresh des Long-Lived Tokens nach `instagram_auth`

Zusätzlich: Vercel Cron täglich 08:00 UTC `GET /api/cron/instagram` mit `CRON_SECRET`.

Ohne Token: kein Graph-Call. Demo: no-op.

### 4.9 Hero-Video — `/admin/hero`

1. Datei MP4 / WebM / MOV, max. **80 MB**
2. Empfohlen: H.264 + AAC, `faststart`, Keyframes alle 0,5–1 s (Scrub)
3. Browser holt Presign (`POST /api/hero/presign`), **PUT** direkt nach R2, dann Bestätigung
4. URL in `brand_info.hero_video`

**Video entfernen** löscht die Zuordnung (und R2, wenn Key bekannt).

Vorrang: `NEXT_PUBLIC_HERO_VIDEO_URL` (Env) schlägt den Admin-Upload.

Große Dateien **nicht** durch die Next.js-Funktion posten (Vercel-Body-Limit ~4,5 MB) — der Presign-Weg ist Pflicht.

### 4.10 Logout

**Logout** / *Logout* beendet die Supabase-Session und geht zu `/login`. In Demo Mode kein Logout-Button.

---

## 5. Routen

### Öffentlich

| Pfad | Funktion |
|---|---|
| `/` | Landing (Intro + alle Sektionen) |
| `/impressum` `/datenschutz` `/agb` `/widerruf` `/versand` `/custom-orders` `/ueber-uns` | Recht / Info |
| `/login` | Admin-Login |

### Admin (Session + Rolle, außer Demo)

| Pfad | Funktion |
|---|---|
| `/admin` | Status |
| `/admin/gallery` | Bilder |
| `/admin/events` | Termine |
| `/admin/info` | Markentexte |
| `/admin/inquiries` | Kontakt |
| `/admin/instagram` | Sync |
| `/admin/hero` | Hintergrundvideo |

### API (nicht für Besucher)

| Pfad | Auth | Zweck |
|---|---|---|
| `POST /api/gallery/upload` | Admin | Bild → R2 + DB |
| `POST /api/hero/presign` | Admin | Signierte R2-PUT-URL |
| `POST /api/instagram/sync` | Admin | Manueller Sync |
| `GET /api/cron/instagram` | Bearer `CRON_SECRET` (Vercel sendet ihn automatisch) | Täglicher Sync |

---

## 6. Störungen

| Symptom | Prüfen |
|---|---|
| Site läuft, Speichern geht nicht | Demo Mode? Public Supabase-Keys? Banner oben im Admin? |
| Upload Galerie fehlgeschlagen | Dateityp, 10 MB, alle sechs R2-Variablen, Admin-Session |
| Hero-Upload fehlgeschlagen | 80 MB, MIME, R2-CORS erlaubt PUT von der Site-Origin, Presign nicht abgelaufen (120 s) |
| Instagram-Sektion leer | Token, Professional-Account, Sync gelaufen, Tabelle nicht leer bei Live-Supabase |
| Cron 401 | `CRON_SECRET` gesetzt? Header `Authorization: Bearer …`? |
| 403 nach Login | `profiles.role` ist nicht `admin` |
| Events fehlen auf der Startseite | `published`, `ends_at` / `starts_at` in der Vergangenheit |
| Intro jedes Mal | Absicht: jedes `/`-Visit |
| Sprache springt zurück | Cookie `nn-locale` blockiert? |

---

## 7. Grenzen für Copy und Design

- Keine Art-Deco-, 1920er-, okkulten oder mystischen Formulierungen in Texten.
- Look der bestehenden Komponenten nicht ändern (Farben, Fonts, Animationen, Layouts).
- Fonts: Poiret One, Cinzel, Montserrat (Google Fonts-URL, nicht `next/font`).

Details: `AGENTS.md` (Design Freeze).

---

## English operator notes

The public site is a gallery and brand surface. Commerce stays on Etsy. There is no cart, checkout, or on-site price.

Visitors: intro on every `/` visit → hero → philosophy → upcoming events → gallery filters → Instagram grid → inquiry form. DE/EN toggle writes cookie `nn-locale`. Legal routes stay German.

Operators: `/login` (Supabase email/password + `profiles.role = 'admin'`). Admin covers gallery (R2, 10 MB images), events, brand copy keys, inquiries (read flag), Instagram Login API sync, hero video (presigned PUT, 80 MB). Empty Supabase public env = Demo Mode (fixtures, writes no-op).

Setup and secrets: `README.md`, `.env.example`, `DEPLOYMENT.md`, `SECURITY.md`.
