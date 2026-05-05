const COLOR_MAP: Record<string, string> = {
  nero: '#1a1a1a',
  black: '#1a1a1a',
  bianco: '#f0f0f0',
  white: '#f0f0f0',
  rosso: '#ef4444',
  red: '#ef4444',
  verde: '#22c55e',
  green: '#22c55e',
  blu: '#3b82f6',
  blue: '#3b82f6',
  azzurro: '#38bdf8',
  lightblue: '#38bdf8',
  giallo: '#eab308',
  yellow: '#eab308',
  arancione: '#f97316',
  orange: '#f97316',
  viola: '#a855f7',
  purple: '#a855f7',
  grigio: '#6b7280',
  gray: '#6b7280',
  grey: '#6b7280',
  marrone: '#92400e',
  brown: '#92400e',
  rosa: '#f9a8d4',
  pink: '#f9a8d4',
  beige: '#d4b896',
  crema: '#fef3c7',
}

export function colorToHex(name: string): string | null {
  return COLOR_MAP[name.toLowerCase()] ?? null
}
