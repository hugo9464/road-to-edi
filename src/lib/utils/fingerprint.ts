const STORAGE_KEY = 'banana_fingerprint'

function generateFingerprint(): string {
  const raw = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')

  // Simple hash (djb2)
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}

export function getFingerprint(): string {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored
  const fp = generateFingerprint()
  localStorage.setItem(STORAGE_KEY, fp)
  return fp
}
