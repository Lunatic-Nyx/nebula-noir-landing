import { SecretsManager } from '@/components/admin/SecretsManager'
import { getApiSecretStatus } from '@/lib/secrets/store'
import { isEncryptionConfigured } from '@/lib/secrets/crypto'

export default async function AdminSecretsPage() {
  const status = await getApiSecretStatus()
  return <SecretsManager status={status} encryptionReady={isEncryptionConfigured()} />
}
