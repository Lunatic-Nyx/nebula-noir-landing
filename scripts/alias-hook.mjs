import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
  const base = join(root, 'src', specifier.slice(2))
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts')]) {
    try {
      return await nextResolve(pathToFileURL(candidate).href, context)
    } catch {
      // try the next candidate
    }
  }
  return nextResolve(pathToFileURL(`${base}.ts`).href, context)
}
