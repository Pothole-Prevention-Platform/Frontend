import { cn } from '../../utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  const inputId = id ?? props.name ?? label

  return (
    <label className="block text-sm font-semibold text-slate-700" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={cn(
          'mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-950 placeholder:text-slate-400 transition focus:border-amber-400',
          error && 'border-red-300',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}
