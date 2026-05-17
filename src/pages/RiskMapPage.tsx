import { type ReactNode, useState } from 'react'
import {
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CloudRain,
  Construction,
  Cpu,
  Droplets,
  FilePlus2,
  Gauge,
  Layers,
  RefreshCcw,
  ShieldCheck,
  Siren,
  UserRound,
} from 'lucide-react'
import { riskHighZones, riskLegend, riskMapFilters, riskMapStats } from '../data/mockData'
import type { RiskMapFilterId, RiskMapHighZone, RiskMapHighZoneGrade, RiskMapLegendItem } from '../types'
import { cn } from '../utils/cn'

type MapImageState = 'webp' | 'png' | 'fallback'
type StatColor = 'red' | 'blue' | 'teal'

const defaultFilterValues: Record<RiskMapFilterId, string> = {
  rainfall: '최근 7일 (누적)',
  roadYear: '전체',
  sewerAging: '전체',
  undergroundConstruction: '전체',
}

const mapImagePaths: Record<Exclude<MapImageState, 'fallback'>, string> = {
  webp: '/assets/risk-map/seoul-risk-heatmap.webp',
  png: '/assets/risk-map/seoul-risk-heatmap.png',
}

const filterIcons: Record<RiskMapFilterId, ReactNode> = {
  rainfall: <CloudRain size={22} aria-hidden="true" />,
  roadYear: <Building2 size={22} aria-hidden="true" />,
  sewerAging: <Droplets size={22} className="text-green-600" aria-hidden="true" />,
  undergroundConstruction: <Construction size={22} className="text-teal-600" aria-hidden="true" />,
}

const riskGradeClasses: Record<RiskMapHighZoneGrade, string> = {
  긴급: 'bg-red-600 text-white',
  주의: 'bg-orange-500 text-white',
  관심: 'bg-yellow-400 text-slate-900',
  '안전/관찰': 'bg-green-500 text-white',
}

const statusClasses: Record<string, string> = {
  '점검 중': 'bg-blue-100 text-blue-700',
  '접수 완료': 'bg-blue-100 text-blue-700',
  모니터링: 'bg-cyan-100 text-cyan-700',
  '보수 완료': 'bg-green-100 text-green-700',
}

const legendDotClasses: Record<RiskMapLegendItem['color'], string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-600',
}

const fallbackDistricts = [
  ['은평구', '29%', '24%'],
  ['도봉구', '61%', '13%'],
  ['강북구', '49%', '23%'],
  ['성북구', '56%', '33%'],
  ['중랑구', '70%', '31%'],
  ['종로구', '45%', '39%'],
  ['서대문구', '33%', '44%'],
  ['중구', '54%', '47%'],
  ['동대문구', '64%', '41%'],
  ['마포구', '25%', '52%'],
  ['강서구', '13%', '57%'],
  ['양천구', '18%', '73%'],
  ['금천구', '26%', '86%'],
  ['동작구', '43%', '76%'],
  ['관악구', '50%', '87%'],
  ['서초구', '65%', '82%'],
  ['강남구', '78%', '75%'],
  ['송파구', '89%', '68%'],
  ['강동구', '93%', '49%'],
  ['광진구', '76%', '44%'],
] as const

function FilterBar() {
  const [filterValues, setFilterValues] = useState<Record<RiskMapFilterId, string>>(defaultFilterValues)

  const resetFilters = () => {
    setFilterValues(defaultFilterValues)
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {riskMapFilters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className="flex h-[64px] min-w-0 flex-1 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 text-left shadow-[0_10px_26px_rgba(15,40,70,0.05)] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-blue-400 sm:min-w-[180px] sm:flex-none sm:px-5"
          aria-label={`${filter.title} 필터, 현재 값 ${filterValues[filter.id]}`}
        >
          <span className="flex min-w-0 items-center gap-4">
            <span className="shrink-0 text-blue-700">{filterIcons[filter.id]}</span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-black tracking-[-0.04em] text-[#07182F]">{filter.title}</span>
              <span className="mt-1 block truncate text-[12px] font-semibold tracking-[-0.04em] text-slate-500">
                {filterValues[filter.id]}
              </span>
            </span>
          </span>
          <ChevronDown size={17} className="shrink-0 text-slate-600" aria-hidden="true" />
        </button>
      ))}

      <button
        type="button"
        onClick={resetFilters}
        className="flex h-[64px] min-w-0 flex-1 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-[14px] font-black tracking-[-0.04em] text-slate-700 shadow-[0_10px_26px_rgba(15,40,70,0.05)] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-blue-400 sm:min-w-[132px] sm:flex-none"
      >
        <RefreshCcw size={22} className="text-slate-600" aria-hidden="true" />
        필터 초기화
      </button>
    </div>
  )
}

function FallbackSeoulMap() {
  return (
    <div
      role="img"
      aria-label="서울특별시 포트홀 위험 예측 히트맵 대체 지도"
      className="absolute inset-0 overflow-hidden bg-slate-100"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:38px_38px]" />
      <div className="absolute left-[-12%] top-[25%] h-8 w-[122%] rotate-[18deg] rounded-full bg-sky-200/90 shadow-[0_0_0_8px_rgba(255,255,255,0.48)]" />
      <div className="absolute left-[-10%] top-[58%] h-10 w-[118%] rotate-[-12deg] rounded-full bg-sky-200/90 shadow-[0_0_0_8px_rgba(255,255,255,0.48)]" />
      <div className="absolute left-[10%] top-[8%] h-[82%] w-[82%] rounded-[38%_44%_46%_36%] border-2 border-white/80 bg-green-300/60 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.65),0_20px_45px_rgba(22,101,52,0.12)]" />
      <div className="absolute left-[17%] top-[15%] h-[34%] w-[38%] rounded-full bg-green-300/80 blur-[18px]" />
      <div className="absolute left-[33%] top-[19%] h-[36%] w-[34%] rounded-full bg-yellow-300/80 blur-[20px]" />
      <div className="absolute left-[47%] top-[28%] h-[33%] w-[28%] rounded-full bg-red-400/85 blur-[22px]" />
      <div className="absolute left-[66%] top-[22%] h-[28%] w-[23%] rounded-full bg-orange-400/80 blur-[18px]" />
      <div className="absolute left-[72%] top-[53%] h-[28%] w-[26%] rounded-full bg-orange-400/80 blur-[18px]" />
      <div className="absolute left-[54%] top-[64%] h-[26%] w-[28%] rounded-full bg-yellow-300/75 blur-[18px]" />
      <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 900 590" aria-hidden="true">
        <path d="M220 60L330 180L210 300L320 490" fill="none" stroke="white" strokeWidth="2" />
        <path d="M410 40L455 190L390 330L470 560" fill="none" stroke="white" strokeWidth="2" />
        <path d="M590 55L520 210L615 355L560 520" fill="none" stroke="white" strokeWidth="2" />
        <path d="M120 220L310 250L460 210L690 240L810 310" fill="none" stroke="white" strokeWidth="2" />
        <path d="M90 380L260 355L430 390L620 360L820 430" fill="none" stroke="white" strokeWidth="2" />
      </svg>
      {fallbackDistricts.map(([name, x, y]) => (
        <span
          key={name}
          className="absolute z-10 rounded-md bg-white/45 px-1.5 py-0.5 text-[12px] font-black tracking-[-0.05em] text-slate-800 sm:text-[14px]"
          style={{ left: x, top: y }}
        >
          {name}
        </span>
      ))}
      <FallbackMarker x="52%" y="44%" tone="red" label="중구" />
      <FallbackMarker x="82%" y="57%" tone="red" label="강동구" />
      <FallbackMarker x="67%" y="74%" tone="red" label="강남구" />
      <FallbackMarker x="26%" y="64%" tone="orange" label="영등포구" />
      <FallbackMarker x="52%" y="84%" tone="green" label="서초구" />
    </div>
  )
}

function FallbackMarker({ x, y, tone, label }: { x: string; y: string; tone: 'red' | 'orange' | 'green'; label: string }) {
  const colorClass = {
    red: 'bg-red-600 shadow-red-500/35',
    orange: 'bg-orange-500 shadow-orange-500/35',
    green: 'bg-green-500 shadow-green-500/35',
  }[tone]

  return (
    <div className="absolute z-20 flex flex-col items-center" style={{ left: x, top: y }}>
      <span
        className={cn(
          'flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[4px] border-white text-white shadow-xl',
          colorClass,
        )}
      >
        {tone === 'green' ? <ShieldCheck size={20} fill="currentColor" aria-hidden="true" /> : <Siren size={19} fill="currentColor" aria-hidden="true" />}
      </span>
      <span className="-mt-2 -translate-x-1/2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-black text-slate-700 shadow-sm">
        {label}
      </span>
    </div>
  )
}

function MiniLegend() {
  return (
    <div className="grid min-w-[250px] grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
      {riskLegend.map((item) => (
        <div key={item.id} className="text-center">
          <span className={cn('mx-auto block h-3 w-3 rounded-full', legendDotClasses[item.color])} />
          <span className="mt-1 block text-[11px] font-black text-slate-700">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function RiskMapImagePanel() {
  const [imageState, setImageState] = useState<MapImageState>('webp')
  const [isLegendOpen, setIsLegendOpen] = useState(false)
  const imageSrc = imageState === 'fallback' ? undefined : mapImagePaths[imageState]

  const handleImageError = () => {
    setImageState((current) => (current === 'webp' ? 'png' : 'fallback'))
  }

  return (
    <section className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_18px_45px_rgba(15,40,70,0.08)] sm:h-[500px] xl:h-[560px]">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="서울특별시 포트홀 위험 예측 히트맵"
          className="h-full w-full object-cover object-center"
          onError={handleImageError}
        />
      ) : (
        <FallbackSeoulMap />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-slate-900/5" />

      <div className="absolute bottom-[88px] left-4 z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:left-5">
        <button
          type="button"
          aria-label="지도 확대"
          className="flex h-11 w-11 items-center justify-center border-b border-slate-200 text-2xl font-light text-slate-700 transition hover:bg-blue-50"
        >
          +
        </button>
        <button
          type="button"
          aria-label="지도 축소"
          className="flex h-11 w-11 items-center justify-center text-2xl font-light text-slate-700 transition hover:bg-blue-50"
        >
          −
        </button>
      </div>

      <button
        type="button"
        aria-label="현재 위치 보기"
        className="absolute bottom-7 left-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-blue-50 sm:left-5"
      >
        <Gauge size={21} aria-hidden="true" />
      </button>

      {isLegendOpen && (
        <div className="absolute bottom-[86px] right-4 z-20 sm:right-6">
          <MiniLegend />
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsLegendOpen((current) => !current)}
        aria-expanded={isLegendOpen}
        className="absolute bottom-7 right-4 z-20 flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-black tracking-[-0.04em] text-slate-700 shadow-lg transition hover:bg-blue-50 sm:right-6 sm:px-5 sm:text-[14px]"
      >
        <Layers size={20} aria-hidden="true" />
        범례 보기
      </button>
    </section>
  )
}

function StatSummaryCard({
  title,
  caption,
  value,
  unit,
  change,
  icon,
  color,
}: {
  title: string
  caption?: string
  value: string
  unit?: string
  change: string
  icon: ReactNode
  color: StatColor
}) {
  const colorStyle = {
    red: {
      value: 'text-red-600',
      bg: 'bg-red-50',
      icon: 'text-red-600',
      change: 'text-red-600',
    },
    blue: {
      value: 'text-blue-700',
      bg: 'bg-blue-50',
      icon: 'text-blue-700',
      change: 'text-blue-600',
    },
    teal: {
      value: 'text-teal-600',
      bg: 'bg-cyan-50',
      icon: 'text-teal-600',
      change: 'text-teal-600',
    },
  }[color]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,40,70,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-black tracking-[-0.05em] text-[#07182F]">
            {title}
            {caption && <span className="ml-1 text-[12px] font-bold tracking-[-0.03em] text-slate-500">{caption}</span>}
          </h2>
        </div>
        <button type="button" className="flex items-center gap-1 text-[12px] font-black text-slate-600 transition hover:text-blue-700">
          더보기
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span className={cn('text-[42px] font-black leading-none tracking-[-0.04em]', colorStyle.value)}>{value}</span>
            {unit && <span className="mb-1 text-[17px] font-black tracking-[-0.04em] text-slate-800">{unit}</span>}
          </div>
          <p className="mt-3 text-[13px] font-bold text-slate-500">
            전일 대비 <span className={colorStyle.change}>{change}</span>
          </p>
        </div>
        <div className={cn('flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-2xl', colorStyle.bg, colorStyle.icon)}>
          {icon}
        </div>
      </div>
    </section>
  )
}

function RiskLegendCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,40,70,0.06)]">
      <h2 className="text-[17px] font-black tracking-[-0.05em] text-[#07182F]">위험 등급 범례</h2>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {riskLegend.map((item) => (
          <div key={item.id} className="text-center">
            <span className={cn('mx-auto block h-3 w-3 rounded-full', legendDotClasses[item.color])} />
            <p className="mt-1 text-[11px] font-black text-slate-700">{item.label}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">({item.range})</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[12px] font-semibold leading-relaxed tracking-[-0.04em] text-slate-500">
        위험도는 AI 모델의 예측된 포트홀 발생 확률입니다.
      </p>
    </section>
  )
}

function RiskSummaryPanel() {
  return (
    <aside className="grid gap-3 sm:grid-cols-2 xl:block xl:space-y-3">
      <StatSummaryCard
        title="오늘의 고위험 구간"
        value={String(riskMapStats.highRiskCount)}
        unit="개 구간"
        change={`▲ ${riskMapStats.highRiskDelta}`}
        color="red"
        icon={<Siren size={44} fill="currentColor" aria-hidden="true" />}
      />
      <StatSummaryCard
        title="최근 신고 수"
        caption="(최근 7일)"
        value={String(riskMapStats.recentReportCount)}
        unit="건"
        change={`▲ ${riskMapStats.reportDeltaPercent}%`}
        color="blue"
        icon={<FilePlus2 size={44} aria-hidden="true" />}
      />
      <StatSummaryCard
        title="AI 예측 정확도"
        caption="(최근 30일)"
        value={riskMapStats.aiAccuracy.toFixed(1)}
        unit="%"
        change={`▲ ${riskMapStats.accuracyDeltaPercent}%p`}
        color="teal"
        icon={<Cpu size={44} aria-hidden="true" />}
      />
      <RiskLegendCard />
    </aside>
  )
}

function RiskGradeBadge({ grade }: { grade: RiskMapHighZoneGrade }) {
  return (
    <span className={cn('inline-flex h-8 min-w-[70px] items-center justify-center rounded-full px-3 text-[12px] font-black', riskGradeClasses[grade])}>
      {grade}
    </span>
  )
}

function riskBarClass(value: number) {
  if (value >= 70) {
    return 'bg-red-600'
  }
  if (value >= 40) {
    return 'bg-orange-500'
  }
  if (value >= 20) {
    return 'bg-yellow-400'
  }
  return 'bg-green-500'
}

function RiskProgress({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 text-[15px] font-black text-slate-800">{value}%</span>
      <div className="h-2 w-[88px] overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
        <div className={cn('h-full rounded-full', riskBarClass(value))} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex h-8 min-w-[78px] items-center justify-center rounded-full px-3 text-[12px] font-black', statusClasses[status] ?? 'bg-slate-100 text-slate-700')}>
      {status}
    </span>
  )
}

function RiskHighZoneMobileCard({ zone }: { zone: RiskMapHighZone }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_26px_rgba(15,40,70,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <RiskGradeBadge grade={zone.riskGrade} />
          <h3 className="mt-3 text-[15px] font-black tracking-[-0.04em] text-slate-900">{zone.roadName}</h3>
          <p className="mt-1 text-[13px] font-semibold tracking-[-0.04em] text-slate-500">{zone.detailLocation}</p>
        </div>
        <StatusBadge status={zone.status} />
      </div>
      <div className="mt-4 grid gap-3 text-[13px] font-semibold text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">위험도(예측)</span>
          <RiskProgress value={zone.riskPercent} />
        </div>
        <div>
          <span className="text-slate-500">주요 원인</span>
          <p className="mt-1 text-slate-700">{zone.reasons.join(' · ')}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">최근 신고</span>
          <span>
            {zone.recentReportTime} · {zone.reportCount}건
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">조치 예상</span>
          <span className="font-black text-slate-800">{zone.expectedAction}</span>
        </div>
      </div>
    </article>
  )
}

function RiskHighZoneTable() {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,40,70,0.06)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-black tracking-[-0.06em] text-[#07182F]">최근 고위험 구간</h2>
          <CircleHelp size={17} className="text-slate-400" aria-hidden="true" />
        </div>
        <button type="button" className="flex items-center gap-1 text-[13px] font-black tracking-[-0.04em] text-blue-700 transition hover:text-blue-500">
          전체 보기
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 lg:block">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[12px] font-black tracking-[-0.04em] text-slate-500">
              <th className="px-4 py-3 text-left">위험 등급</th>
              <th className="px-4 py-3 text-left">위치</th>
              <th className="px-4 py-3 text-left">위험도(예측)</th>
              <th className="px-4 py-3 text-left">주요 원인</th>
              <th className="px-4 py-3 text-left">최근 신고</th>
              <th className="px-4 py-3 text-left">관리 상태</th>
              <th className="px-4 py-3 text-left">조치 예상</th>
            </tr>
          </thead>
          <tbody>
            {riskHighZones.map((zone) => (
              <tr key={zone.id} className="border-t border-slate-200 text-[13px]">
                <td className="px-4 py-3">
                  <RiskGradeBadge grade={zone.riskGrade} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-black tracking-[-0.04em] text-slate-800">{zone.roadName}</p>
                  <p className="mt-1 font-semibold tracking-[-0.04em] text-slate-500">{zone.detailLocation}</p>
                </td>
                <td className="px-4 py-3">
                  <RiskProgress value={zone.riskPercent} />
                </td>
                <td className="px-4 py-3 font-semibold tracking-[-0.04em] text-slate-700">{zone.reasons.join(' · ')}</td>
                <td className="px-4 py-3 font-semibold tracking-[-0.04em] text-slate-600">
                  {zone.recentReportTime}
                  <span className="mx-2 text-slate-300">·</span>
                  <UserRound className="inline-block align-[-3px] text-slate-500" size={15} aria-hidden="true" />
                  <span className="ml-1">{zone.reportCount}건</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={zone.status} />
                </td>
                <td className="px-4 py-3 font-black tracking-[-0.04em] text-slate-700">{zone.expectedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {riskHighZones.map((zone) => (
          <RiskHighZoneMobileCard key={zone.id} zone={zone} />
        ))}
      </div>
    </section>
  )
}

export function RiskMapPage() {
  return (
    <div className="min-w-0">
      <div>
        <h1 className="text-[30px] font-black tracking-[-0.06em] text-[#07182F] sm:text-[34px]">AI 위험 예측지도</h1>
        <p className="mt-2 text-[15px] font-semibold tracking-[-0.04em] text-slate-500">
          AI가 예측한 포트홀 위험도를 지도에서 확인하세요.
        </p>
      </div>

      <FilterBar />

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_316px]">
        <RiskMapImagePanel />
        <RiskSummaryPanel />
      </div>

      <RiskHighZoneTable />
    </div>
  )
}
