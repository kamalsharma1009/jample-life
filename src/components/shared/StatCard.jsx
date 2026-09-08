import { cn, formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Premium stat card for dashboards.
 *
 * @param {{
 *   title: string,
 *   value: string|number,
 *   icon: React.ComponentType,
 *   format?: 'currency' | 'number' | 'text',
 *   trend?: number, // positive = up, negative = down
 *   trendLabel?: string,
 *   subtitle?: string,
 *   gradient?: boolean,
 *   loading?: boolean,
 *   className?: string,
 *   onClick?: function
 * }} props
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  format = 'text',
  trend,
  trendLabel,
  subtitle,
  gradient = false,
  loading = false,
  className,
  onClick,
}) {
  const formattedValue = () => {
    if (loading) return null
    if (format === 'currency') return formatCurrency(value)
    if (format === 'number') return formatNumber(value)
    return value ?? '—'
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'

  if (gradient) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl p-6 text-white',
          'bg-jample-gradient shadow-jample',
          onClick && 'cursor-pointer hover:shadow-jample-lg transition-shadow',
          className
        )}
        onClick={onClick}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/80 text-sm font-medium">{title}</p>
            {Icon && (
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon size={20} className="text-white" />
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-8 bg-white/20 rounded-lg animate-pulse w-32" />
          ) : (
            <p className="text-3xl font-bold counter-text">{formattedValue()}</p>
          )}

          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}

          {trend !== undefined && !loading && (
            <div className="flex items-center gap-1 mt-3">
              <TrendIcon size={14} className="text-white/80" />
              <span className="text-white/80 text-xs">
                {Math.abs(trend)}% {trendLabel || (trend > 0 ? 'increase' : 'decrease')}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-6 border border-gray-100 shadow-card',
        'hover:shadow-card-hover transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {Icon && (
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-jample-burgundy" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-32" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 counter-text">{formattedValue()}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}

          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 mt-3', trendColor)}>
              <TrendIcon size={14} />
              <span className="text-xs font-medium">
                {Math.abs(trend)}% {trendLabel || (trend > 0 ? 'up' : trend < 0 ? 'down' : '')}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
