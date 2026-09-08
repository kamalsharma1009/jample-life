import { cn, getStatusColors } from '@/lib/utils'

/**
 * Unified status badge component.
 * @param {{ status: string, className?: string }} props
 */
export default function StatusBadge({ status, className }) {
  if (!status) return null
  const colors = getStatusColors(status)
  const label = status.replace(/_/g, ' ')

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      colors.bg, colors.text, colors.border,
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', colors.dot)} />
      {label}
    </span>
  )
}
