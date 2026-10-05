import { runHealthChecks, type CheckStatus } from '@/lib/health'
import { HealthRefresh } from '@/components/admin/HealthRefresh'

const STATUS_LABEL: Record<CheckStatus, string> = {
  ok: 'OK',
  degraded: 'Eingeschränkt',
  error: 'Fehler',
  not_configured: 'Nicht konfiguriert',
  demo: 'Demo',
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const className =
    status === 'ok'
      ? 'border-foreground bg-foreground text-background'
      : status === 'degraded'
        ? 'border-foreground/60 text-foreground'
        : status === 'demo'
          ? 'border-foreground/30 text-foreground/60'
          : 'border-primary text-primary'
  return (
    <span className={`border px-2 py-1 text-xs uppercase tracking-wider ${className}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export default async function AdminHealthPage() {
  const checks = await runHealthChecks()
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl uppercase tracking-[0.2em] bioshock-glow-animated">API-Status</h2>
        <HealthRefresh />
      </div>
      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className="flex flex-wrap items-center justify-between gap-3 border-2 border-foreground/30 bg-background/50 p-4"
          >
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.15em]">{check.label}</p>
              {check.detail ? (
                <p className="break-words text-xs text-foreground/60">{check.detail}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-foreground/50">{check.latencyMs} ms</span>
              <StatusBadge status={check.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
