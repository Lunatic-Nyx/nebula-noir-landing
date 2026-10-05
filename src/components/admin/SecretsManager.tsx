'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { clearSecret, saveSecret } from '@/lib/actions/secrets'
import { API_SECRET_KEYS, API_SECRET_KEYS_LIST, type ApiSecretKey } from '@/lib/secrets/catalog'
import type { SecretSource } from '@/lib/secrets/store'

const SOURCE_LABEL: Record<SecretSource, string> = {
  db: 'gespeichert',
  env: 'ENV',
  missing: 'fehlt',
}

export function SecretsManager({
  status,
  encryptionReady,
}: {
  status: Record<ApiSecretKey, SecretSource>
  encryptionReady: boolean
}) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const onSave = async (key: ApiSecretKey) => {
    const value = values[key] ?? ''
    if (!value.trim()) {
      toast.error('Bitte einen Wert eingeben')
      return
    }
    setBusy(key)
    const result = await saveSecret(key, value)
    setBusy(null)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Schlüssel gespeichert')
    setValues((prev) => ({ ...prev, [key]: '' }))
    router.refresh()
  }

  const onClear = async (key: ApiSecretKey) => {
    setBusy(key)
    const result = await clearSecret(key)
    setBusy(null)
    if (!result.ok) toast.error(result.error)
    else {
      toast.success('Gespeicherten Wert entfernt')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">API-Keys</h2>
      <p className="text-sm text-foreground/70">
        Werte werden verschlüsselt (AES-256-GCM) gespeichert und nie wieder im Klartext angezeigt.
        Ist kein Wert gespeichert, gilt die ENV-Variable.
      </p>

      {!encryptionReady ? (
        <div className="border border-foreground/40 bg-primary/10 p-4 text-sm text-foreground/80">
          <code>SECRETS_ENCRYPTION_KEY</code> fehlt oder ist ungültig (64 Hex-Zeichen). Speichern ist
          deaktiviert; ENV-Fallbacks funktionieren weiterhin.
        </div>
      ) : null}

      <div className="space-y-4">
        {API_SECRET_KEYS_LIST.map((key) => {
          const meta = API_SECRET_KEYS[key]
          const source = status[key]
          return (
            <div key={key} className="space-y-3 border-2 border-foreground/30 bg-background/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm uppercase tracking-[0.15em]">{meta.label}</p>
                  <code className="text-xs text-foreground/50">ENV: {meta.envVar}</code>
                </div>
                <span
                  className={`border px-2 py-1 text-xs uppercase tracking-wider ${
                    source === 'db'
                      ? 'border-foreground bg-foreground text-background'
                      : source === 'env'
                        ? 'border-foreground/40 text-foreground/70'
                        : 'border-foreground/20 text-foreground/40'
                  }`}
                >
                  {SOURCE_LABEL[source]}
                </span>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] text-foreground/70">
                  Neuer Wert {source !== 'missing' ? '(überschreibt)' : ''}
                </Label>
                <Input
                  type={meta.sensitive ? 'password' : 'text'}
                  autoComplete="off"
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={source === 'missing' ? 'Wert eingeben' : 'Neuen Wert eingeben zum Ersetzen'}
                  className="rounded-none border-0 border-b-2 border-foreground/30 bg-background px-0 focus:border-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={busy === key || !encryptionReady}
                  onClick={() => onSave(key)}
                  className="border-2 border-foreground bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground hover:bg-foreground hover:text-background"
                >
                  {busy === key ? 'Speichert…' : 'Speichern'}
                </Button>
                {source === 'db' ? (
                  <Button
                    type="button"
                    disabled={busy === key}
                    onClick={() => onClear(key)}
                    className="border-2 border-foreground/40 bg-transparent px-4 py-2 text-xs uppercase tracking-[0.15em] text-foreground/70 hover:bg-foreground hover:text-background"
                  >
                    Gespeicherten Wert entfernen
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
