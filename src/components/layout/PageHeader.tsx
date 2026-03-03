import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  breadcrumb?: string
  children?: ReactNode
}

export function PageHeader({ title, breadcrumb, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {breadcrumb && (
          <p className="text-xs text-muted-foreground mb-1">{breadcrumb}</p>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
