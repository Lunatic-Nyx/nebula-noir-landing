export type LimitResult = 'ok' | 'limited' | 'down'

// A limiter error must not store the inquiry. Only 'ok' may insert.
export function contactWriteAllowed(result: LimitResult): boolean {
  return result === 'ok'
}
