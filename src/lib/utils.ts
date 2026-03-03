import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-CV', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + ' ECV'
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace('.0', '') + 'M ECV'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K ECV'
  }
  return value + ' ECV'
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-CV', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function parsePercent(percStr: string): number {
  const match = percStr.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function progressColor(percent: number): string {
  if (percent <= 30) return 'bg-red-500'
  if (percent <= 69) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function generateId(prefix: string, existing: string[]): string {
  let num = existing.length + 1
  let id = `${prefix}${String(num).padStart(3, '0')}`
  while (existing.includes(id)) {
    num++
    id = `${prefix}${String(num).padStart(3, '0')}`
  }
  return id
}

export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = '\uFEFF'
  const csv = bom + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
