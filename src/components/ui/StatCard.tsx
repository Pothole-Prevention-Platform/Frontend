import { cn } from '../../utils/cn'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon?: React.ReactNode
  trend?: string
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-500">{description}</p>
      {trend && <p className="mt-2 text-xs font-bold text-emerald-600">{trend}</p>}
    </div>
  )
}
