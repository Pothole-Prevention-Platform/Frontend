import { useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Info,
  LocateFixed,
  Minus,
  Plus,
  RefreshCcw,
  Settings,
  ShieldCheck,
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

const routeMapFallbackImageUrl = '/assets/alerts/alert-route-map.png'

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

function ToggleIcon({ type }: { type: AlertToggleType }) {
  if (type === 'voice') {
    return <Volume2 size={32} aria-hidden="true" />
  }

  if (type === 'rain') {
    return <CloudRain size={32} aria-hidden="true" />
  }

  return <BellRing size={32} aria-hidden="true" />
}

function RiskStatusIcon({ riskLevel }: { riskLevel: AlertRiskLevel }) {
  if (riskLevel === 'safe') {
    return <CheckCircle2 size={17} fill="currentColor" aria-hidden="true" />
  }

  return <AlertTriangle size={17} fill="currentColor" aria-hidden="true" />
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
      className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-white p-4 shadow-[0_14px_34px_rgba(239,68,68,0.1)] md:flex-row md:items-center md:justify-between md:px-5"
    >
      <div className="flex min-w-0 items-start gap-4 sm:items-center">
        <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-[0_16px_30px_rgba(239,68,68,0.24)]">
          <AlertTriangle size={34} fill="currentColor" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[21px] font-black leading-tight text-[#07182F]">
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
          <p className="mt-1 text-[32px] font-black leading-none text-red-600">{formatMeters(alert.distanceMeters)}</p>
        </div>
        <button
          type="button"
          onClick={onReroute}
          className="h-12 rounded-xl bg-gradient-to-r from-[#075ED5] to-[#0068E8] px-7 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)]"
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
    green: 'bg-green-500 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-600 text-white',
  }[tone]

  return (
    <div className={cn('absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center', className)}>
      {tone === 'red' && <span className="absolute h-16 w-16 rounded-full bg-red-500/20" aria-hidden="true" />}
      <span className={cn('relative flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white shadow-lg', markerClass)}>
        {tone === 'green' ? <ShieldCheck size={17} fill="currentColor" aria-hidden="true" /> : <AlertTriangle size={16} fill="currentColor" aria-hidden="true" />}
      </span>
      <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-slate-700 shadow-sm">{label}</span>
    </div>
  )
}

function FallbackRouteMap() {
  return (
    <div
      role="img"
      aria-label="실시간 위험 알림 경로 지도 미리보기"
      className="absolute inset-0 overflow-hidden bg-slate-100"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute -left-16 top-[18%] h-5 w-[125%] rotate-[-10deg] rounded-full bg-slate-200 shadow-[0_0_0_8px_rgba(255,255,255,0.65)]" />
      <div className="absolute -left-16 top-[62%] h-6 w-[125%] rotate-[8deg] rounded-full bg-slate-200 shadow-[0_0_0_8px_rgba(255,255,255,0.65)]" />
      <div className="absolute left-[12%] top-[-18%] h-[132%] w-5 rotate-[-13deg] rounded-full bg-green-100 shadow-[0_0_0_8px_rgba(255,255,255,0.55)]" />
      <div className="absolute right-[10%] top-[-24%] h-[142%] w-5 rotate-[28deg] rounded-full bg-blue-100 shadow-[0_0_0_8px_rgba(255,255,255,0.55)]" />

      {[
        ['강남역', 'left-[22%] top-[12%]'],
        ['역삼1동', 'left-[27%] top-[52%]'],
        ['도곡공원', 'left-[58%] top-[22%]'],
        ['한티역', 'right-[18%] top-[13%]'],
        ['연주역', 'left-[59%] bottom-[18%]'],
      ].map(([label, position]) => (
        <span key={label} className={cn('absolute z-10 rounded-md bg-white/60 px-1.5 py-0.5 text-[11px] font-black text-slate-600 sm:text-[13px]', position)}>
          {label}
        </span>
      ))}

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 320" aria-hidden="true">
        <path
          d="M255 30 L300 137 L432 126 L462 190 L585 158 L725 118 L970 62"
          fill="none"
          stroke="#2487EB"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="8"
        />
        <path
          d="M255 30 L300 137 L432 126 L462 190 L585 158 L725 118 L970 62"
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeDasharray="8 20"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute left-[30%] top-[42%] z-30 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute left-1/2 top-1/2 h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20" />
        <span className="absolute left-1/2 top-1/2 h-[48px] w-[48px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/30" />
        <span className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full border-[5px] border-white bg-red-600 text-white shadow-[0_18px_34px_rgba(220,38,38,0.35)]">
          <AlertTriangle size={28} fill="currentColor" aria-hidden="true" />
        </span>
      </div>

      <RouteMarker className="left-[25%] top-[11%]" tone="green" label="출발" />
      <RouteMarker className="left-[36%] top-[39%]" tone="red" label="위험" />
      <RouteMarker className="left-[46%] top-[59%]" tone="orange" label="주의" />
      <RouteMarker className="left-[73%] top-[37%]" tone="orange" label="주의" />
      <RouteMarker className="left-[93%] top-[20%]" tone="green" label="도착" />
    </div>
  )
}

function RouteMapPreview({ onDetailRoute }: { onDetailRoute: () => void }) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const sources = [routePreview.routeMapImageUrl, routeMapFallbackImageUrl]
  const source = sources[sourceIndex]

  return (
    <section className="relative mt-5 h-[270px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_16px_40px_rgba(15,40,70,0.08)] sm:h-[310px] lg:h-[340px]">
      {source ? (
        <img
          src={source}
          alt="실시간 위험 알림 경로 지도 미리보기"
          className="h-full w-full object-cover object-center"
          onError={() => setSourceIndex((current) => current + 1)}
        />
      ) : (
        <FallbackRouteMap />
      )}

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
    <section className="flex min-h-[104px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,40,70,0.06)]">
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
      className={cn('w-full rounded-xl border p-4 text-left transition focus-visible:outline-blue-400', style.row)}
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

      <div className="space-y-3">
        {recentDangerAlerts.map((alert) => (
          <RecentAlertRow key={alert.id} alert={alert} onClick={() => onSelectAlert(alert)} />
        ))}
      </div>

      <button
        type="button"
        onClick={onShowAll}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-black text-blue-700 transition hover:bg-blue-50"
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,40,70,0.06)]">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Settings size={22} className="text-slate-700" aria-hidden="true" />
        <h2 className="text-[18px] font-black text-[#07182F]">알림 설정</h2>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] font-black text-slate-700">조용한 시간 (방해 금지)</p>
          <ToggleSwitch
            enabled={quietHoursEnabled}
            label={`조용한 시간 ${quietHoursEnabled ? '끄기' : '켜기'}`}
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
          />
        </div>

        <div className="mt-3 grid grid-cols-[1fr_18px_1fr] items-center gap-3">
          <label className="sr-only" htmlFor="quiet-start-time">
            조용한 시간 시작
          </label>
          <select
            id="quiet-start-time"
            value={quietStart}
            onChange={(event) => setQuietStart(event.target.value)}
            className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none"
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
            className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 outline-none"
          >
            {timeOptions.map((time) => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-5 text-[13px] font-black text-slate-500">선택 요일</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {dayOptions.map((day) => (
            <button
              key={day}
              type="button"
              aria-pressed={selectedDay === day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                'h-9 rounded-lg border text-[13px] font-black transition',
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

      <div className="mt-7 border-t border-slate-100 pt-6">
        <label htmlFor="alert-radius" className="block text-[15px] font-black text-[#07182F]">
          알림 반경 설정
        </label>
        <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">
          위험 구간 알림을 받을 반경을 설정하세요.
        </p>

        <div className="relative mt-8 px-1">
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
        className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-black text-blue-700 transition hover:bg-blue-50"
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
        <h1 className="text-[30px] font-black text-[#07182F] sm:text-[34px]">실시간 위험 알림</h1>
        <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-500">
          실시간 위험 정보를 빠르게 확인하고 안전한 경로로 이동하세요.
        </p>
      </div>

      <MockNotice message={mockNotice} />

      <div className="mt-6">
        <DangerBanner
          alert={currentDangerAlert}
          onReroute={() => setMockNotice('경로 재탐색 요청이 접수되었습니다. 현재 화면에서만 상태가 표시됩니다.')}
        />
        <RouteMapPreview onDetailRoute={() => setMockNotice('상세 경로 보기는 데모 화면에서만 열리는 동작입니다.')} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {alertToggleSettings.map((setting) => (
          <AlertOptionCard
            key={setting.id}
            enabled={toggleStates[setting.type]}
            setting={setting}
            onToggle={() => handleToggle(setting.type)}
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
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
