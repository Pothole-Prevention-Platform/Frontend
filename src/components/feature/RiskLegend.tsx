const items = [
  ['낮음', 'bg-emerald-400', '정상 통행'],
  ['보통', 'bg-yellow-400', '주의 관찰'],
  ['높음', 'bg-orange-500', '신고 증가'],
  ['매우 높음', 'bg-red-500', '긴급 점검'],
]

export function RiskLegend() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([label, color, description]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-sm font-black text-slate-800">{label}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      ))}
    </div>
  )
}
