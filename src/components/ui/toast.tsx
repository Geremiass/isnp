import { useApp } from '@/data/store'
import { CheckCircle2, X } from 'lucide-react'

export function Toast() {
  const { toast, dismissToast } = useApp()
  if (!toast) return null

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-xl animate-in slide-in-from-bottom-5 max-w-sm"
    >
      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>}
      </div>
      <button onClick={dismissToast} className="text-muted-foreground hover:text-foreground" aria-label="Fechar notificação">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
