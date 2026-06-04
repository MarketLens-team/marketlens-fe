/**
 * API/DB `imageUrl` → 프론트 `public/images` 기준 `<img src>`.
 * 예: `/images/persons/person-3.png` → `http://localhost:5173/images/persons/person-3.png`
 */

/** DB 폴더명·로컬 파일명 정리 */
function normalizeAssetPath(path: string): string {
  let normalized = path
    .replace(/^\/images\/person\//i, '/images/persons/')
    .replace(/^\/images\/stock\//i, '/images/stocks/')
    .replace(/^images\/person\//i, '/images/persons/')
    .replace(/^images\/stock\//i, '/images/stocks/')

  // DB: /images/stocks/005930.svg ↔ public: Stock005930.svg
  if (/^\/images\/stocks\/(?!Stock)/i.test(normalized)) {
    normalized = normalized.replace(/^\/images\/stocks\//i, '/images/stocks/Stock')
  }

  return normalized
}

export function resolveImageUrl(url?: string | null): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const path = normalizeAssetPath(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)

  // 항상 현재 프론트 origin (public/images)
  return path
}

export function normalizeImageUrl(url?: string | null): string | null {
  return resolveImageUrl(url)
}

/** API imageUrl 없을 때 `public/images/stocks/Stock{code}.svg` 폴백 */
export function resolveStockImageUrl(
  stockCode: string,
  imageUrl?: string | null,
): string | null {
  const fromApi = resolveImageUrl(imageUrl)
  if (fromApi) return fromApi
  const code = stockCode.trim()
  if (!/^\d{6}$/.test(code)) return null
  return resolveImageUrl(`/images/stocks/Stock${code}.svg`)
}
