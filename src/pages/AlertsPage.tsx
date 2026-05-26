import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Info,
  RefreshCcw,
  Settings,
  Volume2,
} from 'lucide-react'
import {
  getLatestGridRiskResults,
  getRiskZones,
} from '../api/riskApi'
import {
  alertSettings,
  alertToggleSettings,
} from '../data/mockData'
import { KakaoAlertRouteMap } from '../components/alerts/KakaoAlertRouteMap'
import type {
  AlertRiskLevel,
  AlertSettingDay,
  AlertToggleSetting,
  AlertToggleType,
  CurrentDangerAlert,
  RecentDangerAlert,
  RoutePreview,
} from '../types'
import type { RiskGridResult } from '../types/risk'
import { cn } from '../utils/cn'

const dayOptions: AlertSettingDay[] = ['매일', '평일', '주말']

const timeOptions = ['21:00', '22:00', '23:00', '06:00', '07:00', '08:00']

const ALERT_SETTINGS_STORAGE_KEY = 'pothole-alert-settings-v1'
const ALERT_EMPTY_NOTICE = '표시할 실제 위험 알림 데이터가 없습니다. 위험도 산출 후 다시 확인해 주세요.'
const SEOUL_CITY_HALL = {
  lat: 37.5665,
  lng: 126.978,
}

const radiusMarks = [
  { value: 100, label: '100m' },
  { value: 250, label: '250m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
] as const

type LiveAlertSource = 'api'

type LiveDangerAlert = CurrentDangerAlert & {
  calculatedAt?: string
  centerLat?: number
  centerLng?: number
  gridCode?: string
  riskScore?: number
  source: LiveAlertSource
}

type RerouteState = {
  appliedAt: string
  avoidedAlertId: string
  avoidedLocation: string
  extraDistanceMeters: number
  extraMinutes: number
}

type SavedAlertSettings = {
  quietEnd: string
  quietHoursEnabled: boolean
  quietStart: string
  radiusMeters: number
  selectedDay: AlertSettingDay
  toggleStates: Record<AlertToggleType, boolean>
}

const riskStyles: Record<
  AlertRiskLevel,
  {
    badge: string
    distance: string
    dot: string
    row: string
  }
> = {
  danger: {
    badge: 'bg-red-100 text-red-700 ring-red-200',
    distance: 'text-red-600',
    dot: 'bg-red-600 text-white',
    row: 'border-red-200 bg-red-50/80 shadow-[0_12px_26px_rgba(239,68,68,0.08)]',
  },
  caution: {
    badge: 'bg-orange-100 text-orange-700 ring-orange-200',
    distance: 'text-slate-900',
    dot: 'bg-orange-500 text-white',
    row: 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40',
  },
  attention: {
    badge: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
    distance: 'text-slate-900',
    dot: 'bg-yellow-400 text-slate-900',
    row: 'border-slate-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/50',
  },
  safe: {
    badge: 'bg-green-100 text-green-700 ring-green-200',
    distance: 'text-green-600',
    dot: 'bg-green-500 text-white',
    row: 'border-slate-200 bg-white hover:border-green-200 hover:bg-green-50/40',
  },
}

function createToggleState(settings: AlertToggleSetting[]): Record<AlertToggleType, boolean> {
  const state: Record<AlertToggleType, boolean> = {
    push: false,
    voice: false,
    rain: false,
  }

  settings.forEach((setting) => {
    state[setting.type] = setting.enabled
  })

  return state
}

function getDefaultAlertSettings(): SavedAlertSettings {
  return {
    quietEnd: alertSettings.quietEndTime,
    quietHoursEnabled: alertSettings.quietHoursEnabled,
    quietStart: alertSettings.quietStartTime,
    radiusMeters: alertSettings.alertRadiusMeters,
    selectedDay: alertSettings.selectedDays,
    toggleStates: createToggleState(alertToggleSettings),
  }
}

function isAlertSettingDay(value: unknown): value is AlertSettingDay {
  return typeof value === 'string' && dayOptions.includes(value as AlertSettingDay)
}

function isAlertToggleStates(value: unknown): value is Record<AlertToggleType, boolean> {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  return ['push', 'voice', 'rain'].every((key) => typeof candidate[key] === 'boolean')
}

function readSavedAlertSettings() {
  if (typeof window === 'undefined') {
    return getDefaultAlertSettings()
  }

  try {
    const rawValue = window.localStorage.getItem(ALERT_SETTINGS_STORAGE_KEY)

    if (!rawValue) {
      return getDefaultAlertSettings()
    }

    const parsed = JSON.parse(rawValue) as Partial<SavedAlertSettings>
    const defaults = getDefaultAlertSettings()
    const radiusMeters = typeof parsed.radiusMeters === 'number' && Number.isFinite(parsed.radiusMeters)
      ? parsed.radiusMeters
      : defaults.radiusMeters

    return {
      quietEnd: typeof parsed.quietEnd === 'string' ? parsed.quietEnd : defaults.quietEnd,
      quietHoursEnabled: typeof parsed.quietHoursEnabled === 'boolean' ? parsed.quietHoursEnabled : defaults.quietHoursEnabled,
      quietStart: typeof parsed.quietStart === 'string' ? parsed.quietStart : defaults.quietStart,
      radiusMeters,
      selectedDay: isAlertSettingDay(parsed.selectedDay) ? parsed.selectedDay : defaults.selectedDay,
      toggleStates: isAlertToggleStates(parsed.toggleStates) ? parsed.toggleStates : defaults.toggleStates,
    }
  } catch {
    return getDefaultAlertSettings()
  }
}

function radiusIndexFromMeters(radiusMeters: number) {
  const foundIndex = radiusMarks.findIndex((mark) => mark.value === radiusMeters)

  return foundIndex >= 0 ? foundIndex : 2
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km`
  }

  return `${Math.max(0, Math.round(distanceMeters))}m`
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

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

function normalizeRiskScore(result: RiskGridResult) {
  const rawScore = getNumberField(result, ['riskScore', 'score', 'riskPercent', 'value'])

  if (rawScore === undefined) {
    const probability = getNumberField(result, ['probability'])
    return probability === undefined ? 0 : clampPercent(probability * 100)
  }

  return clampPercent(rawScore)
}

function getAlertRiskLevel(result: RiskGridResult): AlertRiskLevel {
  const rawLevel = getStringField(result, ['riskLevel', 'riskGrade', 'grade', 'level'])
  const normalizedLevel = rawLevel?.toUpperCase()

  if (rawLevel === '위험' || rawLevel === '긴급' || normalizedLevel === 'DANGER') {
    return 'danger'
  }

  if (rawLevel === '주의' || normalizedLevel === 'WARNING' || normalizedLevel === 'CAUTION') {
    return 'caution'
  }

  if (rawLevel === '관심' || normalizedLevel === 'ATTENTION') {
    return 'attention'
  }

  if (rawLevel === '안전' || normalizedLevel === 'SAFE') {
    return 'safe'
  }

  const riskScore = normalizeRiskScore(result)

  if (riskScore >= 70) {
    return 'danger'
  }

  if (riskScore >= 40) {
    return 'caution'
  }

  if (riskScore >= 20) {
    return 'attention'
  }

  return 'safe'
}

function getAlertRiskLabel(riskLevel: AlertRiskLevel) {
  const labels: Record<AlertRiskLevel, string> = {
    danger: '위험',
    caution: '주의',
    attention: '관심',
    safe: '안전',
  }

  return labels[riskLevel]
}

function getRiskSortValue(riskLevel: AlertRiskLevel, riskScore: number) {
  const riskLevelWeight: Record<AlertRiskLevel, number> = {
    danger: 400,
    caution: 300,
    attention: 200,
    safe: 100,
  }

  return riskLevelWeight[riskLevel] + riskScore
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function getDistanceMeters(lat: number, lng: number) {
  const earthRadiusMeters = 6371000
  const deltaLat = toRadians(lat - SEOUL_CITY_HALL.lat)
  const deltaLng = toRadians(lng - SEOUL_CITY_HALL.lng)
  const startLat = toRadians(SEOUL_CITY_HALL.lat)
  const targetLat = toRadians(lat)
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(startLat) * Math.cos(targetLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(earthRadiusMeters * c)
}

function formatRelativeTime(value: string | undefined, fallbackMinutes: number) {
  if (!value) {
    return fallbackMinutes === 0 ? '방금 전' : `${fallbackMinutes}분 전`
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallbackMinutes === 0 ? '방금 전' : `${fallbackMinutes}분 전`
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))

  if (diffMinutes < 1) {
    return '방금 전'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  }

  if (diffMinutes < 24 * 60) {
    return `${Math.round(diffMinutes / 60)}시간 전`
  }

  return `${Math.round(diffMinutes / (24 * 60))}일 전`
}

function formatAlertTime(value: string | undefined) {
  const date = value ? new Date(value) : new Date()

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function toLiveAlert(result: RiskGridResult, index: number): LiveDangerAlert | undefined {
  const centerLat = getNumberField(result, ['centerLat'])
  const centerLng = getNumberField(result, ['centerLng'])

  if (centerLat === undefined || centerLng === undefined) {
    return undefined
  }

  const riskScore = normalizeRiskScore(result)
  const riskLevel = getAlertRiskLevel(result)
  const badgeLabel = getAlertRiskLabel(riskLevel)
  const distanceMeters = getDistanceMeters(centerLat, centerLng)
  const gridCode = getStringField(result, ['gridCode', 'gridId'])
  const districtName = getStringField(result, ['districtName', 'district', 'guName']) ?? '자치구 미확인'
  const direction = riskLevel === 'safe' ? '관찰 구간' : '진행 경로 인근'

  return {
    badgeLabel,
    calculatedAt: result.calculatedAt ?? result.updatedAt,
    centerLat,
    centerLng,
    direction,
    distanceMeters,
    gridCode,
    id: gridCode ?? `risk-alert-api-${index}`,
    location: gridCode ? `${districtName} ${gridCode}` : districtName,
    riskLevel,
    riskScore,
    source: 'api',
    title: `전방 ${formatDistance(distanceMeters)} 포트홀 ${badgeLabel} 구간`,
  }
}

function toRecentAlert(alert: LiveDangerAlert, index: number, reroutedAlertIds: Set<string>): RecentDangerAlert {
  const isRerouted = reroutedAlertIds.has(alert.id)

  return {
    detail: `${alert.location} | ${alert.direction}`,
    distanceText: isRerouted ? '우회 완료' : formatDistance(alert.distanceMeters),
    id: `recent-${alert.id}`,
    relativeTime: isRerouted ? '방금 전' : formatRelativeTime(alert.calculatedAt, index * 4),
    riskLabel: isRerouted ? '안전' : alert.badgeLabel,
    riskLevel: isRerouted ? 'safe' : alert.riskLevel,
    statusText: isRerouted ? '우회 완료' : undefined,
    time: formatAlertTime(alert.calculatedAt),
    title: isRerouted ? `${alert.location} 우회 경로 적용` : alert.title,
  }
}

function getRoutePreview(alert: LiveDangerAlert, rerouteState: RerouteState | null): RoutePreview {
  const baseDistanceKm = Math.max(1.2, alert.distanceMeters / 1000 + 1.8)
  const extraDistanceKm = rerouteState ? rerouteState.extraDistanceMeters / 1000 : 0
  const remainingDistance = `${(baseDistanceKm + extraDistanceKm).toFixed(1)} km`
  const estimatedMinutes = Math.max(4, Math.round(((baseDistanceKm + extraDistanceKm) / 22) * 60) + (rerouteState?.extraMinutes ?? 0))
  const arrival = new Date(Date.now() + estimatedMinutes * 60000)
  const estimatedArrival = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(arrival)

  return {
    estimatedArrival,
    remainingDistance,
  }
}

function WarningTriangleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 58" className={className} aria-hidden="true">
      <path d="M32 4 61 54H3L32 4Z" fill="currentColor" />
      <path d="M32 20v18" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="46" r="3.4" fill="#fff" />
    </svg>
  )
}

function WarningLineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} aria-hidden="true">
      <path
        d="M12 2.4 22 19.5H2L12 2.4Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path d="M12 8v5.7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" />
    </svg>
  )
}

function ToggleIcon({ type }: { type: AlertToggleType }) {
  if (type === 'voice') {
    return <Volume2 size={30} strokeWidth={2.2} aria-hidden="true" />
  }

  if (type === 'rain') {
    return <CloudRain size={30} strokeWidth={2.2} aria-hidden="true" />
  }

  return <Bell size={30} strokeWidth={2.2} aria-hidden="true" />
}

function RiskStatusIcon({ riskLevel }: { riskLevel: AlertRiskLevel }) {
  if (riskLevel === 'safe') {
    return <CheckCircle2 size={18} strokeWidth={3} aria-hidden="true" />
  }

  return <WarningLineIcon className="h-[18px] w-[18px]" />
}

function RiskBadge({ riskLevel, label }: { riskLevel: AlertRiskLevel; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-8 min-w-[58px] items-center justify-center rounded-lg px-2 text-[12px] font-black ring-1 ring-inset',
        riskStyles[riskLevel].badge,
      )}
    >
      {label}
    </span>
  )
}

function ToggleSwitch({
  enabled,
  label,
  onClick,
}: {
  enabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onClick}
      className={cn(
        'relative h-7 w-[52px] shrink-0 rounded-full transition focus-visible:outline-blue-400',
        enabled ? 'bg-blue-600 shadow-inner' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition',
          enabled ? 'left-[27px]' : 'left-1',
        )}
      />
    </button>
  )
}

function MockNotice({ message }: { message: string }) {
  if (!message) {
    return null
  }

  return (
    <div
      aria-live="polite"
      className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-5 text-blue-700"
    >
      <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

function DangerBanner({
  alert,
  isRerouted,
  onReroute,
}: {
  alert: CurrentDangerAlert
  isRerouted: boolean
  onReroute: () => void
}) {
  return (
    <section
      aria-label="현재 위험 알림"
      className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-white p-3 shadow-[0_14px_34px_rgba(239,68,68,0.1)] sm:p-4 md:flex-row md:items-center md:justify-between md:px-5"
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center text-red-600 drop-shadow-[0_12px_20px_rgba(220,38,38,0.22)] sm:h-[58px] sm:w-[58px]">
          <WarningTriangleIcon className="h-[46px] w-[46px] sm:h-[56px] sm:w-[56px]" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 max-w-full text-[19px] font-black leading-tight text-[#07182F] sm:text-[21px]">
              {alert.title}
            </h2>
            <RiskBadge riskLevel={alert.riskLevel} label={alert.badgeLabel} />
          </div>
          <p className="mt-2 text-[13px] font-semibold leading-5 text-slate-500">
            {alert.location} | {alert.direction}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-red-100 pt-1 sm:flex-row sm:items-center sm:justify-end sm:gap-6 md:border-l md:pl-7">
        <div className="text-left sm:text-center">
          <p className="text-[12px] font-black text-slate-500">위험 지점까지</p>
          <p className="mt-1 text-[30px] font-black leading-none text-red-600 sm:text-[32px]">{formatDistance(alert.distanceMeters)}</p>
        </div>
        <button
          type="button"
          onClick={onReroute}
          disabled={isRerouted || alert.riskLevel === 'safe'}
          className="h-11 rounded-xl bg-gradient-to-r from-[#075ED5] to-[#0068E8] px-7 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none disabled:hover:translate-y-0 sm:h-12"
        >
          {isRerouted ? '우회 적용됨' : '경로 재탐색'}
        </button>
      </div>
    </section>
  )
}

function AlertOptionCard({
  enabled,
  onToggle,
  setting,
}: {
  enabled: boolean
  onToggle: () => void
  setting: AlertToggleSetting
}) {
  return (
    <section className="flex min-h-[96px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,40,70,0.06)] sm:p-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="shrink-0 text-blue-700">
          <ToggleIcon type={setting.type} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[16px] font-black text-[#07182F]">{setting.title}</h3>
            <span
              className={cn(
                'rounded-md px-2 py-1 text-[11px] font-black',
                enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500',
              )}
            >
              {enabled ? setting.status : '꺼짐'}
            </span>
          </div>

          <p className="mt-2 text-[13px] font-semibold leading-5 text-slate-500">{setting.description}</p>
        </div>
      </div>

      <ToggleSwitch enabled={enabled} label={`${setting.title} ${enabled ? '끄기' : '켜기'}`} onClick={onToggle} />
    </section>
  )
}

function RecentAlertRow({
  alert,
  onClick,
}: {
  alert: RecentDangerAlert
  onClick: () => void
}) {
  const style = riskStyles[alert.riskLevel]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('w-full rounded-xl border p-4 text-left transition focus-visible:outline-blue-400 xl:px-4 xl:py-3', style.row)}
    >
      <div className="grid gap-3 md:grid-cols-[70px_38px_76px_minmax(0,1fr)_112px_22px] md:items-center">
        <div className="flex items-center justify-between gap-3 md:block">
          <div>
            <p className="text-[15px] font-black text-[#07182F]">{alert.time}</p>
            <p className="mt-1 text-[11px] font-bold text-slate-500">{alert.relativeTime}</p>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <RiskBadge riskLevel={alert.riskLevel} label={alert.riskLabel} />
            <ChevronRight size={20} className="text-slate-700" aria-hidden="true" />
          </div>
        </div>

        <div className={cn('hidden h-8 w-8 items-center justify-center rounded-full md:flex', style.dot)}>
          <RiskStatusIcon riskLevel={alert.riskLevel} />
        </div>

        <div className="hidden md:block">
          <RiskBadge riskLevel={alert.riskLevel} label={alert.riskLabel} />
        </div>

        <div className="min-w-0">
          <p className="text-[14px] font-black text-[#07182F]">{alert.title}</p>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">{alert.detail}</p>
        </div>

        <div className="flex items-center justify-between gap-3 md:block md:text-right">
          <p className="text-[11px] font-black text-slate-500 md:mb-1">{alert.statusText ? '상태' : '위험 지점까지'}</p>
          <p className={cn('text-[15px] font-black', style.distance)}>{alert.statusText ?? alert.distanceText}</p>
        </div>

        <ChevronRight size={20} className="hidden text-slate-700 md:block" aria-hidden="true" />
      </div>
    </button>
  )
}

function RecentDangerAlertList({
  alerts,
  isExpanded,
  onShowAll,
  onSelectAlert,
}: {
  alerts: RecentDangerAlert[]
  isExpanded: boolean
  onShowAll: () => void
  onSelectAlert: (alert: RecentDangerAlert) => void
}) {
  const visibleAlerts = isExpanded ? alerts : alerts.slice(0, 4)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,40,70,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[22px] font-black text-[#07182F]">최근 위험 알림</h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 text-[11px] font-black text-blue-600">
          i
        </span>
      </div>

      <div className="space-y-3 xl:space-y-2.5">
        {visibleAlerts.length > 0 ? (
          visibleAlerts.map((alert) => (
            <RecentAlertRow key={alert.id} alert={alert} onClick={() => onSelectAlert(alert)} />
          ))
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-[13px] font-bold text-slate-500">
            실제 위험 알림 데이터가 없습니다.
          </p>
        )}
      </div>

      {alerts.length > 4 && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-black text-blue-700 transition hover:bg-blue-50 xl:mt-3"
        >
          {isExpanded ? '주요 알림만 보기' : '전체 알림 보기'}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </section>
  )
}

function AlertSettingsPanel({
  onReset,
  quietEnd,
  quietHoursEnabled,
  quietStart,
  radiusIndex,
  selectedDay,
  setQuietEnd,
  setQuietHoursEnabled,
  setQuietStart,
  setRadiusIndex,
  setSelectedDay,
}: {
  onReset: () => void
  quietEnd: string
  quietHoursEnabled: boolean
  quietStart: string
  radiusIndex: number
  selectedDay: AlertSettingDay
  setQuietEnd: (value: string) => void
  setQuietHoursEnabled: (value: boolean) => void
  setQuietStart: (value: string) => void
  setRadiusIndex: (value: number) => void
  setSelectedDay: (value: AlertSettingDay) => void
}) {
  const selectedRadius = radiusMarks[radiusIndex] ?? radiusMarks[2]
  const radiusPosition = (radiusIndex / (radiusMarks.length - 1)) * 100

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,40,70,0.06)] sm:p-5 xl:p-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 sm:pb-4 xl:pb-3">
        <Settings size={22} className="text-slate-700" aria-hidden="true" />
        <h2 className="text-[18px] font-black text-[#07182F]">알림 설정</h2>
      </div>

      <div className="mt-4 sm:mt-5 xl:mt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] font-black text-slate-700">조용한 시간 (방해 금지)</p>
          <ToggleSwitch
            enabled={quietHoursEnabled}
            label={`조용한 시간 ${quietHoursEnabled ? '끄기' : '켜기'}`}
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
          />
        </div>

        <div className="mt-3 grid grid-cols-[1fr_18px_1fr] items-center gap-3 xl:gap-2">
          <label className="sr-only" htmlFor="quiet-start-time">
            조용한 시간 시작
          </label>
          <select
            id="quiet-start-time"
            value={quietStart}
            onChange={(event) => setQuietStart(event.target.value)}
            className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none xl:h-9"
          >
            {timeOptions.map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
          <span className="text-center text-slate-400">~</span>
          <label className="sr-only" htmlFor="quiet-end-time">
            조용한 시간 종료
          </label>
          <select
            id="quiet-end-time"
            value={quietEnd}
            onChange={(event) => setQuietEnd(event.target.value)}
            className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none xl:h-9"
          >
            {timeOptions.map((time) => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-[13px] font-black text-slate-500 sm:mt-5 xl:mt-4">선택 요일</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-3 xl:mt-2">
          {dayOptions.map((day) => (
            <button
              key={day}
              type="button"
              aria-pressed={selectedDay === day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'h-9 rounded-lg border text-[13px] font-black transition xl:h-8',
                selectedDay === day
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-[0_8px_18px_rgba(0,95,220,0.08)]'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-blue-50/50',
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 sm:mt-7 sm:pt-6 xl:mt-5 xl:pt-4">
        <label htmlFor="alert-radius" className="block text-[15px] font-black text-[#07182F]">
          알림 반경 설정
        </label>
        <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">
          위험 구간 알림을 받을 반경을 설정하세요.
        </p>

        <div className="relative mt-7 px-1 sm:mt-8 xl:mt-7">
          <span
            className="absolute -top-7 -translate-x-1/2 rounded-full bg-blue-100 px-3 py-1 text-[12px] font-black text-blue-700"
            style={{ left: `${radiusPosition}%` }}
          >
            {selectedRadius.label}
          </span>
          <input
            id="alert-radius"
            type="range"
            min={0}
            max={radiusMarks.length - 1}
            step={1}
            value={radiusIndex}
            aria-valuetext={selectedRadius.label}
            onChange={(event) => setRadiusIndex(Number(event.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-500">
            {radiusMarks.map((mark) => (
              <span key={mark.value}>{mark.label}</span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-black text-blue-700 transition hover:bg-blue-50 sm:mt-8 sm:h-11 xl:mt-6 xl:h-10"
      >
        <RefreshCcw size={17} aria-hidden="true" />
        알림 설정 초기화
      </button>
    </section>
  )
}

export function AlertsPage() {
  const [settingsState, setSettingsState] = useState<SavedAlertSettings>(() => readSavedAlertSettings())
  const [alerts, setAlerts] = useState<LiveDangerAlert[]>([])
  const [activeAlertId, setActiveAlertId] = useState('')
  const [reroutedAlertIds, setReroutedAlertIds] = useState<Set<string>>(() => new Set())
  const [rerouteState, setRerouteState] = useState<RerouteState | null>(null)
  const [isAlertLoading, setIsAlertLoading] = useState(true)
  const [alertDataNotice, setAlertDataNotice] = useState('')
  const [mockNotice, setMockNotice] = useState('')
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const radiusIndex = radiusIndexFromMeters(settingsState.radiusMeters)

  const persistSettingsNotice = useCallback(() => {
    setMockNotice('알림 설정이 저장되었습니다.')
  }, [])

  const updateSettings = useCallback((updater: (current: SavedAlertSettings) => SavedAlertSettings) => {
    setSettingsState((current) => updater(current))
    persistSettingsNotice()
  }, [persistSettingsNotice])

  const loadAlerts = useCallback(async () => {
    setIsAlertLoading(true)
    setAlertDataNotice('')

    const [zonesResult, latestResult] = await Promise.allSettled([
      getRiskZones(),
      getLatestGridRiskResults(),
    ])

    const zoneRows = zonesResult.status === 'fulfilled' ? zonesResult.value : []
    const latestRows = latestResult.status === 'fulfilled' ? latestResult.value : []
    const sourceRows = zoneRows.length > 0 ? zoneRows : latestRows
    const apiAlerts = sourceRows
      .map(toLiveAlert)
      .filter((alert): alert is LiveDangerAlert => alert !== undefined)
      .sort((a, b) => {
        const riskDiff = getRiskSortValue(b.riskLevel, b.riskScore ?? 0) - getRiskSortValue(a.riskLevel, a.riskScore ?? 0)
        return riskDiff === 0 ? a.distanceMeters - b.distanceMeters : riskDiff
      })
      .slice(0, 8)

    if (apiAlerts.length > 0) {
      setAlerts(apiAlerts)
      setActiveAlertId(apiAlerts[0].id)
      setAlertDataNotice('')
    } else {
      setAlerts([])
      setActiveAlertId('')
      setAlertDataNotice(ALERT_EMPTY_NOTICE)
    }

    if (zonesResult.status === 'rejected' && latestResult.status === 'rejected') {
      setAlertDataNotice('실제 위험도 API 연결에 실패했습니다. 백엔드 상태를 확인해 주세요.')
    }

    setRerouteState(null)
    setReroutedAlertIds(new Set())
    setIsAlertLoading(false)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAlerts()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadAlerts])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(ALERT_SETTINGS_STORAGE_KEY, JSON.stringify(settingsState))
  }, [settingsState])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ALERT_SETTINGS_STORAGE_KEY) {
        return
      }

      setSettingsState(readSavedAlertSettings())
      setMockNotice('다른 창에서 변경한 알림 설정을 반영했습니다.')
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const activeAlert = useMemo(() => {
    return alerts.find((alert) => alert.id === activeAlertId) ?? alerts[0]
  }, [activeAlertId, alerts])

  const routeSummary = useMemo(() => activeAlert ? getRoutePreview(activeAlert, rerouteState) : undefined, [activeAlert, rerouteState])

  const recentAlertRows = useMemo(() => {
    return alerts.map((alert, index) => toRecentAlert(alert, index, reroutedAlertIds))
  }, [alerts, reroutedAlertIds])

  const isActiveAlertRerouted = activeAlert ? reroutedAlertIds.has(activeAlert.id) : false

  const handleToggle = (type: AlertToggleType) => {
    updateSettings((current) => ({
      ...current,
      toggleStates: {
        ...current.toggleStates,
        [type]: !current.toggleStates[type],
      },
    }))
  }

  const resetSettings = () => {
    setSettingsState(getDefaultAlertSettings())
    setMockNotice('알림 설정이 기본값으로 초기화되어 저장되었습니다.')
  }

  const handleReroute = () => {
    if (!activeAlert) {
      setMockNotice('실제 위험 알림 데이터가 없어 경로를 재탐색할 수 없습니다.')
      return
    }

    if (activeAlert.riskLevel === 'safe') {
      setMockNotice('현재 경로 주변에는 우회할 위험 구간이 없습니다.')
      return
    }

    const extraDistanceMeters = Math.max(220, Math.round(activeAlert.distanceMeters * 0.08))
    const extraMinutes = Math.max(2, Math.round(extraDistanceMeters / 180))

    setReroutedAlertIds((current) => new Set(current).add(activeAlert.id))
    setRerouteState({
      appliedAt: new Date().toISOString(),
      avoidedAlertId: activeAlert.id,
      avoidedLocation: activeAlert.location,
      extraDistanceMeters,
      extraMinutes,
    })

    const nextAlert = alerts.find((alert) => alert.id !== activeAlert.id && !reroutedAlertIds.has(alert.id) && alert.riskLevel !== 'safe')

    if (nextAlert) {
      setActiveAlertId(nextAlert.id)
    } else {
      setMockNotice(`${activeAlert.location} 위험 구간을 피하도록 경로를 갱신했습니다. 추가 실제 위험 알림은 없습니다.`)
      return
    }

    setMockNotice(`${activeAlert.location} 위험 구간을 피하도록 경로를 갱신했습니다.`)
  }

  const handleSelectRecentAlert = (alert: RecentDangerAlert) => {
    const alertId = alert.id.replace(/^recent-/, '')
    const selectedAlert = alerts.find((item) => item.id === alertId)

    if (!selectedAlert) {
      setMockNotice(`${alert.title} 알림을 확인했습니다.`)
      return
    }

    setActiveAlertId(selectedAlert.id)
    setMockNotice(`${selectedAlert.location} 알림을 현재 경로에 표시했습니다.`)
  }

  const noticeMessage = isAlertLoading ? '위험 알림 데이터를 불러오는 중입니다.' : mockNotice || alertDataNotice

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-black leading-tight text-[#07182F] sm:text-[33px]">실시간 위험 알림</h1>
          <p className="mt-1 text-[15px] font-semibold leading-6 text-slate-500">
            실시간 위험 정보를 빠르게 확인하고 안전한 경로로 이동하세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAlerts()}
          disabled={isAlertLoading}
          className="flex h-11 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-black text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={17} aria-hidden="true" />
          {isAlertLoading ? '갱신 중' : '알림 새로고침'}
        </button>
      </div>

      <MockNotice message={noticeMessage} />

      {activeAlert && routeSummary ? (
        <div className="mt-5">
          <DangerBanner
            alert={activeAlert}
            isRerouted={isActiveAlertRerouted}
            onReroute={handleReroute}
          />
          <KakaoAlertRouteMap
            alert={activeAlert}
            isRerouted={rerouteState !== null}
            onDetailRoute={() => {
              setShowAllAlerts(true)
              setMockNotice(`현재 경로와 관련된 위험 알림 ${recentAlertRows.length}건을 표시했습니다.`)
            }}
            preview={routeSummary}
          />
        </div>
      ) : (
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_14px_34px_rgba(15,40,70,0.06)]">
          <h2 className="text-[20px] font-black text-[#07182F]">실시간 위험 알림 없음</h2>
          <p className="mt-3 text-[13px] font-bold leading-5 text-slate-500">
            실제 위험도 데이터가 수신되면 지도와 경로 알림을 표시합니다.
          </p>
        </section>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-3 xl:gap-5">
        {alertToggleSettings.map((setting) => (
          <AlertOptionCard
            key={setting.id}
            enabled={settingsState.toggleStates[setting.type]}
            setting={setting}
            onToggle={() => handleToggle(setting.type)}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:gap-5">
        <RecentDangerAlertList
          alerts={recentAlertRows}
          isExpanded={showAllAlerts}
          onShowAll={() => setShowAllAlerts((current) => !current)}
          onSelectAlert={handleSelectRecentAlert}
        />
        <AlertSettingsPanel
          quietHoursEnabled={settingsState.quietHoursEnabled}
          quietStart={settingsState.quietStart}
          quietEnd={settingsState.quietEnd}
          selectedDay={settingsState.selectedDay}
          radiusIndex={radiusIndex}
          setQuietHoursEnabled={(value) => updateSettings((current) => ({ ...current, quietHoursEnabled: value }))}
          setQuietStart={(value) => updateSettings((current) => ({ ...current, quietStart: value }))}
          setQuietEnd={(value) => updateSettings((current) => ({ ...current, quietEnd: value }))}
          setSelectedDay={(value) => updateSettings((current) => ({ ...current, selectedDay: value }))}
          setRadiusIndex={(value) => {
            const radiusMeters = radiusMarks[value]?.value ?? alertSettings.alertRadiusMeters
            updateSettings((current) => ({ ...current, radiusMeters }))
          }}
          onReset={resetSettings}
        />
      </div>
    </div>
  )
}
