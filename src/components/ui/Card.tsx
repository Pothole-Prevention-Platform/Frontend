import { cn } from '../../utils/cn'

interface CardProps {
  title?: string
  description?: string
  className?: string
  children: React.ReactNode
}

export function Card({ title, description, className, children }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60',
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-lg font-bold text-slate-950">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
