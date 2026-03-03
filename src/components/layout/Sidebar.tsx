import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  KanbanSquare,
  FlaskConical,
  BookOpen,
  Network,
  Settings,
  UserCircle,
} from 'lucide-react'
import { useApp } from '@/data/store'
import { cn } from '@/lib/utils'

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/projetos', label: 'Projetos', icon: FlaskConical },
  { to: '/produtos', label: 'Produtos / Outputs', icon: BookOpen },
  { to: '/parcerias', label: 'Parcerias', icon: Network },
]

export function Sidebar() {
  const { currentUser } = useApp()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border flex flex-col z-40">
      <div className="p-6 border-b border-border">
        <h1 className="text-base font-bold tracking-tight">INSP</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Monitor de Investigação</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {mainNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}

        {currentUser.papel === 'admin' && (
          <>
            <div className="my-3 border-t border-border" />
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Settings className="h-5 w-5" />
              Admin
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
          }
        >
          <UserCircle className="h-5 w-5" />
          <div className="min-w-0">
            <p className="truncate">{currentUser.nome}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.papel}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
