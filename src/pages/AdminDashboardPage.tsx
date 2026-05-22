import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Download,
  FileText,
  RefreshCcw,
  Wrench,
  XCircle,
} from 'lucide-react'
import { getRiskDistrictRanking, getRiskZones } from '../api/riskApi'
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
  AdminMapRiskPoint,
  AdminMapRiskLevel,
  AdminPriorityArea,
  AdminPriorityTab,
  AdminRiskDistributionItem,
  AdminRiskGrade,
  AdminStatusIconType,
  RiskDistrictRanking,
  RiskGridResult,
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getNumberField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

function getStringField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function normalizeRiskScore(source: Record<string, unknown>) {
  const rawScore = getNumberField(source, ['riskScore', 'maxRiskScore', 'averageRiskScore', 'score', 'value'])

  if (rawScore === undefined) {
    return 0
  }

  if (rawScore > 0 && rawScore <= 1) {
    return Math.round(rawScore * 100)
  }

  if (rawScore > 1 && rawScore <= 10) {
    return Math.round(rawScore * 10)
  }

  return clamp(Math.round(rawScore), 0, 100)
}

function getAdminRiskGrade(score: number): AdminRiskGrade {
  if (score >= 70) {
    return '긴급'
  }

  if (score >= 40) {
    return '주의'
  }

  return '관심'
}

function getAdminMapRiskLevel(score: number): AdminMapRiskLevel {
  if (score >= 80) {
    return 'very-high'
  }

  if (score >= 60) {
    return 'high'
  }

  if (score >= 40) {
    return 'medium'
  }

  if (score >= 20) {
    return 'low'
  }

  return 'very-low'
}

function getMapPosition(result: RiskGridResult, fallback: AdminMapRiskPoint) {
  const latitude = getNumberField(result, ['centerLat', 'latitude', 'lat'])
  const longitude = getNumberField(result, ['centerLng', 'longitude', 'lng'])

  if (latitude === undefined || longitude === undefined) {
    return { x: fallback.x, y: fallback.y }
  }

  return {
    x: clamp(((longitude - 126.75) / (127.2 - 126.75)) * 100, 8, 92),
    y: clamp(((37.72 - latitude) / (37.72 - 37.42)) * 100, 10, 88),
  }
}

function toAdminMapRiskPoints(rows: RiskGridResult[]): AdminMapRiskPoint[] {
  return rows.slice(0, 8).map((row, index) => {
    const fallback = adminMapRiskPoints[index % adminMapRiskPoints.length]
    const score = normalizeRiskScore(row)
    const position = getMapPosition(row, fallback)
    const district = getStringField(row, ['districtName', 'district', 'guName']) ?? fallback.district
    const id = getStringField(row, ['gridCode', 'gridId', 'id']) ?? `risk-point-api-${index}`

    return {
      id,
      district,
      value: score,
      level: getAdminMapRiskLevel(score),
      x: position.x,
      y: position.y,
    }
  })
}

function toPriorityAreasFromRankings(rows: RiskDistrictRanking[]): AdminPriorityArea[] {
  return rows.slice(0, 10).map((row, index) => {
    const score = normalizeRiskScore(row)
    const totalGridCount = getNumberField(row, ['totalGridCount', 'gridCount']) ?? 0
    const highRiskGridCount = getNumberField(row, ['highRiskGridCount', 'dangerGridCount']) ?? 0
    const highRiskRatio = getNumberField(row, ['highRiskRatio']) ?? (totalGridCount > 0 ? (highRiskGridCount / totalGridCount) * 100 : score)

    return {
      rank: index + 1,
      district: getStringField(row, ['districtName', 'district', 'guName']) ?? `자치구 ${index + 1}`,
      riskGrade: getAdminRiskGrade(score),
      reportCount: totalGridCount,
      unresolvedCount: highRiskGridCount,
      maxUnresolvedDays: Math.round(getNumberField(row, ['maxRiskScore']) ?? score),
      deltaLabel: `${Math.round(highRiskRatio)}%`,
      deltaDirection: 'up',
    }
  })
}

function toPriorityAreasFromZones(rows: RiskGridResult[]): AdminPriorityArea[] {
  const aggregates = new Map<string, { count: number; highRiskCount: number; maxScore: number; scoreSum: number }>()

  rows.forEach((row) => {
    const district = getStringField(row, ['districtName', 'district', 'guName']) ?? '자치구 미확인'
    const score = normalizeRiskScore(row)
    const current = aggregates.get(district) ?? { count: 0, highRiskCount: 0, maxScore: 0, scoreSum: 0 }

    aggregates.set(district, {
      count: current.count + 1,
      highRiskCount: current.highRiskCount + (score >= 70 ? 1 : 0),
      maxScore: Math.max(current.maxScore, score),
      scoreSum: current.scoreSum + score,
    })
  })

  return Array.from(aggregates.entries())
    .map(([district, aggregate]) => ({
      district,
      score: aggregate.scoreSum / Math.max(1, aggregate.count),
      ...aggregate,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((aggregate, index) => ({
      rank: index + 1,
      district: aggregate.district,
      riskGrade: getAdminRiskGrade(aggregate.maxScore),
      reportCount: aggregate.count,
      unresolvedCount: aggregate.highRiskCount,
      maxUnresolvedDays: Math.round(aggregate.maxScore),
      deltaLabel: `${Math.round((aggregate.highRiskCount / Math.max(1, aggregate.count)) * 100)}%`,
      deltaDirection: 'up',
    }))
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function panelClass(className?: string) {
  return cn(
    'rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,40,70,0.06)]',
    className,
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

function KpiFilePlusIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 4h11l5 5v18.5A2.5 2.5 0 0 1 21.5 30h-11A2.5 2.5 0 0 1 8 27.5v-21A2.5 2.5 0 0 1 10.5 4Z" fill="currentColor" />
      <path d="M19 4v5.5A1.5 1.5 0 0 0 20.5 11H24" fill="#DBEAFE" />
      <path d="M12 15h8M12 19h7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <circle cx="24" cy="24" r="6" fill="white" />
      <circle cx="24" cy="24" r="5" fill="currentColor" />
      <path d="M24 21v6M21 24h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function KpiUrgentIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 5 27 24H5L16 5Z" fill="currentColor" />
      <path d="M16 11v7" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="21.5" r="1.6" fill="white" />
      <path d="M11 25.5h10M13 28h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
    </svg>
  )
}

function KpiClockIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="currentColor" />
      <path d="M16 9.5V16l4.8 3" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function KpiAiChipIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 11H3M6 16H3M6 21H3M29 11h-3M29 16h-3M29 21h-3M11 6V3M16 6V3M21 6V3M11 29v-3M16 29v-3M21 29v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <rect x="7" y="7" width="18" height="18" rx="5" fill="currentColor" />
      <rect x="10" y="10" width="12" height="12" rx="3" fill="white" opacity="0.14" />
      <text x="16" y="19" textAnchor="middle" fontSize="8" fontWeight="900" fill="white">
        AI
      </text>
    </svg>
  )
}

function kpiIcon(iconType: AdminKpiIconType) {

  if (iconType === 'filePlus') {
    return <KpiFilePlusIcon />
  }

  if (iconType === 'alertTriangle') {
    return <KpiUrgentIcon />
  }

  if (iconType === 'clock') {
    return <KpiClockIcon />
  }

  return <KpiAiChipIcon />
}

function KpiCard({ stat }: { stat: (typeof adminKpiStats)[number] }) {
  const color = colorStyles[stat.colorType]
  const directionLabel = stat.deltaDirection === 'up' ? '▲' : '▼'
  const deltaClass = stat.id === 'urgent-repair' ? 'text-red-500' : stat.deltaDirection === 'down' ? 'text-emerald-600' : color.text

  return (
    <section className={panelClass('min-h-[136px]')}>
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
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="최근 30일 신고 건수, 보수 완료 건수, 보수 완료율 추이" className="h-[190px] w-full sm:h-[205px]">
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

function SeoulRiskMap({ onMockAction, points }: { onMockAction: (message: string) => void; points: AdminMapRiskPoint[] }) {
  const [scope, setScope] = useState('전체')

  return (
    <section className={panelClass()}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="서울특별시 위험 분포" />
        <SelectControl id="admin-map-scope" label="범위" value={scope} options={['전체', '미처리', '긴급']} onChange={setScope} className="h-9 min-w-[108px] px-3 shadow-sm sm:w-auto" />
      </div>
      <div className="relative h-[200px] overflow-hidden rounded-xl border border-slate-100 bg-slate-100" role="img" aria-label="서울특별시 위험 분포 지도">
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
        {points.map((point) => {
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

function PriorityTable({
  areas,
  selectedTab,
  onTabChange,
}: {
  areas: AdminPriorityArea[]
  selectedTab: AdminPriorityTab
  onTabChange: (tab: AdminPriorityTab) => void
}) {
  const sortedAreas = useMemo(() => {
    const rows = [...areas]

    if (selectedTab === 'reports') {
      return rows.sort((a, b) => b.reportCount - a.reportCount)
    }

    if (selectedTab === 'unresolved') {
      return rows.sort((a, b) => b.maxUnresolvedDays - a.maxUnresolvedDays)
    }

    return rows.sort((a, b) => a.rank - b.rank)
  }, [areas, selectedTab])

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
  const base = 'rounded-md px-3 py-1 text-[12px] font-black ring-1 ring-inset transition'
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
      <select
        id="repair-district-select"
        aria-label={targetType === 'district' ? '자치구 선택' : '신고 선택'}
        value={selectedDistrict}
        onChange={(event) => setSelectedDistrict(event.target.value)}
        className="mt-3 h-8 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {assignmentDistrictOptions.map((option) => (
          <option key={option} value={option}>
            {targetType === 'report' && option !== assignmentDistrictOptions[0] ? `${option} 주요 신고 묶음` : option}
          </option>
        ))}
      </select>
      <p className="mt-2 text-[13px] font-black text-slate-600">우선순위 등급</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {priorityLevels.map((level) => (
          <button key={level} type="button" aria-pressed={selectedPriority === level} onClick={() => setSelectedPriority(level)} className={priorityButtonClass(level, selectedPriority)}>
            {level}
          </button>
        ))}
      </div>
      <label htmlFor="repair-department-select" className="mt-2 block text-[13px] font-black text-slate-600">
        담당 기관
      </label>
      <select
        id="repair-department-select"
        value={department}
        onChange={(event) => setDepartment(event.target.value)}
        className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {departmentOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <label htmlFor="repair-memo" className="mt-2 block text-[13px] font-black text-slate-600">
        메모
      </label>
      <input
        id="repair-memo"
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        maxLength={100}
        placeholder="메모를 입력하세요 (최대 100자)"
        className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
      <button
        type="button"
        onClick={() => onAssigned('우선 보수 지정 기능은 데모 화면입니다.')}
        className="mt-2 h-9 w-full rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-[14px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:from-blue-700 hover:to-blue-600"
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
    return <ClipboardCheck {...props} />
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
            <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
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
  const [priorityAreas, setPriorityAreas] = useState<AdminPriorityArea[]>(adminPriorityAreas)
  const [mapRiskPoints, setMapRiskPoints] = useState<AdminMapRiskPoint[]>(adminMapRiskPoints)
  const [isRiskLoading, setIsRiskLoading] = useState(true)
  const [riskApiNotice, setRiskApiNotice] = useState('')
  const [mockMessage, setMockMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadDashboardRiskData() {
      const districtName = district === '전체' ? undefined : district
      setIsRiskLoading(true)
      setRiskApiNotice('')

      const [zonesResult, rankingResult] = await Promise.allSettled([
        getRiskZones(districtName),
        getRiskDistrictRanking(),
      ])

      if (ignore) {
        return
      }

      const zoneRows = zonesResult.status === 'fulfilled' ? zonesResult.value : []
      const rankingRows = rankingResult.status === 'fulfilled' ? rankingResult.value : []
      const filteredRankingRows = districtName
        ? rankingRows.filter((row) => getStringField(row, ['districtName', 'district', 'guName']) === districtName)
        : rankingRows

      setMapRiskPoints(zoneRows.length > 0 ? toAdminMapRiskPoints(zoneRows) : adminMapRiskPoints)

      if (filteredRankingRows.length > 0) {
        setPriorityAreas(toPriorityAreasFromRankings(filteredRankingRows))
      } else if (zoneRows.length > 0) {
        setPriorityAreas(toPriorityAreasFromZones(zoneRows))
      } else {
        setPriorityAreas(adminPriorityAreas)
      }

      if (zonesResult.status === 'rejected' || rankingResult.status === 'rejected') {
        setRiskApiNotice('위험도 대시보드 API를 불러오지 못해 데모 데이터를 표시합니다. Swagger에 risk/dashboard 엔드포인트가 노출되어 있는지 확인해 주세요.')
      }

      setIsRiskLoading(false)
    }

    void loadDashboardRiskData()

    return () => {
      ignore = true
    }
  }, [district])

  const resetFilters = () => {
    setDistrict(adminFilters.district)
    setPeriod(adminFilters.periodLabel)
    setStatus(adminFilters.status)
    setMockMessage('필터가 기본값으로 초기화되었습니다. 위험도 API를 다시 조회합니다.')
  }

  return (
    <div className="space-y-4">
      <header className="pr-0 lg:pr-56">
        <div>
          <h1 className="text-[30px] font-black text-slate-950 sm:text-[34px]">관리자 대시보드</h1>
          <p className="mt-2 text-[15px] font-semibold text-slate-500">
            서울특별시 도로 위험 현황과 처리 성과를 한눈에 확인하세요.
          </p>
        </div>
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

      {(isRiskLoading || riskApiNotice) && (
        <p role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-5 text-blue-700">
          {isRiskLoading ? '위험도 대시보드 데이터를 불러오는 중입니다.' : riskApiNotice}
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
        <SeoulRiskMap points={mapRiskPoints} onMockAction={setMockMessage} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.8fr_0.8fr]">
        <PriorityTable areas={priorityAreas} selectedTab={selectedPriorityTab} onTabChange={setSelectedPriorityTab} />
        <RepairAssignmentCard onAssigned={setMockMessage} />
        <StatusSummary onMockAction={setMockMessage} />
      </section>
    </div>
  )
}
