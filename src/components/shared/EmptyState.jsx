import { cn } from '@/lib/utils'

/**
 * Empty state component for lists and pages with no data.
 * @param {{
 *   icon?: React.ComponentType,
 *   title: string,
 *   description?: string,
 *   action?: React.ReactNode,
 *   className?: string
 * }} props
 */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
