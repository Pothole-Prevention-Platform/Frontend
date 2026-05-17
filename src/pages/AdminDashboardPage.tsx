import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Cpu,
  Download,
  FilePlus2,
  FileText,
  RefreshCcw,
  UserRound,
  Wrench,
  XCircle,
} from 'lucide-react'
import {
  adminFilters,
  adminKpiStats,
  adminMapRiskPoints,
  adminPriorityAreas,
  adminRiskDistribution,
  adminStatusSummary,
  adminTrendData,
} from '../data/mockData'
import type {
  AdminColorType,
  AdminKpiIconType,
  AdminMapRiskLevel,
  AdminPriorityArea,
  AdminPriorityTab,
  AdminRiskDistributionItem,
  AdminRiskGrade,
  AdminStatusIconType,
} from '../types'
import { cn } from '../utils/cn'

type RepairTargetType = 'district' | 'report'

type SelectControlProps = {
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
}

const districtOptions = ['전체', '강남구', '강북구', '영등포구', '관악구', '노원구', '서초구', '송파구', '마포구', '용산구']
const periodOptions = ['최근 30일 (2024.05.07 ~ 2024.06.05)', '최근 7일', '이번 달', '전월']
const statusOptions = ['전체', '접수 대기', '접수 완료', '보수 진행 중', '보수 완료', '반려']
const departmentOptions = ['선택하세요', '서울시 도로관리과', '강남구 도로보수팀', '강북구 안전건설과', '영등포구 도로관리팀', '관악구 치수도로과']
const assignmentDistrictOptions = ['자치구를 선택하세요', '강남구', '강북구', '영등포구', '관악구', '노원구', '서초구', '송파구']
const priorityLevels: AdminRiskGrade[] = ['긴급', '주의', '관심']

const colorStyles: Record<AdminColorType, { text: string; value: string; softBg: string; iconBg: string; dot: string; ring: string }> = {
  blue: {
    text: 'text-blue-700',
    value: 'text-blue-700',
    softBg: 'bg-blue-50',
    iconBg: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-600',
    ring: 'ring-blue-200',
  },
  red: {
    text: 'text-red-600',
    value: 'text-red-600',
    softBg: 'bg-red-50',
    iconBg: 'bg-red-50 text-red-600',
    dot: 'bg-red-500',
    ring: 'ring-red-200',
  },
  orange: {
    text: 'text-orange-600',
    value: 'text-orange-500',
    softBg: 'bg-orange-50',
    iconBg: 'bg-orange-50 text-orange-500',
    dot: 'bg-orange-400',
    ring: 'ring-orange-200',
  },
  green: {
    text: 'text-emerald-600',
    value: 'text-emerald-600',
    softBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-50 text-emerald-600',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-200',
  },
  yellow: {
    text: 'text-yellow-700',
    value: 'text-yellow-700',
    softBg: 'bg-yellow-50',
    iconBg: 'bg-yellow-50 text-yellow-700',
    dot: 'bg-yellow-400',
    ring: 'ring-yellow-200',
  },
  gray: {
    text: 'text-slate-500',
    value: 'text-slate-600',
    softBg: 'bg-slate-50',
    iconBg: 'bg-slate-50 text-slate-500',
    dot: 'bg-slate-300',
    ring: 'ring-slate-200',
  },
  purple: {
    text: 'text-purple-700',
    value: 'text-purple-700',
    softBg: 'bg-purple-50',
    iconBg: 'bg-purple-50 text-purple-700',
    dot: 'bg-purple-600',
    ring: 'ring-purple-200',
  },
  teal: {
    text: 'text-teal-700',
    value: 'text-teal-700',
    softBg: 'bg-teal-50',
    iconBg: 'bg-cyan-50 text-teal-600',
    dot: 'bg-teal-500',
    ring: 'ring-teal-200',
  },
}

const donutColors: Record<AdminColorType, string> = {
  blue: '#2563EB',
  red: '#EF4444',
  orange: '#F97316',
  green: '#22C55E',
  yellow: '#FACC15',
  gray: '#CBD5E1',
  purple: '#7C3AED',
  teal: '#14B8A6',
}

const riskGradeStyles: Record<AdminRiskGrade, string> = {
  긴급: 'bg-red-50 text-red-700 ring-red-200',
  주의: 'bg-orange-50 text-orange-700 ring-orange-200',
  관심: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const mapRiskStyles: Record<AdminMapRiskLevel, { marker: string; halo: string; label: string }> = {
  'very-high': {
    marker: 'bg-red-500 text-white',
    halo: 'shadow-[0_0_0_12px_rgba(239,68,68,0.18)]',
    label: '매우 높음',
  },
  high: {
    marker: 'bg-orange-400 text-white',
    halo: 'shadow-[0_0_0_12px_rgba(251,146,60,0.18)]',
    label: '높음',
  },
  medium: {
    marker: 'bg-yellow-400 text-slate-900',
    halo: 'shadow-[0_0_0_12px_rgba(250,204,21,0.18)]',
    label: '보통',
  },
  low: {
    marker: 'bg-emerald-500 text-white',
    halo: 'shadow-[0_0_0_12px_rgba(34,197,94,0.16)]',
    label: '낮음',
  },
  'very-low': {
    marker: 'bg-blue-500 text-white',
    halo: 'shadow-[0_0_0_12px_rgba(59,130,246,0.16)]',
    label: '매우 낮음',
  },
}

const mapLabels = [
  { name: '도봉구', x: 54, y: 10 },
  { name: '노원구', x: 76, y: 20 },
  { name: '은평구', x: 22, y: 26 },
  { name: '광진구', x: 73, y: 49 },
  { name: '중랑구', x: 78, y: 36 },
  { name: '마포구', x: 14, y: 49 },
  { name: '용산구', x: 49, y: 59 },
  { name: '양천구', x: 15, y: 68 },
  { name: '영등포구', x: 31, y: 69 },
  { name: '금천구', x: 23, y: 86 },
  { name: '관악구', x: 52, y: 86 },
  { name: '서초구', x: 68, y: 83 },
  { name: '송파구', x: 86, y: 73 },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function panelClass(className?: string) {
  return cn(
    'rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,40,70,0.06)] sm:p-5',
    className,
  )
}

function HeaderUser() {
  return (
    <div className="hidden shrink-0 items-center gap-5 md:flex">
      <button type="button" aria-label="알림 12건" className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition hover:bg-blue-50">
        <Bell size={24} aria-hidden="true" />
        <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
          12
        </span>
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-slate-200 text-slate-700 shadow-sm" aria-hidden="true">
          <UserRound size={24} />
        </div>
        <button type="button" className="flex items-center gap-2 text-[14px] font-black text-slate-800">
          홍길동
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className="truncate text-[17px] font-black text-slate-950 sm:text-[18px]">{title}</h2>
      <CircleHelp size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
    </div>
  )
}

function SelectControl({ id, label, value, options, onChange, className }: SelectControlProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex h-12 w-full items-center rounded-xl border border-slate-200 bg-white px-4 shadow-[0_8px_20px_rgba(15,40,70,0.04)] transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 sm:w-auto',
        className,
      )}
    >
      <span className="mr-4 shrink-0 text-[13px] font-black text-slate-950">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 appearance-none bg-transparent pr-7 text-[13px] font-semibold text-slate-600 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 text-slate-500" aria-hidden="true" />
    </label>
  )
}

function FilterBar({
  district,
  period,
  status,
  onDistrictChange,
  onPeriodChange,
  onStatusChange,
  onReset,
  onDownload,
}: {
  district: string
  period: string
  status: string
  onDistrictChange: (value: string) => void
  onPeriodChange: (value: string) => void
  onStatusChange: (value: string) => void
  onReset: () => void
  onDownload: () => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:items-center">
      <SelectControl id="admin-district-filter" label="자치구" value={district} options={districtOptions} onChange={onDistrictChange} className="xl:min-w-[205px]" />
      <SelectControl id="admin-period-filter" label="기간" value={period} options={periodOptions} onChange={onPeriodChange} className="xl:min-w-[310px]" />
      <SelectControl id="admin-status-filter" label="처리 상태" value={status} options={statusOptions} onChange={onStatusChange} className="xl:min-w-[220px]" />
      <button
        type="button"
        onClick={onReset}
        className="flex h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-black text-slate-700 shadow-[0_8px_20px_rgba(15,40,70,0.04)] transition hover:border-blue-200 hover:bg-blue-50 sm:justify-start"
      >
        <RefreshCcw size={18} aria-hidden="true" />
        필터 초기화
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="flex h-12 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 text-[14px] font-black text-slate-700 shadow-[0_8px_20px_rgba(15,40,70,0.04)] transition hover:border-blue-200 hover:bg-blue-50 sm:justify-start xl:ml-auto"
      >
        <Download size={18} aria-hidden="true" />
        데이터 다운로드
      </button>
    </div>
  )
}

function kpiIcon(iconType: AdminKpiIconType) {
  const iconProps = { size: 32, 'aria-hidden': true }

  if (iconType === 'filePlus') {
    return <FilePlus2 {...iconProps} />
  }

  if (iconType === 'alertTriangle') {
    return <AlertTriangle {...iconProps} fill="currentColor" />
  }

  if (iconType === 'clock') {
    return <Clock3 {...iconProps} />
  }

  return <Cpu {...iconProps} />
}

function KpiCard({ stat }: { stat: (typeof adminKpiStats)[number] }) {
  const color = colorStyles[stat.colorType]
  const directionLabel = stat.deltaDirection === 'up' ? '▲' : '▼'
  const deltaClass = stat.id === 'urgent-repair' ? 'text-red-500' : stat.deltaDirection === 'down' ? 'text-emerald-600' : color.text

  return (
    <section className={panelClass('min-h-[146px]')}>
      <div className="flex h-full items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-black text-slate-950 sm:text-[16px]">{stat.title}</h3>
            <CircleHelp size={15} className="text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className={cn('text-[38px] font-black leading-none sm:text-[42px]', color.value)}>{stat.value}</span>
            <span className="mb-1 text-[15px] font-black text-slate-700">{stat.unit}</span>
          </div>
          <p className="mt-5 text-[13px] font-semibold text-slate-500">{stat.description}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="whitespace-nowrap text-[12px] font-bold text-slate-500">
            전일 대비 <span className={cn('ml-1 font-black', deltaClass)}>{directionLabel} {stat.deltaLabel}</span>
          </p>
          <div className={cn('ml-auto mt-7 flex h-14 w-14 items-center justify-center rounded-xl', color.iconBg)}>
            {kpiIcon(stat.iconType)}
          </div>
        </div>
      </div>
    </section>
  )
}

function LegendItem({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('h-2.5 w-2.5 rounded-full', colorClass)} aria-hidden="true" />
      {label}
    </span>
  )
}

function TrendChart() {
  const [viewMode, setViewMode] = useState('일별')
  const width = 760
  const height = 280
  const margin = { top: 24, right: 44, bottom: 42, left: 46 }
  const plotWidth = width - margin.left - margin.right
  const plotHeight = height - margin.top - margin.bottom
  const maxCount = 120
  const groupWidth = plotWidth / adminTrendData.length
  const barWidth = 11
  const linePoints = adminTrendData
    .map((item, index) => {
      const x = margin.left + groupWidth * index + groupWidth / 2
      const y = margin.top + ((100 - item.completionRate) / 100) * plotHeight
      return `${x},${y}`
    })
    .join(' ')
  const latest = adminTrendData[adminTrendData.length - 1]

  return (
    <section className={panelClass()}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="신고 및 처리 현황 추이" />
        <SelectControl id="admin-trend-view" label="집계" value={viewMode} options={['일별', '주별']} onChange={setViewMode} className="h-9 min-w-[112px] px-3 shadow-sm sm:w-auto" />
      </div>
      <div className="mb-3 flex flex-wrap justify-center gap-4 text-[12px] font-bold text-slate-600">
        <LegendItem colorClass="bg-blue-600" label="신고 건수" />
        <LegendItem colorClass="bg-emerald-500" label="보수 완료 건수" />
        <LegendItem colorClass="bg-purple-600" label="보수 완료율(%)" />
      </div>
      <div className="overflow-hidden rounded-xl bg-white">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="최근 30일 신고 건수, 보수 완료 건수, 보수 완료율 추이" className="h-[250px] w-full sm:h-[270px]">
          {[120, 100, 80, 60, 40, 20, 0].map((tick) => {
            const y = margin.top + ((maxCount - tick) / maxCount) * plotHeight
            return (
              <g key={tick}>
                <text x={34} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-bold">
                  {tick}
                </text>
                <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              </g>
            )
          })}
          {[100, 80, 60, 40, 20, 0].map((tick) => {
            const y = margin.top + ((100 - tick) / 100) * plotHeight
            return (
              <text key={tick} x={width - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-bold">
                {tick}%
              </text>
            )
          })}
          {adminTrendData.map((item, index) => {
            const centerX = margin.left + groupWidth * index + groupWidth / 2
            const reportHeight = (item.reportCount / maxCount) * plotHeight
            const repairedHeight = (item.repairedCount / maxCount) * plotHeight
            const reportY = margin.top + plotHeight - reportHeight
            const repairedY = margin.top + plotHeight - repairedHeight

            return (
              <g key={item.date}>
                <rect x={centerX - barWidth - 2} y={reportY} width={barWidth} height={reportHeight} rx="3" fill="#2563EB" />
                <rect x={centerX + 2} y={repairedY} width={barWidth} height={repairedHeight} rx="3" fill="#10B981" />
                <text x={centerX} y={height - 16} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
                  {item.date}
                </text>
              </g>
            )
          })}
          <polyline points={linePoints} fill="none" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {adminTrendData.map((item, index) => {
            const x = margin.left + groupWidth * index + groupWidth / 2
            const y = margin.top + ((100 - item.completionRate) / 100) * plotHeight
            return <circle key={`${item.date}-rate`} cx={x} cy={y} r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
          })}
        </svg>
      </div>
      <div className="mt-3 grid gap-2 text-[12px] font-bold text-slate-600 sm:grid-cols-3">
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700">최근 신고 최고: 06.05 100건</p>
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">보수 완료 최고: 06.05 72건</p>
        <p className="rounded-lg bg-purple-50 px-3 py-2 text-purple-700">최근 완료율: {latest.completionRate}%</p>
      </div>
    </section>
  )
}

function buildDonutGradient(items: AdminRiskDistributionItem[]) {
  let cursor = 0
  const segments = items.map((item) => {
    const start = cursor
    const end = cursor + item.percent
    cursor = end
    return `${donutColors[item.colorType]} ${start}% ${end}%`
  })

  return `conic-gradient(${segments.join(', ')})`
}

function DonutChart() {
  const [scope, setScope] = useState('전체')
  const total = adminRiskDistribution.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className={panelClass()}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="위험도별 신고 분포" />
        <SelectControl id="admin-risk-distribution-scope" label="범위" value={scope} options={['전체', '미처리', '보수 완료']} onChange={setScope} className="h-9 min-w-[108px] px-3 shadow-sm sm:w-auto" />
      </div>
      <div className="grid items-center gap-5 sm:grid-cols-[165px_1fr] xl:grid-cols-1 2xl:grid-cols-[165px_1fr]">
        <div className="relative mx-auto h-[165px] w-[165px] rounded-full" style={{ background: buildDonutGradient(adminRiskDistribution) }} aria-label="위험도별 신고 분포 도넛 차트">
          <div className="absolute inset-[28px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-[12px] font-bold text-slate-500">총</span>
            <span className="text-[22px] font-black text-slate-950">{formatNumber(total)}건</span>
          </div>
        </div>
        <div className="space-y-3">
          {adminRiskDistribution.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-[13px] font-bold text-slate-600">
              <span className="flex items-center gap-2">
                <span className={cn('h-3 w-3 rounded-sm', colorStyles[item.colorType].dot)} aria-hidden="true" />
                {item.label}
              </span>
              <span>{formatNumber(item.count)} ({item.percent.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImageWithFallback({ sources, alt, className, fallback }: { sources: string[]; alt: string; className: string; fallback: ReactNode }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const source = sources[sourceIndex]

  if (!source) {
    return <>{fallback}</>
  }

  return <img src={source} alt={alt} className={className} onError={() => setSourceIndex((current) => current + 1)} />
}

function MapBaseIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute left-[-35px] top-[82px] h-6 w-[470px] rotate-[-12deg] rounded-full bg-sky-100 shadow-[0_0_0_6px_rgba(255,255,255,0.55)]" />
      <div className="absolute left-[-20px] top-[150px] h-8 w-[460px] rotate-[15deg] rounded-full bg-sky-100 shadow-[0_0_0_6px_rgba(255,255,255,0.55)]" />
      <div className="absolute left-[55px] top-[-20px] h-[310px] w-4 rotate-[23deg] rounded-full bg-emerald-100 shadow-[0_0_0_6px_rgba(255,255,255,0.5)]" />
      <div className="absolute left-[210px] top-[-30px] h-[330px] w-3 rotate-[-28deg] rounded-full bg-slate-200/70" />
    </div>
  )
}

function SeoulRiskMap({ onMockAction }: { onMockAction: (message: string) => void }) {
  const [scope, setScope] = useState('전체')

  return (
    <section className={panelClass()}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="서울특별시 위험 분포" />
        <SelectControl id="admin-map-scope" label="범위" value={scope} options={['전체', '미처리', '긴급']} onChange={setScope} className="h-9 min-w-[108px] px-3 shadow-sm sm:w-auto" />
      </div>
      <div className="relative h-[252px] overflow-hidden rounded-xl border border-slate-100 bg-slate-100" role="img" aria-label="서울특별시 위험 분포 지도">
        <ImageWithFallback
          sources={['/assets/admin/admin-risk-map.webp', '/assets/admin/admin-risk-map.png']}
          alt="서울특별시 위험 분포 지도"
          className="absolute inset-0 h-full w-full object-cover"
          fallback={<MapBaseIllustration />}
        />
        {mapLabels.map((label) => (
          <span
            key={label.name}
            className="absolute rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-black text-slate-700 shadow-sm backdrop-blur-sm"
            style={{ left: `${label.x}%`, top: `${label.y}%` }}
          >
            {label.name}
          </span>
        ))}
        {adminMapRiskPoints.map((point) => {
          const style = mapRiskStyles[point.level]

          return (
            <div key={point.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-black', style.marker, style.halo)}>
                {point.value}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-slate-700 shadow-sm">
                {point.district}
              </span>
            </div>
          )
        })}
        <div className="absolute bottom-3 left-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
          <button type="button" aria-label="지도 확대" onClick={() => onMockAction('지도 확대 기능은 데모 화면입니다.')} className="flex h-8 w-8 items-center justify-center border-b border-slate-200 text-xl font-bold text-slate-700 transition hover:bg-blue-50">
            +
          </button>
          <button type="button" aria-label="지도 축소" onClick={() => onMockAction('지도 축소 기능은 데모 화면입니다.')} className="flex h-8 w-8 items-center justify-center text-xl font-bold text-slate-700 transition hover:bg-blue-50">
            −
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-600">
        <LegendItem colorClass="bg-red-500" label="매우 높음" />
        <LegendItem colorClass="bg-orange-400" label="높음" />
        <LegendItem colorClass="bg-yellow-400" label="보통" />
        <LegendItem colorClass="bg-emerald-500" label="낮음" />
        <LegendItem colorClass="bg-blue-500" label="매우 낮음" />
      </div>
    </section>
  )
}

function RiskGradeBadge({ riskGrade }: { riskGrade: AdminRiskGrade }) {
  return (
    <span className={cn('inline-flex rounded-md px-3 py-1 text-[12px] font-black ring-1 ring-inset', riskGradeStyles[riskGrade])}>
      {riskGrade}
    </span>
  )
}

function PriorityTable({ selectedTab, onTabChange }: { selectedTab: AdminPriorityTab; onTabChange: (tab: AdminPriorityTab) => void }) {
  const sortedAreas = useMemo(() => {
    const rows = [...adminPriorityAreas]

    if (selectedTab === 'reports') {
      return rows.sort((a, b) => b.reportCount - a.reportCount)
    }

    if (selectedTab === 'unresolved') {
      return rows.sort((a, b) => b.maxUnresolvedDays - a.maxUnresolvedDays)
    }

    return rows.sort((a, b) => a.rank - b.rank)
  }, [selectedTab])

  const tabs: { id: AdminPriorityTab; label: string }[] = [
    { id: 'risk', label: '위험도순' },
    { id: 'reports', label: '신고 수순' },
    { id: 'unresolved', label: '미처리 기간순' },
  ]

  return (
    <section className={panelClass()}>
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SectionTitle title="위험 지역 우선순위" />
        <div className="flex flex-wrap gap-2 text-[13px] font-black">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'rounded-lg px-3 py-2 transition',
                selectedTab === tab.id ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 text-[12px] font-black text-slate-500">
              <th className="px-4 py-3">순위</th>
              <th className="px-4 py-3">자치구</th>
              <th className="px-4 py-3">위험 등급</th>
              <th className="px-4 py-3">신고 수</th>
              <th className="px-4 py-3">미처리 건수</th>
              <th className="px-4 py-3">미처리 기간(최대)</th>
              <th className="px-4 py-3">전일 대비</th>
            </tr>
          </thead>
          <tbody>
            {sortedAreas.map((row) => (
              <PriorityTableRow key={row.district} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {sortedAreas.map((row) => (
          <article key={row.district} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-bold text-slate-500">순위 {row.rank}</p>
                <h3 className="mt-1 text-[18px] font-black text-slate-950">{row.district}</h3>
              </div>
              <RiskGradeBadge riskGrade={row.riskGrade} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <MetricDetail label="신고 수" value={`${row.reportCount}건`} />
              <MetricDetail label="미처리 건수" value={`${row.unresolvedCount}건`} />
              <MetricDetail label="미처리 기간" value={`${row.maxUnresolvedDays}일`} />
              <MetricDetail label="전일 대비" value={`${row.deltaDirection === 'up' ? '▲' : '▼'} ${row.deltaLabel}`} valueClassName={row.deltaDirection === 'up' ? 'text-red-500' : 'text-emerald-600'} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

function PriorityTableRow({ row }: { row: AdminPriorityArea }) {
  return (
    <tr className="border-t border-slate-200 text-[13px]">
      <td className="px-4 py-3 font-black text-slate-700">{row.rank}</td>
      <td className="px-4 py-3 font-black text-slate-950">{row.district}</td>
      <td className="px-4 py-3">
        <RiskGradeBadge riskGrade={row.riskGrade} />
      </td>
      <td className="px-4 py-3 font-black text-slate-800">{row.reportCount}</td>
      <td className="px-4 py-3 font-black text-slate-800">{row.unresolvedCount}</td>
      <td className="px-4 py-3 font-black text-slate-800">{row.maxUnresolvedDays}일</td>
      <td className={cn('px-4 py-3 font-black', row.deltaDirection === 'up' ? 'text-red-500' : 'text-emerald-600')}>
        {row.deltaDirection === 'up' ? '▲' : '▼'} {row.deltaLabel}
      </td>
    </tr>
  )
}

function MetricDetail({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn('mt-1 font-black text-slate-900', valueClassName)}>{value}</dd>
    </div>
  )
}

function priorityButtonClass(level: AdminRiskGrade, selectedLevel: AdminRiskGrade) {
  const base = 'rounded-md px-3 py-1.5 text-[12px] font-black ring-1 ring-inset transition'
  const activeStyles: Record<AdminRiskGrade, string> = {
    긴급: 'bg-red-600 text-white ring-red-600',
    주의: 'bg-orange-500 text-white ring-orange-500',
    관심: 'bg-yellow-400 text-slate-950 ring-yellow-400',
  }
  const idleStyles: Record<AdminRiskGrade, string> = {
    긴급: 'bg-red-50 text-red-700 ring-red-200 hover:bg-red-100',
    주의: 'bg-orange-50 text-orange-700 ring-orange-200 hover:bg-orange-100',
    관심: 'bg-yellow-50 text-yellow-700 ring-yellow-200 hover:bg-yellow-100',
  }

  return cn(base, selectedLevel === level ? activeStyles[level] : idleStyles[level])
}

function RepairAssignmentCard({ onAssigned }: { onAssigned: (message: string) => void }) {
  const [targetType, setTargetType] = useState<RepairTargetType>('district')
  const [selectedDistrict, setSelectedDistrict] = useState(assignmentDistrictOptions[0])
  const [selectedPriority, setSelectedPriority] = useState<AdminRiskGrade>('긴급')
  const [department, setDepartment] = useState(departmentOptions[0])
  const [memo, setMemo] = useState('')

  return (
    <section className={panelClass()}>
      <div className="mb-4">
        <SectionTitle title="우선 보수 지정" />
      </div>
      <fieldset className="flex flex-wrap items-center gap-6 text-[13px] font-bold text-slate-600">
        <legend className="sr-only">대상 선택</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="repair-target" value="district" checked={targetType === 'district'} onChange={() => setTargetType('district')} className="h-4 w-4 accent-blue-600" />
          자치구 선택
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="repair-target" value="report" checked={targetType === 'report'} onChange={() => setTargetType('report')} className="h-4 w-4 accent-blue-600" />
          신고 선택
        </label>
      </fieldset>
      <label htmlFor="repair-district-select" className="mt-4 block text-[13px] font-black text-slate-600">
        {targetType === 'district' ? '자치구' : '신고'}
      </label>
      <select
        id="repair-district-select"
        value={selectedDistrict}
        onChange={(event) => setSelectedDistrict(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {assignmentDistrictOptions.map((option) => (
          <option key={option} value={option}>
            {targetType === 'report' && option !== assignmentDistrictOptions[0] ? `${option} 주요 신고 묶음` : option}
          </option>
        ))}
      </select>
      <p className="mt-5 text-[13px] font-black text-slate-600">우선순위 등급</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {priorityLevels.map((level) => (
          <button key={level} type="button" aria-pressed={selectedPriority === level} onClick={() => setSelectedPriority(level)} className={priorityButtonClass(level, selectedPriority)}>
            {level}
          </button>
        ))}
      </div>
      <label htmlFor="repair-department-select" className="mt-5 block text-[13px] font-black text-slate-600">
        담당 기관
      </label>
      <select
        id="repair-department-select"
        value={department}
        onChange={(event) => setDepartment(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {departmentOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <label htmlFor="repair-memo" className="mt-5 block text-[13px] font-black text-slate-600">
        메모
      </label>
      <textarea
        id="repair-memo"
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        maxLength={100}
        placeholder="메모를 입력하세요 (최대 100자)"
        rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      <button
        type="button"
        onClick={() => onAssigned('우선 보수 지정 기능은 데모 화면입니다.')}
        className="mt-5 h-11 w-full rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:from-blue-700 hover:to-blue-600"
      >
        우선 보수 지정
      </button>
    </section>
  )
}

function statusIcon(iconType: AdminStatusIconType) {
  const props = { size: 21, 'aria-hidden': true }

  if (iconType === 'fileText') {
    return <FileText {...props} />
  }

  if (iconType === 'clipboard') {
    return <ClipboardList {...props} />
  }

  if (iconType === 'wrench') {
    return <Wrench {...props} />
  }

  if (iconType === 'check') {
    return <CheckCircle2 {...props} />
  }

  return <XCircle {...props} />
}

function StatusSummary({ onMockAction }: { onMockAction: (message: string) => void }) {
  return (
    <section className={panelClass()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle title="처리 상태 요약" />
        <button type="button" onClick={() => onMockAction('전체 보기 기능은 데모 화면입니다.')} className="flex shrink-0 items-center gap-1 text-[12px] font-black text-blue-700 transition hover:text-blue-800">
          전체 보기
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="space-y-1">
        {adminStatusSummary.map((item) => {
          const color = colorStyles[item.colorType]

          return (
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color.iconBg)}>
                  {statusIcon(item.iconType)}
                </span>
                <span className="text-[14px] font-black text-slate-700">{item.label}</span>
              </div>
              <p className="text-[20px] font-black text-slate-950">
                {formatNumber(item.count)} <span className="text-[13px] font-bold text-slate-500">건</span>
              </p>
            </div>
          )
        })}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-[12px] font-semibold text-slate-500">마지막 업데이트: 2024.06.05 09:30</p>
        <button type="button" aria-label="처리 상태 새로고침" onClick={() => onMockAction('새로고침 기능은 데모 화면입니다.')} className="rounded-lg p-2 text-blue-700 transition hover:bg-blue-50">
          <RefreshCcw size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export function AdminDashboardPage() {
  const [district, setDistrict] = useState(adminFilters.district)
  const [period, setPeriod] = useState(adminFilters.periodLabel)
  const [status, setStatus] = useState(adminFilters.status)
  const [selectedPriorityTab, setSelectedPriorityTab] = useState<AdminPriorityTab>('risk')
  const [mockMessage, setMockMessage] = useState('')

  const resetFilters = () => {
    setDistrict(adminFilters.district)
    setPeriod(adminFilters.periodLabel)
    setStatus(adminFilters.status)
    setMockMessage('필터가 기본값으로 초기화되었습니다. 데모 화면에서는 실제 조회를 수행하지 않습니다.')
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-black text-slate-950 sm:text-[34px]">관리자 대시보드</h1>
          <p className="mt-2 text-[15px] font-semibold text-slate-500">
            서울특별시 도로 위험 현황과 처리 성과를 한눈에 확인하세요.
          </p>
        </div>
        <HeaderUser />
      </header>

      <FilterBar
        district={district}
        period={period}
        status={status}
        onDistrictChange={setDistrict}
        onPeriodChange={setPeriod}
        onStatusChange={setStatus}
        onReset={resetFilters}
        onDownload={() => setMockMessage('데이터 다운로드 기능은 데모 화면입니다. 실제 파일은 생성되지 않습니다.')}
      />

      {mockMessage && (
        <p role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold text-blue-700">
          {mockMessage}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="관리자 주요 지표">
        {adminKpiStats.map((stat) => (
          <KpiCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr_1.2fr]">
        <TrendChart />
        <DonutChart />
        <SeoulRiskMap onMockAction={setMockMessage} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.8fr_0.8fr]">
        <PriorityTable selectedTab={selectedPriorityTab} onTabChange={setSelectedPriorityTab} />
        <RepairAssignmentCard onAssigned={setMockMessage} />
        <StatusSummary onMockAction={setMockMessage} />
      </section>
    </div>
  )
}
