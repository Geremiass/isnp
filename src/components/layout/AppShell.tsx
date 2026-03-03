import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toast } from '@/components/ui/toast'
import { KeyboardShortcuts } from '@/components/common/KeyboardShortcuts'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[280px] p-6 lg:p-8">
        <Outlet />
      </main>
      <Toast />
      <KeyboardShortcuts />
    </div>
  )
}
