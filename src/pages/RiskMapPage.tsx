import { lazy, Suspense, type ReactNode, useEffect, useState } from 'react'
import {
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CloudRain,
  Construction,
  Cpu,
  Droplets,
  RefreshCcw,
  Siren,
  UserRound,
} from 'lucide-react'
import { getCitizenReports } from '../api/reportApi'
import { getGridRiskResult, getLatestGridRiskResults, getRiskMapSummary, getRiskZones } from '../api/riskApi'
import { riskLegend, riskMapFilters } from '../data/mockData'
import type { RiskGridResult, RiskMapFilterId, RiskMapHighZone, RiskMapHighZoneGrade, RiskMapLegendItem, RiskMapStats, RiskMapSummaryResponse } from '../types'
import { cn } from '../utils/cn'

const KakaoRiskMap = lazy(() =>
  import('../components/risk/KakaoRiskMap').then((module) => ({
    default: module.KakaoRiskMap,
  })),
)

type StatColor = 'red' | 'blue' | 'teal'

const defaultFilterValues: Record<RiskMapFilterId, string> = {
  rainfall: '최근 7일 (누적)',
  roadYear: '전체',
  sewerAging: '전체',
  undergroundConstruction: '전체',
}

const RISK_EMPTY_NOTICE = '표시할 실제 위험도 데이터가 없습니다. 위험도 산출 후 다시 확인해 주세요.'
const RISK_COORDINATE_NOTICE = '실제 위험도 데이터에 지도 좌표가 없어 목록만 표시합니다.'
const RISK_SUMMARY_API_NOTICE = '위험도 요약 API 오류로 지도만 먼저 표시하고 대체 데이터를 확인합니다.'
const MAX_MAP_ROWS_FOR_RENDER = 80
const FALLBACK_REQUEST_TIMEOUT_MS = 1800

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
  '매우 높음': 'bg-red-600 text-white',
  위험: 'bg-red-600 text-white',
  높음: 'bg-orange-500 text-white',
  보통: 'bg-yellow-400 text-slate-900',
  낮음: 'bg-green-500 text-white',
  안전: 'bg-green-500 text-white',
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

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function getNumberField(result: RiskGridResult, keys: string[]) {
  for (const key of keys) {
    const value = result[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

function getStringField(result: RiskGridResult, keys: string[]) {
  for (const key of keys) {
    const value = result[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function normalizeRiskScore(result: RiskGridResult) {
  const rawScore = getNumberField(result, ['riskScore', 'score', 'riskPercent', 'value'])

  if (rawScore === undefined) {
    const probability = getNumberField(result, ['probability'])
    return probability === undefined ? 0 : clampPercent(probability * 100)
  }

  return clampPercent(rawScore)
}

function hasMapCoordinates(result: RiskGridResult) {
  return getNumberField(result, ['centerLat', 'latitude', 'lat']) !== undefined && getNumberField(result, ['centerLng', 'longitude', 'lng']) !== undefined
}

function getRiskGrade(result: RiskGridResult, riskPercent: number): RiskMapHighZoneGrade {
  const rawGrade = getStringField(result, ['riskGrade', 'riskLevel', 'grade', 'level'])

  if (rawGrade) {
    const gradeMap: Record<string, RiskMapHighZoneGrade> = {
      위험: '위험',
      주의: '주의',
      관심: '관심',
      안전: '안전',
      CRITICAL: '매우 높음',
      VERY_HIGH: '매우 높음',
      DANGER: '위험',
      HIGH: '높음',
      LARGE: '높음',
      MEDIUM: '주의',
      CAUTION: '주의',
      WARNING: '주의',
      LOW: '안전',
      ATTENTION: '관심',
      SAFE: '안전',
      NONE: '안전',
    }
    return gradeMap[rawGrade] ?? gradeMap[rawGrade.toUpperCase()] ?? (riskPercent >= 70 ? '위험' : riskPercent >= 40 ? '주의' : riskPercent >= 20 ? '관심' : '안전')
  }

  if (riskPercent >= 70) {
    return '위험'
  }

  if (riskPercent >= 40) {
    return '주의'
  }

  if (riskPercent >= 20) {
    return '관심'
  }

  return '안전'
}

function getRiskSortValue(result: RiskGridResult) {
  const riskPercent = normalizeRiskScore(result)
  const riskGrade = getRiskGrade(result, riskPercent)
  const gradeWeight: Record<RiskMapHighZoneGrade, number> = {
    긴급: 5,
    '매우 높음': 5,
    위험: 4,
    높음: 4,
    주의: 3,
    보통: 3,
    관심: 2,
    낮음: 1,
    안전: 0,
    '안전/관찰': 0,
  }

  return gradeWeight[riskGrade] * 1000 + riskPercent
}

function sortRiskRowsByPriority(results: RiskGridResult[]) {
  return [...results].sort((a, b) => getRiskSortValue(b) - getRiskSortValue(a))
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('API request timeout'))
    }, timeoutMs)

    promise
      .then(resolve, reject)
      .finally(() => window.clearTimeout(timer))
  })
}

function getRiskReasons(result: RiskGridResult) {
  const reasons = [
    { label: '강수 영향', score: getNumberField(result, ['rainfallScore']) },
    { label: '교통량 영향', score: getNumberField(result, ['trafficScore']) },
    { label: '하수관 노후', score: getNumberField(result, ['sewerScore', 'sewerAgingScore']) },
    { label: '굴착 공사', score: getNumberField(result, ['excavationScore', 'undergroundConstructionScore']) },
    { label: '포트홀 이력', score: getNumberField(result, ['potholeScore']) },
  ]
    .filter((item): item is { label: string; score: number } => typeof item.score === 'number' && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.label)

  return reasons.length > 0 ? reasons : ['위험도 산정 결과']
}

function formatRiskTime(value: string | undefined) {
  if (!value) {
    return '최근 산출'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '최근 산출'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getCoordinateText(result: RiskGridResult) {
  const latitude = getNumberField(result, ['centerLat', 'latitude', 'lat'])
  const longitude = getNumberField(result, ['centerLng', 'longitude', 'lng'])

  if (latitude === undefined || longitude === undefined) {
    return undefined
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

function toRiskMapHighZone(result: RiskGridResult, index: number): RiskMapHighZone {
  const riskPercent = normalizeRiskScore(result)
  const gridCode = getStringField(result, ['gridCode', 'gridId', 'id'])
  const districtName = getStringField(result, ['districtName', 'district', 'guName'])
  const derivedRoadName = [districtName, gridCode].filter(Boolean).join(' ')
  const apiRoadName = getStringField(result, ['roadName', 'address'])
  const roadName = apiRoadName ?? (derivedRoadName || `위험 격자 ${index + 1}`)
  const detailLocation = getCoordinateText(result) ?? (gridCode ? `격자 ${gridCode}` : '좌표 정보 확인 필요')

  return {
    id: gridCode ?? `risk-zone-api-${index}`,
    riskGrade: getRiskGrade(result, riskPercent),
    roadName,
    detailLocation,
    riskPercent,
    reasons: getRiskReasons(result),
    recentReportTime: formatRiskTime(result.updatedAt ?? result.calculatedAt),
    reportCount: getNumberField(result, ['reportCount', 'recentReportCount']) ?? 0,
    status: riskPercent >= 70 ? '점검 중' : riskPercent >= 40 ? '접수 완료' : riskPercent >= 20 ? '모니터링' : '보수 완료',
    expectedAction: riskPercent >= 70 ? '당일 내' : riskPercent >= 40 ? '1~2일 내' : riskPercent >= 20 ? '3~5일 내' : '관찰',
  }
}

type RiskMapStatsView = Partial<RiskMapStats>

function buildRiskMapStats(results: RiskGridResult[], recentReportCount?: number): RiskMapStatsView {
  const highRiskGrades = new Set<RiskMapHighZoneGrade>(['긴급', '매우 높음', '위험', '높음'])
  const highRiskCount = results.filter((result) => {
    const riskPercent = normalizeRiskScore(result)
    return riskPercent >= 70 || highRiskGrades.has(getRiskGrade(result, riskPercent))
  }).length

  return {
    highRiskCount,
    recentReportCount,
  }
}

function buildRiskMapStatsFromSummary(summary: RiskMapSummaryResponse, fallbackRows: RiskGridResult[]): RiskMapStatsView | null {
  const stats = summary.stats

  if (!stats) {
    return fallbackRows.length > 0 ? buildRiskMapStats(fallbackRows) : null
  }

  return {
    highRiskCount: stats.highRiskCount,
    recentReportCount: stats.recentReportCount,
  }
}

function FilterBar() {
  const [filterValues, setFilterValues] = useState<Record<RiskMapFilterId, string>>(defaultFilterValues)

  const resetFilters = () => {
    setFilterValues(defaultFilterValues)
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:flex sm:flex-wrap">
      {riskMapFilters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className="flex h-[60px] min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left shadow-[0_10px_26px_rgba(15,40,70,0.05)] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-blue-400 sm:h-[64px] sm:min-w-[180px] sm:flex-none sm:px-5"
          aria-label={`${filter.title} 필터, 현재 값 ${filterValues[filter.id]}`}
        >
          <span className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="shrink-0 text-blue-700">{filterIcons[filter.id]}</span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-black tracking-[-0.02em] text-[#07182F] min-[380px]:text-[13px] sm:text-[14px] sm:tracking-[-0.04em]">{filter.title}</span>
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
        className="col-span-2 flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-black tracking-[-0.02em] text-slate-700 shadow-[0_10px_26px_rgba(15,40,70,0.05)] transition hover:border-blue-200 hover:bg-blue-50/40 focus-visible:outline-blue-400 sm:h-[64px] sm:min-w-[132px] sm:flex-none sm:text-[14px] sm:tracking-[-0.04em]"
      >
        <RefreshCcw size={20} className="text-slate-600 sm:size-[22px]" aria-hidden="true" />
        <span className="whitespace-nowrap">필터 초기화</span>
      </button>
    </div>
  )
}

function ReportFilePlusIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <path d="M12 6h15.6L35 13.4V36a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Z" fill="currentColor" />
      <path d="M27.5 6v7.2a2.1 2.1 0 0 0 2.1 2.1H35" fill="#DBEAFE" />
      <path d="M17.5 20h10M17.5 25h9" stroke="white" strokeWidth="2.6" strokeLinecap="round" opacity="0.92" />
      <circle cx="34" cy="34" r="8.2" fill="white" />
      <circle cx="34" cy="34" r="6.7" fill="currentColor" />
      <path d="M34 30.2v7.6M30.2 34h7.6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
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
    <section className="h-full min-h-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,40,70,0.06)]">
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

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span className={cn('text-[40px] font-black leading-none tracking-[-0.04em]', colorStyle.value)}>{value}</span>
            {unit && <span className="mb-1 text-[17px] font-black tracking-[-0.04em] text-slate-800">{unit}</span>}
          </div>
          <p className="mt-2 text-[13px] font-bold text-slate-500">
            전일 대비 <span className={colorStyle.change}>{change}</span>
          </p>
        </div>
        <div className={cn('flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl', colorStyle.bg, colorStyle.icon)}>
          {icon}
        </div>
      </div>
    </section>
  )
}

function RiskLegendCard() {
  return (
    <section className="min-h-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,40,70,0.06)]">
      <h2 className="text-[17px] font-black tracking-[-0.05em] text-[#07182F]">위험 등급 범례</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {riskLegend.map((item) => (
          <div key={item.id} className="text-center">
            <span className={cn('mx-auto block h-3 w-3 rounded-full', legendDotClasses[item.color])} />
            <p className="mt-1 text-[11px] font-black text-slate-700">{item.label}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">({item.range})</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] font-semibold leading-relaxed tracking-[-0.04em] text-slate-500">
        지도 원형 마커 기준 위험도 색상입니다.
      </p>
    </section>
  )
}

function formatStatValue(value: number | undefined, fractionDigits = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-'
  }

  return fractionDigits > 0 ? value.toFixed(fractionDigits) : String(value)
}

function RiskSummaryPanel({ stats }: { stats: RiskMapStatsView | null }) {
  return (
    <aside className="grid gap-3 sm:grid-cols-2 xl:h-[560px] xl:grid-cols-1 xl:grid-rows-[132px_132px_132px_minmax(0,1fr)]">
      <StatSummaryCard
        title="오늘의 고위험 구간"
        value={formatStatValue(stats?.highRiskCount)}
        unit="개 구간"
        change="실제 데이터 기준"
        color="red"
        icon={<Siren size={44} fill="currentColor" aria-hidden="true" />}
      />
      <StatSummaryCard
        title="최근 신고 수"
        caption="(최근 7일)"
        value={formatStatValue(stats?.recentReportCount)}
        unit="건"
        change="실제 데이터 기준"
        color="blue"
        icon={<ReportFilePlusIcon />}
      />
      <StatSummaryCard
        title="AI 예측 정확도"
        caption="(최근 30일)"
        value={formatStatValue(stats?.aiAccuracy, 1)}
        unit="%"
        change="운영 지표 연동 필요"
        color="teal"
        icon={<Cpu size={44} aria-hidden="true" />}
      />
      <RiskLegendCard />
    </aside>
  )
}

function RiskMapLoadingFrame() {
  return (
    <section className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-center shadow-[0_18px_45px_rgba(15,40,70,0.08)] sm:h-[500px] xl:h-[560px]">
      <p className="text-[14px] font-bold leading-6 text-slate-600">지도를 준비하는 중입니다.</p>
    </section>
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

function RiskHighZoneTable({ zones }: { zones: RiskMapHighZone[] }) {
  if (zones.length === 0) {
    return (
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-[0_12px_32px_rgba(15,40,70,0.06)]">
        <h2 className="text-[20px] font-black tracking-[-0.06em] text-[#07182F]">최근 고위험 구간</h2>
        <p className="mt-3 text-[13px] font-bold text-slate-500">실제 위험 구간 데이터가 없습니다.</p>
      </section>
    )
  }

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
            {zones.map((zone) => (
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
        {zones.map((zone) => (
          <RiskHighZoneMobileCard key={zone.id} zone={zone} />
        ))}
      </div>
    </section>
  )
}

export function RiskMapPage() {
  const [zones, setZones] = useState<RiskMapHighZone[]>([])
  const [stats, setStats] = useState<RiskMapStatsView | null>(null)
  const [gridResults, setGridResults] = useState<RiskGridResult[]>([])
  const [selectedGrid, setSelectedGrid] = useState<RiskGridResult | null>(null)
  const [selectedGridCode, setSelectedGridCode] = useState<string | undefined>()
  const [isGridDetailLoading, setIsGridDetailLoading] = useState(false)
  const [isRiskLoading, setIsRiskLoading] = useState(true)
  const [riskNotice, setRiskNotice] = useState('')

  useEffect(() => {
    let ignore = false

    function applyRiskRows({
      mapRows,
      recentReportCount,
      statsView,
      zoneRows,
    }: {
      mapRows: RiskGridResult[]
      recentReportCount?: number
      statsView?: RiskMapStatsView | null
      zoneRows: RiskGridResult[]
    }) {
      const mapCoordinateRows = mapRows.filter(hasMapCoordinates)
      const visibleMapRows = sortRiskRowsByPriority(mapCoordinateRows).slice(0, MAX_MAP_ROWS_FOR_RENDER)
      const zoneSourceRows = zoneRows.length > 0 ? zoneRows : mapRows
      const sortedRiskRows = sortRiskRowsByPriority(zoneSourceRows)
      const apiZones = sortedRiskRows.slice(0, 8).map(toRiskMapHighZone)

      setGridResults(visibleMapRows)
      setZones(apiZones)
      setStats(statsView ?? (mapRows.length > 0 ? buildRiskMapStats(mapRows, recentReportCount) : null))
      setSelectedGrid(null)
      setSelectedGridCode(undefined)

      if (mapRows.length === 0) {
        setRiskNotice(RISK_EMPTY_NOTICE)
      } else if (mapCoordinateRows.length === 0) {
        setRiskNotice(RISK_COORDINATE_NOTICE)
      } else {
        setRiskNotice('')
      }
    }

    async function loadFallbackRiskData() {
      const [latestResult, zonesResult] = await Promise.allSettled([
        withTimeout(getLatestGridRiskResults(), FALLBACK_REQUEST_TIMEOUT_MS),
        withTimeout(getRiskZones(), FALLBACK_REQUEST_TIMEOUT_MS),
      ])

      if (ignore) {
        return
      }

      const latestRows = latestResult.status === 'fulfilled' ? latestResult.value : []
      const zoneRows = zonesResult.status === 'fulfilled' ? zonesResult.value : []
      const mapRows = latestRows.length > 0 ? latestRows : zoneRows

      applyRiskRows({
        mapRows,
        zoneRows,
      })

      if (latestResult.status === 'rejected' && zonesResult.status === 'rejected') {
        setRiskNotice('실제 위험도 API 연결에 실패했습니다. 백엔드 상태를 확인해 주세요.')
      }

      void withTimeout(getCitizenReports(50), FALLBACK_REQUEST_TIMEOUT_MS)
        .then((reportRows) => {
          if (ignore) {
            return
          }

          setStats((currentStats) => ({
            ...(currentStats ?? buildRiskMapStats(mapRows)),
            recentReportCount: reportRows.length,
          }))
        })
        .catch(() => undefined)
    }

    async function loadRiskData() {
      setIsRiskLoading(true)
      setRiskNotice('')

      try {
        const summary = await getRiskMapSummary({ markerLimit: 40, zoneLimit: 8 })

        if (ignore) {
          return
        }

        const mapRows = summary.markers ?? []
        const zoneRows = summary.zones ?? []

        applyRiskRows({
          mapRows,
          statsView: buildRiskMapStatsFromSummary(summary, mapRows),
          zoneRows,
        })
      } catch {
        if (!ignore) {
          setRiskNotice(RISK_SUMMARY_API_NOTICE)
          setIsRiskLoading(false)
        }

        void loadFallbackRiskData()
        return
      }

      if (!ignore) {
        setIsRiskLoading(false)
      }
    }

    void loadRiskData()

    return () => {
      ignore = true
    }
  }, [])

  const handleSelectGrid = async (result: RiskGridResult) => {
    const gridCode = getStringField(result, ['gridCode', 'gridId'])

    setSelectedGrid(result)
    setSelectedGridCode(gridCode)
    setIsGridDetailLoading(false)

    if (!gridCode) {
      return
    }

    setIsGridDetailLoading(true)

    try {
      const detail = await getGridRiskResult(gridCode)

      setSelectedGrid((current) => {
        const currentGridCode = current ? getStringField(current, ['gridCode', 'gridId']) : undefined
        return currentGridCode === gridCode ? { ...current, ...detail } : current
      })
    } catch {
      setSelectedGrid(result)
    } finally {
      setIsGridDetailLoading(false)
    }
  }

  return (
    <div className="min-w-0">
      <div>
        <h1 className="text-[30px] font-black tracking-[-0.06em] text-[#07182F] sm:text-[34px]">AI 위험 예측지도</h1>
        <p className="mt-2 text-[15px] font-semibold tracking-[-0.04em] text-slate-500">
          AI가 예측한 포트홀 위험도를 지도에서 확인하세요.
        </p>
      </div>

      <FilterBar />

      {(isRiskLoading || riskNotice) && (
        <p role="status" className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-5 text-blue-700">
          {isRiskLoading ? '위험도 데이터를 불러오는 중입니다.' : riskNotice}
        </p>
      )}

      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_316px]">
        <Suspense fallback={<RiskMapLoadingFrame />}>
          <KakaoRiskMap
            activeGridCode={selectedGridCode}
            gridResults={gridResults}
            isGridDetailLoading={isGridDetailLoading}
            onClearSelectedGrid={() => {
              setSelectedGrid(null)
              setSelectedGridCode(undefined)
            }}
            onSelectGrid={handleSelectGrid}
            selectedGrid={selectedGrid}
          />
        </Suspense>
        <RiskSummaryPanel stats={stats} />
      </div>

      <RiskHighZoneTable zones={zones} />
    </div>
  )
}
