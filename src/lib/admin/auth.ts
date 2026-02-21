import { createHash } from 'crypto'
import { cookies } from 'next/headers'

export function getAdminToken() {
  const pw = process.env.ADMIN_PASSWORD || ''
  return createHash('sha256').update(pw).digest('hex')
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_token')?.value
  return token === getAdminToken()
}
