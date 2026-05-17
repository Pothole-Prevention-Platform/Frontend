import { useState } from 'react'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Info,
  LocateFixed,
  Minus,
  Plus,
  RefreshCcw,
  Settings,
  Volume2,
} from 'lucide-react'
import {
  alertSettings,
  alertToggleSettings,
  currentDangerAlert,
  recentDangerAlerts,
  routePreview,
} from '../data/mockData'
import type {
  AlertRiskLevel,
  AlertSettingDay,
  AlertToggleSetting,
  AlertToggleType,
  CurrentDangerAlert,
  RecentDangerAlert,
} from '../types'
import { cn } from '../utils/cn'

const dayOptions: AlertSettingDay[] = ['매일', '평일', '주말']

const timeOptions = ['21:00', '22:00', '23:00', '06:00', '07:00', '08:00']

const radiusMarks = [
  { value: 100, label: '100m' },
  { value: 250, label: '250m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
] as const

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

function radiusIndexFromMeters(radiusMeters: number) {
  const foundIndex = radiusMarks.findIndex((mark) => mark.value === radiusMeters)

  return foundIndex >= 0 ? foundIndex : 2
}

function formatMeters(distanceMeters: number) {
  return `${distanceMeters}m`
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

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 56" className={className} aria-hidden="true">
      <path
        d="M22 3C11.8 3 3.6 11.2 3.6 21.3 3.6 36 22 53 22 53s18.4-17 18.4-31.7C40.4 11.2 32.2 3 22 3Z"
        fill="currentColor"
        stroke="#fff"
        strokeWidth="4"
      />
      <circle cx="22" cy="21.5" r="6.4" fill="#fff" />
    </svg>
  )
}

function DangerMapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 58 70" className={className} aria-hidden="true">
      <path
        d="M29 3C15.8 3 5.2 13.5 5.2 26.5 5.2 45.1 29 67 29 67s23.8-21.9 23.8-40.5C52.8 13.5 42.2 3 29 3Z"
        fill="currentColor"
        stroke="#fff"
        strokeWidth="5"
      />
      <circle cx="29" cy="27" r="10" fill="#fff" />
      <circle cx="29" cy="27" r="4.8" fill="currentColor" />
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
  onReroute,
}: {
  alert: CurrentDangerAlert
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
              전방 <span className="text-red-600">{formatMeters(alert.distanceMeters)}</span> 포트홀 위험 구간
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
          <p className="mt-1 text-[30px] font-black leading-none text-red-600 sm:text-[32px]">{formatMeters(alert.distanceMeters)}</p>
        </div>
        <button
          type="button"
          onClick={onReroute}
          className="h-11 rounded-xl bg-gradient-to-r from-[#075ED5] to-[#0068E8] px-7 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)] sm:h-12"
        >
          경로 재탐색
        </button>
      </div>
    </section>
  )
}

function RouteMarker({
  className,
  label,
  tone,
}: {
  className: string
  label: string
  tone: 'green' | 'orange' | 'red'
}) {
  const markerClass = {
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-600',
  }[tone]

  return (
    <div
      role="img"
      aria-label={label}
      className={cn('absolute z-20 flex -translate-x-1/2 -translate-y-full items-center justify-center', className)}
    >
      {tone === 'red' && <span className="absolute top-2 h-12 w-12 rounded-full bg-red-500/20" aria-hidden="true" />}
      <MapPinIcon className={cn('relative h-10 w-10 drop-shadow-[0_8px_12px_rgba(15,23,42,0.18)]', markerClass)} />
    </div>
  )
}

function FallbackRouteMap() {
  const mapLabels = [
    ['강남역', 'left-[24%] top-[13%]'],
    ['선릉역', 'left-[30%] top-[51%]'],
    ['역삼1동', 'left-[35%] top-[72%]'],
    ['도곡공원', 'left-[58%] top-[31%]'],
    ['한티역', 'right-[18%] top-[14%]'],
    ['연주역', 'left-[59%] bottom-[19%]'],
    ['도곡1동', 'right-[8%] bottom-[23%]'],
  ] as const

  return (
    <div
      role="img"
      aria-label="실시간 위험 알림 경로 지도 미리보기"
      className="absolute inset-0 overflow-hidden bg-[#F4F8FC]"
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />

      <div className="absolute left-[7%] top-[2%] h-[92%] w-[8%] rotate-[-8deg] rounded-[24px] bg-emerald-100/70" />
      <div className="absolute right-[10%] top-[46%] h-[27%] w-[16%] rotate-[-18deg] rounded-[28px] bg-emerald-100/70" />
      <div className="absolute left-[53%] top-[23%] h-[20%] w-[15%] rotate-[-12deg] rounded-[24px] bg-emerald-100/70" />
      <div className="absolute right-[4%] bottom-[8%] h-[21%] w-[15%] rotate-[12deg] rounded-[28px] bg-sky-100/85" />

      <div className="absolute -left-[8%] top-[20%] h-4 w-[120%] rotate-[-10deg] rounded-full bg-white shadow-[0_0_0_2px_rgba(226,232,240,0.95)]" />
      <div className="absolute -left-[7%] top-[65%] h-4 w-[118%] rotate-[8deg] rounded-full bg-white shadow-[0_0_0_2px_rgba(226,232,240,0.95)]" />
      <div className="absolute left-[18%] top-[-18%] h-[138%] w-3 rotate-[-13deg] rounded-full bg-white shadow-[0_0_0_2px_rgba(226,232,240,0.92)]" />
      <div className="absolute left-[49%] top-[-20%] h-[145%] w-3 rotate-[5deg] rounded-full bg-white shadow-[0_0_0_2px_rgba(226,232,240,0.92)]" />
      <div className="absolute right-[15%] top-[-24%] h-[150%] w-3 rotate-[28deg] rounded-full bg-white shadow-[0_0_0_2px_rgba(226,232,240,0.92)]" />

      <div className="absolute left-[16%] top-[41%] h-2.5 w-[48%] rotate-[1deg] rounded-full bg-slate-200/80" />
      <div className="absolute left-[41%] top-[37%] h-[38%] w-2.5 rotate-[-9deg] rounded-full bg-slate-200/75" />
      <div className="absolute left-[64%] top-[30%] h-2.5 w-[26%] rotate-[-8deg] rounded-full bg-slate-200/75" />
      <div className="absolute left-[31%] top-[31%] h-[34%] w-2.5 rotate-[17deg] rounded-full bg-slate-200/75" />

      <div className="absolute left-[12%] top-[6%] h-[88%] w-4 rotate-[-13deg] rounded-full bg-green-100 shadow-[0_0_0_7px_rgba(255,255,255,0.52)]" />
      <div className="absolute right-[9%] top-[-24%] h-[145%] w-4 rotate-[28deg] rounded-full bg-blue-100 shadow-[0_0_0_7px_rgba(255,255,255,0.52)]" />

      {mapLabels.map(([label, position]) => (
        <span key={label} className={cn('absolute z-10 rounded-md bg-white/60 px-1.5 py-0.5 text-[11px] font-black text-slate-600 sm:text-[13px]', position)}>
          {label}
        </span>
      ))}

      <svg className="absolute inset-0 z-10 h-full w-full" viewBox="0 0 1200 320" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M410 20 L470 158 L610 148 L640 216 L790 184 L955 138 L1185 82"
          fill="none"
          stroke="#2487EB"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="9"
        />
        <path
          d="M410 20 L470 158 L610 148 L640 216 L790 184 L955 138 L1185 82"
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeDasharray="8 20"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
      </svg>

      <div className="absolute left-[32%] top-[30%] z-20 -translate-x-1/2 -translate-y-1/2 text-red-600 sm:top-[45%]">
        <span className="absolute left-1/2 top-1/2 h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20 sm:h-[74px] sm:w-[74px]" />
        <span className="absolute left-1/2 top-1/2 h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/30 sm:h-[48px] sm:w-[48px]" />
        <DangerMapPinIcon className="relative h-[54px] w-[54px] drop-shadow-[0_18px_26px_rgba(220,38,38,0.32)] sm:h-[64px] sm:w-[64px]" />
      </div>

      <RouteMarker className="left-[27%] top-[15%]" tone="green" label="출발 지점" />
      <RouteMarker className="left-[38%] top-[36%] sm:top-[50%]" tone="red" label="위험 지점" />
      <RouteMarker className="left-[46%] top-[50%] sm:top-[64%]" tone="orange" label="주의 지점" />
      <RouteMarker className="left-[73%] top-[50%]" tone="orange" label="주의 지점" />
      <RouteMarker className="left-[95%] top-[31%]" tone="green" label="도착 지점" />
    </div>
  )
}

function RouteMapPreview({ onDetailRoute }: { onDetailRoute: () => void }) {
  return (
    <section className="relative mt-4 h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_16px_40px_rgba(15,40,70,0.08)] sm:h-[270px] lg:h-[270px]">
      <FallbackRouteMap />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/5" />

      <div className="absolute left-3 top-3 w-[126px] rounded-xl bg-white/95 p-4 shadow-[0_14px_32px_rgba(15,40,70,0.15)] backdrop-blur sm:left-5 sm:top-5 sm:w-[138px]">
        <p className="text-[12px] font-black text-slate-500 sm:text-[13px]">예상 도착</p>
        <p className="mt-2 text-[26px] font-black leading-none text-blue-700">{routePreview.estimatedArrival}</p>
        <p className="mt-4 text-[12px] font-black text-slate-500 sm:text-[13px]">남은 거리</p>
        <p className="mt-1 text-[20px] font-black text-[#07182F]">{routePreview.remainingDistance}</p>
        <div className="my-4 h-px bg-slate-200" />
        <button
          type="button"
          onClick={onDetailRoute}
          className="flex items-center gap-1 text-[13px] font-black text-blue-700 transition hover:text-blue-500"
        >
          상세 경로 보기
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>

      <div className="absolute right-4 top-[92px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md sm:top-[128px]">
        <button
          type="button"
          aria-label="지도 확대"
          className="flex h-11 w-11 items-center justify-center border-b border-slate-200 text-slate-700 transition hover:bg-blue-50"
        >
          <Plus size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="지도 축소"
          className="flex h-11 w-11 items-center justify-center text-slate-700 transition hover:bg-blue-50"
        >
          <Minus size={20} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        aria-label="현재 위치 보기"
        className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-blue-50"
      >
        <LocateFixed size={20} aria-hidden="true" />
      </button>
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

function RecentDangerAlertList({ onShowAll, onSelectAlert }: { onShowAll: () => void; onSelectAlert: (alert: RecentDangerAlert) => void }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,40,70,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[22px] font-black text-[#07182F]">최근 위험 알림</h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 text-[11px] font-black text-blue-600">
          i
        </span>
      </div>

      <div className="space-y-3 xl:space-y-2.5">
        {recentDangerAlerts.map((alert) => (
          <RecentAlertRow key={alert.id} alert={alert} onClick={() => onSelectAlert(alert)} />
        ))}
      </div>

      <button
        type="button"
        onClick={onShowAll}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-black text-blue-700 transition hover:bg-blue-50 xl:mt-3"
      >
        전체 알림 보기
        <ChevronRight size={16} aria-hidden="true" />
      </button>
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
  const [toggleStates, setToggleStates] = useState<Record<AlertToggleType, boolean>>(() => createToggleState(alertToggleSettings))
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(alertSettings.quietHoursEnabled)
  const [quietStart, setQuietStart] = useState(alertSettings.quietStartTime)
  const [quietEnd, setQuietEnd] = useState(alertSettings.quietEndTime)
  const [selectedDay, setSelectedDay] = useState<AlertSettingDay>(alertSettings.selectedDays)
  const [radiusIndex, setRadiusIndex] = useState(radiusIndexFromMeters(alertSettings.alertRadiusMeters))
  const [mockNotice, setMockNotice] = useState('')

  const handleToggle = (type: AlertToggleType) => {
    setToggleStates((current) => ({
      ...current,
      [type]: !current[type],
    }))
  }

  const resetSettings = () => {
    setToggleStates(createToggleState(alertToggleSettings))
    setQuietHoursEnabled(alertSettings.quietHoursEnabled)
    setQuietStart(alertSettings.quietStartTime)
    setQuietEnd(alertSettings.quietEndTime)
    setSelectedDay(alertSettings.selectedDays)
    setRadiusIndex(radiusIndexFromMeters(alertSettings.alertRadiusMeters))
    setMockNotice('알림 설정이 기본 데모값으로 초기화되었습니다.')
  }

  return (
    <div className="min-w-0">
      <div>
        <h1 className="text-[30px] font-black leading-tight text-[#07182F] sm:text-[33px]">실시간 위험 알림</h1>
        <p className="mt-1 text-[15px] font-semibold leading-6 text-slate-500">
          실시간 위험 정보를 빠르게 확인하고 안전한 경로로 이동하세요.
        </p>
      </div>

      <MockNotice message={mockNotice} />

      <div className="mt-5">
        <DangerBanner
          alert={currentDangerAlert}
          onReroute={() => setMockNotice('경로 재탐색 요청이 접수되었습니다. 현재 화면에서만 상태가 표시됩니다.')}
        />
        <RouteMapPreview onDetailRoute={() => setMockNotice('상세 경로 보기는 데모 화면에서만 열리는 동작입니다.')} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3 xl:gap-5">
        {alertToggleSettings.map((setting) => (
          <AlertOptionCard
            key={setting.id}
            enabled={toggleStates[setting.type]}
            setting={setting}
            onToggle={() => handleToggle(setting.type)}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px] 2xl:gap-5">
        <RecentDangerAlertList
          onShowAll={() => setMockNotice('전체 알림 보기 요청이 확인되었습니다. 현재는 데모 목록만 표시됩니다.')}
          onSelectAlert={(alert) => setMockNotice(`${alert.title} 알림을 선택했습니다.`)}
        />
        <AlertSettingsPanel
          quietHoursEnabled={quietHoursEnabled}
          quietStart={quietStart}
          quietEnd={quietEnd}
          selectedDay={selectedDay}
          radiusIndex={radiusIndex}
          setQuietHoursEnabled={setQuietHoursEnabled}
          setQuietStart={setQuietStart}
          setQuietEnd={setQuietEnd}
          setSelectedDay={setSelectedDay}
          setRadiusIndex={setRadiusIndex}
          onReset={resetSettings}
        />
      </div>
    </div>
  )
}
