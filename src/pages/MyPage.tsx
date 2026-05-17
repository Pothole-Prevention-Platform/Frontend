import { type ElementType, type ReactNode, useState } from 'react'
import {
  AlertTriangle,
  BellRing,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Lock,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  UserRound,
  Wallet,
} from 'lucide-react'
import {
  myPageBasicInfo,
  myPageCompensationClaims,
  myPageInterestItems,
  myPageNotificationSettings,
  myPageProfile,
  myPageRecentActivities,
  myPageStats,
} from '../data/mockData'
import type {
  MyPageActivity,
  MyPageActivityIconType,
  MyPageActivityStatusType,
  MyPageClaimStatusType,
  MyPageInterestItem,
  MyPageNotificationIconType,
  MyPageStatIconType,
} from '../types'
import { cn } from '../utils/cn'

type AssetImageProps = {
  sources: string[]
  alt: string
  className: string
  fallback: ReactNode
}

const statIconMap: Record<MyPageStatIconType, ElementType> = {
  clipboard: ClipboardList,
  mapPin: MapPin,
  wallet: Wallet,
}

const notificationIconMap: Record<MyPageNotificationIconType, ElementType> = {
  alert: AlertTriangle,
  bell: BellRing,
  wallet: Wallet,
  mail: Mail,
}

const activityIconMap: Record<MyPageActivityIconType, ElementType> = {
  report: PencilLine,
  claim: FileText,
  region: MapPin,
}

const statusClasses: Record<MyPageActivityStatusType | MyPageClaimStatusType, string> = {
  accepted: 'bg-blue-100 text-blue-700 ring-blue-200',
  processing: 'bg-orange-100 text-orange-700 ring-orange-200',
  completed: 'bg-green-100 text-green-700 ring-green-200',
}

const timelineDotClasses: Record<MyPageClaimStatusType, string> = {
  accepted: 'border-blue-600',
  processing: 'border-orange-500',
  completed: 'border-green-600',
}

function createNotificationState(): Record<string, boolean> {
  const state: Record<string, boolean> = {}

  myPageNotificationSettings.forEach((setting) => {
    state[setting.id] = setting.enabled
  })

  return state
}

function panelClass(className?: string) {
  return cn(
    'rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,40,70,0.06)]',
    className,
  )
}

function AssetImage({ sources, alt, className, fallback }: AssetImageProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const source = sources[sourceIndex]

  if (!source) {
    return <>{fallback}</>
  }

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  )
}

function StatusBadge({
  status,
  statusType,
}: {
  status: string
  statusType: MyPageActivityStatusType | MyPageClaimStatusType
}) {
  return (
    <span className={cn('inline-flex h-7 items-center rounded-md px-3 text-[12px] font-black ring-1 ring-inset', statusClasses[statusType])}>
      {status}
    </span>
  )
}

function MockNotice({ message }: { message: string }) {
  if (!message) {
    return null
  }

  return (
    <p
      role="status"
      className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-5 text-blue-700"
    >
      {message}
    </p>
  )
}

function ProfileFallbackAvatar() {
  return (
    <div
      role="img"
      aria-label="사용자 프로필 이미지"
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-b from-blue-100 to-blue-200"
    >
      <div className="absolute top-7 h-10 w-10 rounded-full bg-[#FFD1AE]" />
      <div className="absolute top-[34px] h-5 w-12 rounded-t-full bg-slate-800" />
      <div className="absolute bottom-0 h-16 w-24 rounded-t-full bg-blue-600" />
      <div className="absolute left-[46px] top-[52px] h-1.5 w-1.5 rounded-full bg-slate-700" />
      <div className="absolute right-[46px] top-[52px] h-1.5 w-1.5 rounded-full bg-slate-700" />
      <div className="absolute top-[64px] h-3 w-6 rounded-b-full border-b-2 border-orange-400" />
    </div>
  )
}

function ProfileCard({ onMockAction }: { onMockAction: (message: string) => void }) {
  return (
    <section className={panelClass('p-5 sm:p-7 lg:col-span-3 xl:col-span-1')}>
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left">
        <div className="h-[125px] w-[125px] shrink-0 overflow-hidden rounded-full bg-blue-100 shadow-sm">
          <AssetImage
            sources={[myPageProfile.avatarUrl, myPageProfile.fallbackAvatarUrl]}
            alt="사용자 프로필 이미지"
            className="h-full w-full object-cover"
            fallback={<ProfileFallbackAvatar />}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <h2 className="text-[28px] font-black tracking-[-0.06em] text-[#07182F]">{myPageProfile.name}</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-black text-blue-700">
              {myPageProfile.userType}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <p className="flex items-center justify-center gap-3 text-[14px] font-semibold text-slate-600 sm:justify-start">
              <Mail size={18} aria-hidden="true" />
              {myPageProfile.email}
            </p>
            <p className="flex items-center justify-center gap-3 text-[14px] font-semibold text-slate-600 sm:justify-start">
              <Phone size={18} aria-hidden="true" />
              {myPageProfile.phone}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onMockAction('프로필 수정은 데모 화면에서만 동작합니다. 실제 정보는 변경되지 않습니다.')}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-5 text-[13px] font-black text-blue-700 transition hover:bg-blue-50"
            >
              <UserRound size={17} aria-hidden="true" />
              프로필 수정
            </button>
            <button
              type="button"
              onClick={() => onMockAction('비밀번호 변경은 데모 화면에서만 표시됩니다. 실제 인증 정보는 변경되지 않습니다.')}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-black text-slate-600 transition hover:bg-slate-50"
            >
              <Lock size={17} aria-hidden="true" />
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SparkLine({ values }: { values: number[] }) {
  if (values.length < 2) {
    return null
  }

  const width = 160
  const height = 40
  const padding = 4
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const xStep = (width - padding * 2) / (values.length - 1)
  const points = values
    .map((value, index) => {
      const x = padding + index * xStep
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg className="mt-5 h-9 w-full" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="#0B6FE8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ActivityStatCard({ stat }: { stat: (typeof myPageStats)[number] }) {
  const Icon = statIconMap[stat.iconType]

  return (
    <section className={panelClass('min-h-[206px] p-5 sm:p-6')}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
        <Icon size={28} aria-hidden="true" />
      </div>

      <p className="mt-6 text-[15px] font-black tracking-[-0.04em] text-[#07182F]">{stat.title}</p>
      <p className="mt-3 text-[34px] font-black leading-none tracking-[-0.06em] text-blue-700">{stat.value}</p>
      <SparkLine values={stat.sparklineValues} />
    </section>
  )
}

function BasicInfoCard() {
  return (
    <section className={panelClass('p-5 sm:p-6')}>
      <h2 className="text-[19px] font-black tracking-[-0.05em] text-[#07182F]">기본 정보</h2>

      <div className="mt-5">
        {myPageBasicInfo.map((row) => (
          <div key={row.label} className="grid grid-cols-[112px_minmax(0,1fr)] border-b border-slate-200 py-4 last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)]">
            <p className="text-[14px] font-black tracking-[-0.04em] text-[#07182F]">{row.label}</p>
            <p className="min-w-0 break-words text-[14px] font-semibold tracking-[-0.04em] text-slate-600">{row.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function MapFallback({ type }: { type: MyPageInterestItem['type'] }) {
  const isRoute = type === 'route'

  return (
    <div
      role="img"
      aria-label={isRoute ? '관심 경로 지도 미리보기' : '관심 지역 지도 미리보기'}
      className="relative h-full w-full overflow-hidden bg-slate-100"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:25px_25px]" />
      <div className="absolute left-[-20px] top-10 h-5 w-[250px] rotate-[-18deg] rounded-full bg-sky-100 shadow-[0_0_0_6px_rgba(255,255,255,0.55)]" />
      <div className="absolute left-[-20px] top-20 h-6 w-[250px] rotate-[12deg] rounded-full bg-green-100 shadow-[0_0_0_6px_rgba(255,255,255,0.55)]" />

      {isRoute ? (
        <>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 210 135" aria-hidden="true">
            <path
              d="M34 110 L35 78 L70 75 L70 48 L116 46 L118 88 L155 82 L156 35 L182 32"
              fill="none"
              stroke="#0B6FE8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <MapPin className="absolute left-[24px] top-[88px] text-green-600" size={28} fill="#16A34A" aria-hidden="true" />
          <MapPin className="absolute right-[20px] top-[15px] text-red-500" size={28} fill="#EF4444" aria-hidden="true" />
        </>
      ) : (
        <>
          <div className="absolute left-1/2 top-1/2 h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-300 bg-blue-200/35" />
          <MapPin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%] text-blue-700" size={34} fill="#0B6FE8" aria-hidden="true" />
        </>
      )}
    </div>
  )
}

function InterestItemCard({ item }: { item: MyPageInterestItem }) {
  const alt = item.type === 'route' ? '관심 경로 지도 미리보기' : '관심 지역 지도 미리보기'

  return (
    <article className="min-w-0">
      <div className="relative h-[135px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <AssetImage
          sources={[item.imageUrl, item.fallbackImageUrl]}
          alt={alt}
          className="h-full w-full object-cover"
          fallback={<MapFallback type={item.type} />}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate text-[14px] font-black tracking-[-0.04em] text-[#07182F]">{item.title}</h3>
        <span className="shrink-0 rounded-md bg-blue-100 px-2 py-1 text-[12px] font-black text-blue-700">
          {item.badgeLabel}
        </span>
      </div>
    </article>
  )
}

function InterestRegionsCard() {
  return (
    <section className={panelClass('p-5 sm:p-6')}>
      <h2 className="text-[19px] font-black tracking-[-0.05em] text-[#07182F]">관심 지역 및 경로</h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {myPageInterestItems.map((item) => (
          <InterestItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

function ToggleSwitch({
  enabled,
  label,
  onToggle,
}: {
  enabled: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      onClick={onToggle}
      className={cn(
        'relative h-[26px] w-[54px] shrink-0 rounded-full transition focus-visible:outline-blue-400',
        enabled ? 'bg-blue-600 shadow-inner' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-[18px] w-[18px] rounded-full bg-white shadow transition',
          enabled ? 'left-[31px]' : 'left-1',
        )}
      />
      <span className={cn('absolute top-1/2 -translate-y-1/2 text-[9px] font-black text-white', enabled ? 'left-2' : 'right-2')}>
        {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

function NotificationSettingsCard({
  states,
  onToggle,
}: {
  states: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <section className={panelClass('p-5 sm:p-6')}>
      <h2 className="text-[19px] font-black tracking-[-0.05em] text-[#07182F]">알림 설정</h2>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4 xl:gap-0">
        {myPageNotificationSettings.map((setting) => {
          const Icon = notificationIconMap[setting.iconType]
          const enabled = states[setting.id] ?? false

          return (
            <div
              key={setting.id}
              className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-4 xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r xl:first:pl-0 xl:last:border-r-0 xl:last:pr-0"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-black tracking-[-0.04em] text-[#07182F]">{setting.title}</h3>
                  <p className="mt-1 text-[12px] font-semibold leading-relaxed tracking-[-0.04em] text-slate-500">
                    {setting.description}
                  </p>
                </div>
              </div>

              <ToggleSwitch
                enabled={enabled}
                label={`${setting.title} ${enabled ? '끄기' : '켜기'}`}
                onToggle={() => onToggle(setting.id)}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ActivityMobileCard({ activity }: { activity: MyPageActivity }) {
  const Icon = activityIconMap[activity.iconType]

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
            <Icon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-slate-700">{activity.type}</p>
            <p className="mt-1 text-[12px] font-semibold text-slate-500">{activity.date}</p>
          </div>
        </div>
        <StatusBadge status={activity.status} statusType={activity.statusType} />
      </div>
      <p className="mt-3 text-[13px] font-semibold leading-5 text-slate-700">{activity.content}</p>
    </article>
  )
}

function RecentActivitiesCard({ onMore }: { onMore: () => void }) {
  return (
    <section className={panelClass('p-5 sm:p-6')}>
      <h2 className="text-[19px] font-black tracking-[-0.05em] text-[#07182F]">최근 활동 내역</h2>

      <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[12px] font-black text-slate-500">
              <th className="px-4 py-3 text-left">유형</th>
              <th className="px-4 py-3 text-left">내용</th>
              <th className="px-4 py-3 text-left">일시</th>
              <th className="px-4 py-3 text-left">상태</th>
            </tr>
          </thead>

          <tbody>
            {myPageRecentActivities.map((activity) => {
              const Icon = activityIconMap[activity.iconType]

              return (
                <tr key={activity.id} className="border-t border-slate-200 text-[12px]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="font-black text-slate-700">{activity.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{activity.content}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{activity.date}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={activity.status} statusType={activity.statusType} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 md:hidden">
        {myPageRecentActivities.map((activity) => (
          <ActivityMobileCard key={activity.id} activity={activity} />
        ))}
      </div>

      <button
        type="button"
        onClick={onMore}
        className="mx-auto mt-4 flex items-center gap-2 text-[14px] font-black text-slate-600 transition hover:text-blue-700"
      >
        더보기
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </section>
  )
}

function CompensationStatusCard({ onMockAction }: { onMockAction: (message: string) => void }) {
  return (
    <section className={panelClass('p-5 sm:p-6')}>
      <h2 className="text-[19px] font-black tracking-[-0.05em] text-[#07182F]">보상 청구 현황</h2>

      <div className="relative mt-5 space-y-3 pl-8">
        <div className="absolute bottom-9 left-[9px] top-4 w-px bg-slate-200" aria-hidden="true" />

        {myPageCompensationClaims.map((claim) => (
          <button
            key={claim.id}
            type="button"
            onClick={() => onMockAction(`${claim.location} 보상 청구 행을 선택했습니다. 실제 상세 조회는 연결되지 않습니다.`)}
            className="relative w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40 sm:px-5"
            aria-label={`${claim.location} 보상 청구 현황 보기`}
          >
            <span
              className={cn(
                'absolute -left-[32px] top-6 h-4 w-4 rounded-full border-[3px] bg-white',
                timelineDotClasses[claim.statusType],
              )}
              aria-hidden="true"
            />

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-black tracking-[-0.04em] text-[#07182F]">{claim.location}</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-500">{claim.date}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                <StatusBadge status={claim.status} statusType={claim.statusType} />
                <ChevronRight size={20} className="text-slate-500" aria-hidden="true" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onMockAction('보상 청구 전체 보기는 데모 화면에서만 표시됩니다.')}
        className="mx-auto mt-4 flex items-center gap-2 text-[14px] font-black text-slate-600 transition hover:text-blue-700"
      >
        전체 보기
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </section>
  )
}

export function MyPage() {
  const [notice, setNotice] = useState('')
  const [notificationStates, setNotificationStates] = useState<Record<string, boolean>>(() => createNotificationState())

  const handleNotificationToggle = (id: string) => {
    setNotificationStates((current) => ({
      ...current,
      [id]: !current[id],
    }))
  }

  return (
    <div className="min-w-0 pb-3">
      <header>
        <h1 className="text-[30px] font-black tracking-[-0.06em] text-[#07182F] sm:text-[34px]">마이페이지</h1>
        <p className="mt-2 text-[15px] font-semibold tracking-[-0.04em] text-slate-500">
          내 정보와 활동 내역을 한눈에 확인하세요.
        </p>
      </header>

      <MockNotice message={notice} />

      <section className="mt-6 grid gap-5 lg:grid-cols-3 xl:grid-cols-[minmax(390px,1.5fr)_repeat(3,minmax(0,0.62fr))]">
        <ProfileCard onMockAction={setNotice} />
        {myPageStats.map((stat) => (
          <ActivityStatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.88fr_1.45fr]">
        <BasicInfoCard />
        <InterestRegionsCard />
      </section>

      <div className="mt-5">
        <NotificationSettingsCard states={notificationStates} onToggle={handleNotificationToggle} />
      </div>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <RecentActivitiesCard onMore={() => setNotice('최근 활동 더보기는 데모 화면에서만 표시됩니다.')} />
        <CompensationStatusCard onMockAction={setNotice} />
      </section>
    </div>
  )
}
