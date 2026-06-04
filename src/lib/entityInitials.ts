export function getPersonInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
  }
  return trimmed.slice(0, 1)
}

export function getStockInitial(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed[0] : '?'
}
