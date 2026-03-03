import { forwardRef, type HTMLAttributes } from 'react'
import { cn, progressColor } from '@/lib/utils'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full rounded-full transition-all duration-300', progressColor(pct))}
            style={{ width: `${pct}%` }}
          />
        </div>
        {showLabel && <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(pct)}%</span>}
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress }
