import { register } from 'node:module'

await register('./alias-hook.mjs', import.meta.url)
