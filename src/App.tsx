import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
