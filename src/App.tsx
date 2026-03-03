import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/data/auth'
import { AppProvider } from '@/data/store'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppShell } from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Pipeline from '@/pages/Pipeline'
import Projetos from '@/pages/Projetos'
import Produtos from '@/pages/Produtos'
import Parcerias from '@/pages/Parcerias'
import Admin from '@/pages/Admin'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import { PendingApprovalOverlay } from '@/components/layout/PendingApproval'

function ProtectedApp() {
  const { session, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">A carregar...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  if (role === 'nenhum') return <PendingApprovalOverlay />

  return (
    <AppProvider>
      <TooltipProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/parcerias" element={<Parcerias />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </AppProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </BrowserRouter>
  )
}
