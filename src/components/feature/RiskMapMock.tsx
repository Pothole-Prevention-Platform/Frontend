import { MapPin } from 'lucide-react'
import { potholeRiskZones } from '../../data/mockData'
import { RiskBadge } from '../ui/RiskBadge'

const zoneStyles = {
  low: 'bg-emerald-400/35 ring-emerald-400',
  medium: 'bg-yellow-300/40 ring-yellow-400',
  high: 'bg-orange-400/40 ring-orange-500',
  critical: 'bg-red-500/35 ring-red-500',
}

const positions = [
  'left-[18%] top-[28%] h-24 w-24',
  'left-[59%] top-[20%] h-28 w-28',
  'left-[39%] top-[56%] h-20 w-20',
  'left-[72%] top-[62%] h-16 w-16',
]

export function RiskMapMock() {
  return (
    <div className="map-grid relative min-h-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-inner">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_70%_75%,rgba(14,165,233,0.15),transparent_36%)]" />
      <div className="road-line lane-mark left-[-4%] top-[28%] w-[112%] rotate-[-10deg]" />
      <div className="road-line lane-mark left-[8%] top-[63%] w-[92%] rotate-[7deg]" />
      <div className="road-line lane-mark left-[45%] top-[-8%] h-[118%] w-2 rotate-[18deg]" />
      <div className="road-line lane-mark left-[15%] top-[-10%] h-[120%] w-2 rotate-[-24deg]" />
      {potholeRiskZones.map((zone, index) => (
        <div key={zone.id} className={`absolute ${positions[index]}`}>
          <div className={`absolute inset-0 animate-pulse rounded-full ring-2 ${zoneStyles[zone.riskLevel]}`} />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="mt-2 min-w-32 rounded-lg bg-white/95 p-2 text-center shadow-xl">
              <p className="text-xs font-black text-slate-950">{zone.roadName}</p>
              <p className="text-[11px] text-slate-500">{zone.riskScore}점</p>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-slate-950/80 p-4 text-white backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-amber-300">선택 구간</p>
            <p className="mt-1 text-lg font-black">강남대로 327 인근</p>
          </div>
          <RiskBadge riskLevel="critical" />
        </div>
      </div>
    </div>
  )
}
