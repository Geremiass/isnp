import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/data/store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const shortcuts = [
  { keys: 'g d', action: 'Ir para Dashboard' },
  { keys: 'g p', action: 'Ir para Pipeline' },
  { keys: 'g r', action: 'Ir para Projetos' },
  { keys: 'g o', action: 'Ir para Produtos/Outputs' },
  { keys: 'g m', action: 'Ir para Parcerias' },
  { keys: 'g a', action: 'Ir para Admin (se admin)' },
  { keys: '/', action: 'Focar busca na página ativa' },
  { keys: 'n', action: 'Abrir modal Novo Projeto' },
  { keys: 'Esc', action: 'Fechar modal ativo' },
  { keys: 'Shift + ?', action: 'Abrir ajuda de atalhos' },
]

export function KeyboardShortcuts() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const [showHelp, setShowHelp] = useState(false)
  const [gPrefix, setGPrefix] = useState(false)

  useEffect(() => {
    let gTimer: ReturnType<typeof setTimeout>

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable

      if (e.key === 'Escape') {
        setShowHelp(false)
        return
      }

      if (isInput) return

      if (e.shiftKey && e.key === '?') {
        e.preventDefault()
        setShowHelp(s => !s)
        return
      }

      if (e.key === 'g') {
        setGPrefix(true)
        gTimer = setTimeout(() => setGPrefix(false), 1000)
        return
      }

      if (gPrefix) {
        setGPrefix(false)
        clearTimeout(gTimer)
        switch (e.key) {
          case 'd': navigate('/dashboard'); return
          case 'p': navigate('/pipeline'); return
          case 'r': navigate('/projetos'); return
          case 'o': navigate('/produtos'); return
          case 'm': navigate('/parcerias'); return
          case 'a':
            if (currentUser.papel === 'admin') navigate('/admin')
            return
        }
      }

      if (e.key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
        searchInput?.focus()
        return
      }

      if (e.key === 'n') {
        const newBtn = document.querySelector<HTMLButtonElement>('[data-new-project]')
        newBtn?.click()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(gTimer)
    }
  }, [navigate, currentUser.papel, gPrefix])

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atalhos de Teclado</DialogTitle>
          <DialogDescription>Navegue rapidamente usando os atalhos abaixo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {shortcuts.map(s => (
            <div key={s.keys} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-muted-foreground">{s.action}</span>
              <kbd className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
