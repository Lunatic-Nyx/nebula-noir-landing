# Compliance — Prüfliste vor Livegang

**Stand:** 2026-10-07 · **Kein Rechtsrat.** Diese Liste ist eine technische Vollständigkeitsprüfung. Heikle Punkte mit einer Anwältin / einem Anwalt klären. Angaben zum Betreiber (Name, Anschrift, Steuer, Verträge) kann nur der Betreiber liefern.

Ergänzt `SECURITY.md` (technische Sicherheit) und die Rechtsseiten aus `src/lib/legal-content.ts`.

## Datenflüsse (Ist-Stand)

- **Hosting:** Vercel (USA) — Server-Logs (IP, Zeit, Ressource, Browsertyp).
- **Datenbank/Auth/Anfragen:** Supabase (`contact_inquiries`, `site_config`, Auth im Admin).
- **Kontaktformular:** Name, E-Mail, Nachricht → Supabase; gehashtes Rate-Limit; Benachrichtigung per **Resend** (nur mit Key).
- **Medien:** Cloudflare R2 (Galerie, Hero, gecachte Instagram-Stills).
- **Google Fonts:** nur nach Consent (`nn-consent`), sonst Systemschriften.
- **Instagram/Meta:** nur Link + ggf. CDN-Thumbnails (sonst R2).
- **Etsy:** Shop/Kauf außerhalb dieser Website.
- **Keine** Analyse-, Tracking- oder Marketing-Tools. Besucher-Cookies: `nn-locale`, `nn-consent`; Supabase-Session-Cookies nur im Admin.

## Muss vor Livegang

1. **Impressum:** alle `[[…]]` ersetzen — Admin → **Texte & Übersetzungen → Rechtstexte → Impressum** (Name, Anschrift, ggf. Telefon, Rechtsform/Register, USt-IdNr. bzw. Kleinunternehmer-Status). Keine Klammer-Platzhalter öffentlich.
2. **Datenschutz:** Verantwortlichen-Angaben und `[[Vom Betreiber zu bestätigen: AVV/DPA …]]` ersetzen; Dienstleister und Übermittlung konkretisieren. Falls Supabase EU-gehostet → ausdrücklich „keine Drittlandübermittlung für DB-Daten".
3. **Widerruf:** `[[Anschrift wie im Impressum]]` ersetzen.
4. **AVV/DPA + Transfer-Garantien** je Dienstleister bestätigen/dokumentieren (Vercel, Supabase, Resend, Cloudflare, Google, Meta).
5. **Aufbewahrung** für Kontaktanfragen festlegen und den Datenschutz-Text angleichen. Aktuell: nur **manuelle** Löschung unter `/admin/inquiries`; es gibt keinen Auto-Cleanup.
6. **GPSR / Produktsicherheit:** Hersteller-/Verantwortlichenangaben pflegen — Admin → **Rechtstexte → Produkthinweise** (oder auf der Etsy-Listung).
7. **AGB/Widerruf:** „Made-to-Order" ist derzeit wie „kundenspezifische Anfertigung" behandelt (Widerrufsausschluss nach § 312g Abs. 2 Nr. 1 BGB) — anwaltlich prüfen. **Preise/MwSt.** mit dem tatsächlichen USt-Status abstimmen.

## Sollte vor Livegang

8. Zuständige **Datenschutz-Aufsichtsbehörde** nennen; Hinweis „Angaben freiwillig/erforderlich".
9. **Kontaktformular:** kurzer Datenschutzhinweis mit Link zur Erklärung.
10. **§ 18 MStV** prüfen: nur nötig bei redaktionell-journalistischen Inhalten, sonst Abschnitt entfernen.
11. **Cookie-Banner:** „Nur notwendige" gleichwertig sichtbar zu „Alle akzeptieren" (TDDDG § 25).
12. **VerpackG/LUCID**, **REACH** (Nickel/PAH bei Hautkontakt), ggf. **WEEE/BattG** (falls Produkte Elektronik/Batterien enthalten) klären — evtl. über Etsy dischargebar.

## Optional

13. Telefon-Zeile im Impressum entfernen, falls nicht gewünscht.
14. Versand-/Verpackungstexte mit dem aktuellen Etsy-Angebot abgleichen.
15. Produktion-R2 konfigurieren, damit keine direkten Meta-Bildrequests entstehen.
16. **BFSG**-Anwendbarkeit (Barrierefreiheit) prüfen.

## Entscheidungen, die nur Betreiber/Anwalt treffen können

- Betreiber-Identität/Rechtsform/**USt-Status**; **Supabase-Region** und Drittlandübermittlung; **DPA/Transfer** je Dienstleister; **Aufbewahrungsfrist**; Anwendbarkeit von **GPSR/VerpackG/REACH/WEEE/BattG**; **Made-to-Order**-Widerruf; **§ 18 MStV**; **BFSG**.

## Wo pflegen (Admin)

| Inhalt | Pfad |
|---|---|
| Impressum + alle Rechtstexte (DE/EN, HTML) | Texte & Übersetzungen → Rechtstexte |
| Produkthinweise-Seite | Texte & Übersetzungen → Rechtstexte → Produkthinweise (`/produkthinweise`) |
| Legal-/Footer-Links | Texte & Übersetzungen → Footer |
| Site-Links, globaler Produkthinweis | Texte & Übersetzungen → Website |
| API-Keys (Resend/Instagram) | API-Keys (braucht `SECRETS_ENCRYPTION_KEY`) |
| Status-Checks | `/admin/health` |

## Hinweis

Rechtsseiten sind im Admin editierbar (`site_config.legal`). Nach jeder inhaltlichen Änderung erneut prüfen, dass keine `[[…]]`-Platzhalter und keine unbelegten Aussagen veröffentlicht sind. Diese Datei ersetzt keine Rechtsberatung.
