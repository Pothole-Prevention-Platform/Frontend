import { type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileText,
  Landmark,
  LayoutDashboard,
  MapPin,
  Plus,
  Route,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { cn } from '../utils/cn'

type UserTypeId = 'driver' | 'rider' | 'admin'

type UserTypeOption = {
  id: UserTypeId
  title: string
  description: string
  alt: string
  imageBase: string
  fallback: ReactNode
}

type AssetImageProps = {
  sources: string[]
  alt: string
  className: string
  fallback: ReactNode
}

type SelectFieldProps = {
  id: string
  label: string
  icon: ReactNode
  value: string
  options: string[]
  onChange: (value: string) => void
}

const navItems = [
  { label: '위험 예측지도', icon: MapPin },
  { label: '시민 신고', icon: ClipboardList },
  { label: 'AI 판별', icon: ShieldCheck },
  { label: '관할기관 안내', icon: Landmark },
  { label: '보상 청구', icon: FileText },
  { label: '실시간 알림', icon: Bell },
  { label: '관리자 대시보드', icon: LayoutDashboard },
]

const setupSteps = ['사용자 설정', '지역 설정', '알림 설정', '완료']

const userTypeOptions: UserTypeOption[] = [
  {
    id: 'driver',
    title: '일반 운전자',
    description: '도로 위험 정보를 확인하고 안전 운전에 활용합니다.',
    alt: '일반 운전자 아이콘',
    imageBase: '/assets/setup/setup-user-driver',
    fallback: <UserRound size={30} strokeWidth={2.1} aria-hidden="true" />,
  },
  {
    id: 'rider',
    title: '배달 라이더',
    description: '배달 경로의 위험 구간을 확인하고 안전하게 운행합니다.',
    alt: '배달 라이더 아이콘',
    imageBase: '/assets/setup/setup-user-rider',
    fallback: <Route size={30} strokeWidth={2.1} aria-hidden="true" />,
  },
  {
    id: 'admin',
    title: '지자체 담당자',
    description: '지역 내 도로 위험을 모니터링하고 관리 업무에 활용합니다.',
    alt: '지자체 담당자 아이콘',
    imageBase: '/assets/setup/setup-user-admin',
    fallback: <Building2 size={30} strokeWidth={2.1} aria-hidden="true" />,
  },
]

const cityOptions = ['서울특별시', '부산광역시', '대전광역시', '광주광역시', '경기도']
const districtOptions = ['강남구', '서초구', '송파구', '종로구', '마포구']
const radiusOptions = ['500m', '1km', '2km', '3km', '직접 설정']

function AssetImage({ sources, alt, className, fallback }: AssetImageProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const src = sources[sourceIndex]

  if (!src) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  )
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <AssetImage
      sources={['/assets/loading/pothole-guard-logo-cropped.png', '/assets/loading/pothole-guard-logo.png']}
      alt="포트홀 가드 AI"
      className={cn('h-auto object-contain', compact ? 'w-[178px] max-w-[64vw]' : 'w-[182px]')}
      fallback={
        <div>
          <p className={cn('font-black tracking-[-0.04em] text-[#07182F]', compact ? 'text-[20px]' : 'text-[24px]')}>
            포트홀 가드 <span className="text-[#0B6DDE]">AI</span>
          </p>
          {!compact && <p className="mt-1 text-[10px] font-bold text-slate-500">AI로 예측하고, 함께 지키는 안전한 도로</p>}
        </div>
      }
    />
  )
}

function MinistryLogo() {
  return (
    <AssetImage
      sources={['/assets/loading/molit-logo-cropped.png', '/assets/loading/molit-logo.png']}
      alt="국토교통부"
      className="h-auto w-[122px] object-contain"
      fallback={<span className="text-[17px] font-black text-slate-700">국토교통부</span>}
    />
  )
}

function SetupSidebar() {
  return (
    <aside className="hidden min-h-svh w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-[8px_0_30px_rgba(15,40,70,0.04)] xl:flex">
      <BrandLogo />
      <nav className="mt-9 space-y-2" aria-label="서비스 메뉴">
        {navItems.map(({ label, icon: Icon }) => (
          <button
            type="button"
            key={label}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] font-extrabold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <Icon size={22} className="text-slate-500" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <div className="relative mt-auto space-y-7">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 text-center shadow-[0_18px_45px_rgba(0,96,210,0.07)]">
          <p className="text-[14px] font-black leading-relaxed text-blue-700">
            AI가 도로를 지키고
            <br />
            시민이 함께 안전을 만듭니다.
          </p>
          <AssetImage
            sources={['/assets/auth/signup-security.webp', '/assets/auth/signup-security.png']}
            alt="안전한 개인정보 보호를 상징하는 방패 일러스트"
            className="mx-auto mt-4 h-[62px] w-[72px] object-contain"
            fallback={
              <div className="mx-auto mt-4 flex h-[62px] w-[72px] items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <ShieldCheck size={38} aria-hidden="true" />
              </div>
            }
          />
          <button
            type="button"
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-white text-[13px] font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            서비스 소개 보기
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(15,40,70,0.05)]">
          <MinistryLogo />
          <p className="mt-4 text-[11px] font-medium leading-relaxed text-slate-500">
            © 2024 Ministry of Land,
            <br />
            Infrastructure and Transport.
            <br />
            All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  )
}

function MobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 xl:hidden">
      <BrandLogo compact />
    </header>
  )
}

function TopUserBar({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-4', !compact && 'hidden md:flex')}>
      <button
        type="button"
        aria-label="알림 보기"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#07182F] transition hover:bg-blue-50"
      >
        <Bell size={compact ? 21 : 25} aria-hidden="true" />
        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
          12
        </span>
      </button>
      <div className="hidden items-center gap-3 sm:flex">
        <div className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-blue-100 shadow-sm" aria-hidden="true">
          <div className="mx-auto mt-2 h-5 w-5 rounded-full bg-[#F2C2A2]" />
          <div className="mx-auto mt-1 h-8 w-7 rounded-t-full bg-[#10233F]" />
        </div>
        <button type="button" className="flex items-center gap-2 text-[14px] font-black text-slate-800 transition hover:text-blue-700">
          홍길동
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function SetupProgress() {
  return (
    <ol className="relative mx-auto mt-4 grid w-full max-w-[940px] grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 sm:gap-2">
      <div className="absolute left-[12.5%] right-[12.5%] top-4 hidden h-px bg-slate-200 sm:block" aria-hidden="true" />
      <div className="absolute left-[12.5%] top-4 hidden h-[2px] w-[25%] bg-blue-600 sm:block" aria-hidden="true" />
      {setupSteps.map((label, index) => {
        const active = index === 0

        return (
          <li key={label} className="relative z-10 flex min-w-0 flex-col items-center text-center">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-[13px] font-black',
                active
                  ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_18px_rgba(0,96,210,0.24)]'
                  : 'border-slate-300 bg-white text-slate-500',
              )}
            >
              {index + 1}
            </span>
            <span className={cn('mt-2 truncate text-[10px] font-black sm:text-[12px]', active ? 'text-blue-700' : 'text-slate-500')}>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function SectionCard({ number, title, description, children }: { number: number; title: string; description: string; children: ReactNode }) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_34px_rgba(15,40,70,0.06)] sm:px-5">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-black text-[#07182F]">
            {number}. {title}
          </h2>
          <CircleHelp size={16} className="text-slate-400" aria-hidden="true" />
        </div>
        <p className="mt-1 text-[12px] font-semibold leading-tight text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

function UserTypeCard({ option, selected, onSelect }: { option: UserTypeOption; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'relative grid min-h-[96px] w-full max-w-full min-w-0 grid-cols-[64px_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-xl border bg-white px-3 text-left transition focus-visible:outline-blue-400 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-3 sm:px-6',
        selected
          ? 'border-blue-600 bg-blue-50/20 shadow-[0_10px_24px_rgba(0,96,210,0.1)]'
          : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30',
      )}
    >
      <span
        className={cn(
          'absolute left-3 top-4 flex h-[18px] w-[18px] items-center justify-center rounded-full border sm:left-4',
          selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white',
        )}
      >
        {selected && <Check size={12} strokeWidth={3} aria-hidden="true" />}
      </span>
      <AssetImage
        sources={[`${option.imageBase}.webp`, `${option.imageBase}.png`]}
        alt={option.alt}
        className="ml-2 h-[56px] w-[56px] shrink-0 rounded-full bg-blue-50 object-contain text-blue-700 sm:ml-7"
        fallback={
          <span className="ml-2 flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 sm:ml-7">
            {option.fallback}
          </span>
        }
      />
      <span className="min-w-0">
        <span className="block text-[15px] font-black text-[#07182F]">{option.title}</span>
        <span className="mt-2 block break-words text-[12px] font-semibold leading-snug text-slate-500">{option.description}</span>
      </span>
    </button>
  )
}

function SelectField({ id, label, icon, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold text-slate-500">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-700">{icon}</span>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[48px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-12 text-[15px] font-black text-[#07182F] shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      </div>
    </div>
  )
}

function SettingToggle({
  icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: ReactNode
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex min-h-[64px] items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="shrink-0 text-slate-600">{icon}</span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-black text-[#07182F]">{title}</h3>
          <p className="mt-1 break-words text-[12px] font-semibold leading-snug text-slate-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className={cn('relative h-[24px] w-[46px] shrink-0 rounded-full shadow-inner transition', checked ? 'bg-blue-600' : 'bg-slate-300')}
      >
        <span className={cn('absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition', checked ? 'right-[3px]' : 'left-[3px]')} />
      </button>
    </div>
  )
}

export function InitialSetupPage() {
  const navigate = useNavigate()
  const [selectedUserType, setSelectedUserType] = useState<UserTypeId>('driver')
  const [city, setCity] = useState('서울특별시')
  const [district, setDistrict] = useState('강남구')
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [radius, setRadius] = useState('1km')

  const goToRiskMap = () => navigate('/risk-map')

  return (
    <main className="min-h-svh overflow-x-hidden bg-white text-slate-900">
      <MobileHeader />
      <div className="flex w-full min-w-0 overflow-x-hidden">
        <SetupSidebar />
        <section className="relative min-h-svh w-full min-w-0 flex-1 basis-0 overflow-x-hidden bg-gradient-to-br from-white via-[#FBFDFF] to-[#F4F8FF] px-4 pb-5 pt-5 sm:px-6 xl:px-10">
          <div className="absolute right-9 top-6">
            <TopUserBar />
          </div>
          <div className="mx-auto w-full min-w-0 max-w-[1440px]">
            <div className="pr-0 md:pr-44">
              <h1 className="text-[30px] font-black text-[#07182F] sm:text-[32px]">초기 설정</h1>
              <p className="mt-2 text-[14px] font-semibold text-slate-500">서비스를 맞춤 설정하고 더 안전한 도로 환경을 만들어보세요.</p>
            </div>

            <SetupProgress />

            <div className="mt-4 space-y-2.5">
              <SectionCard number={1} title="사용자 유형 선택" description="서비스 이용 목적에 맞는 사용자 유형을 선택해주세요.">
                <div className="grid gap-4 xl:grid-cols-3 xl:gap-5">
                  {userTypeOptions.map((option) => (
                    <UserTypeCard
                      key={option.id}
                      option={option}
                      selected={selectedUserType === option.id}
                      onSelect={() => setSelectedUserType(option.id)}
                    />
                  ))}
                </div>
              </SectionCard>

              <SectionCard number={2} title="기본 지역 설정" description="자주 이용하거나 관심 있는 지역을 설정해주세요.">
                <div className="grid min-w-0 items-end gap-5 xl:grid-cols-[1fr_1fr_330px] 2xl:grid-cols-[1fr_1fr_360px]">
                  <SelectField
                    id="city"
                    label="시/도 선택"
                    icon={<MapPin size={18} fill="#0B6DDE" aria-hidden="true" />}
                    value={city}
                    options={cityOptions}
                    onChange={setCity}
                  />
                  <SelectField
                    id="district"
                    label="자치구 선택"
                    icon={<Building2 size={18} aria-hidden="true" />}
                    value={district}
                    options={districtOptions}
                    onChange={setDistrict}
                  />
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
                    <AssetImage
                      sources={['/assets/setup/setup-region-map.webp', '/assets/setup/setup-region-map.png']}
                      alt="선택 지역 지도 미리보기"
                      className="h-[76px] w-full rounded-2xl border border-slate-100 bg-slate-50 object-cover sm:w-[190px]"
                      fallback={
                        <div className="flex h-[76px] w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-blue-700 sm:w-[190px]">
                          <MapPin size={34} fill="#0B6DDE" aria-hidden="true" />
                        </div>
                      }
                    />
                    <p className="break-words text-[13px] font-bold leading-relaxed text-slate-600">
                      선택 지역의 맞춤형
                      <br className="hidden sm:block" />
                      위험 정보를 제공합니다.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard number={3} title="위치 권한 및 알림 설정" description="정확한 위치 기반 서비스와 중요한 알림을 받기 위한 설정입니다.">
                <div className="grid min-w-0 gap-4 lg:grid-cols-2 xl:gap-5">
                  <SettingToggle
                    icon={<MapPin size={28} aria-hidden="true" />}
                    title="위치 권한 허용"
                    description="실시간 위치 기반의 위험 정보와 맞춤 알림을 제공받을 수 있습니다."
                    checked={locationEnabled}
                    onToggle={() => setLocationEnabled((current) => !current)}
                  />
                  <SettingToggle
                    icon={<Bell size={28} aria-hidden="true" />}
                    title="알림 허용"
                    description="위험 구간 알림, 긴급 공지 등 중요한 정보를 놓치지 않도록 도와드립니다."
                    checked={notificationEnabled}
                    onToggle={() => setNotificationEnabled((current) => !current)}
                  />
                </div>
              </SectionCard>

              <SectionCard number={4} title="위험 알림 반경 또는 관심 경로 설정" description="위험 알림을 받을 반경 또는 자주 다니는 경로를 설정해주세요.">
                <div className="grid min-w-0 items-center gap-5 xl:grid-cols-[1.2fr_50px_1fr_200px] 2xl:grid-cols-[1.2fr_50px_1fr_220px]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[12px] font-black text-slate-600">
                      <MapPin size={15} className="text-blue-700" aria-hidden="true" />
                      위험 알림 반경 설정
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-slate-500">현재 위치 기준으로 위험 알림을 받을 반경을 설정합니다.</p>
                    <div className="mt-3 flex flex-wrap gap-2 xl:gap-3">
                      {radiusOptions.map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => setRadius(option)}
                          className={cn(
                            'h-9 rounded-lg border px-4 text-[13px] font-black transition 2xl:px-5',
                            radius === option
                              ? 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_16px_rgba(0,96,210,0.2)]'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50',
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative hidden items-center justify-center xl:flex">
                    <div className="h-[78px] w-px bg-slate-200" aria-hidden="true" />
                    <span className="absolute bg-white px-3 text-[12px] font-bold text-slate-500">또는</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[12px] font-black text-slate-600">
                      <Route size={15} className="text-green-600" aria-hidden="true" />
                      관심 경로 설정 <span className="text-slate-400">(선택)</span>
                    </div>
                    <p className="mt-1 break-words text-[12px] font-semibold text-slate-500">자주 이용하는 경로를 등록하면 경로상의 위험을 미리 알려드립니다.</p>
                    <button
                      type="button"
                      className="mt-3 flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-white px-5 text-[13px] font-black text-blue-700 transition hover:bg-blue-50"
                    >
                      관심 경로 추가
                      <Plus size={17} aria-hidden="true" />
                    </button>
                  </div>

                  <AssetImage
                    sources={['/assets/setup/setup-route-map.webp', '/assets/setup/setup-route-map.png']}
                    alt="관심 경로 미리보기 지도"
                    className="h-[76px] w-full rounded-2xl border border-slate-100 bg-slate-50 object-cover xl:w-[200px] 2xl:w-[220px]"
                    fallback={
                      <div className="flex h-[76px] w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-blue-700 xl:w-[200px] 2xl:w-[220px]">
                        <Route size={34} aria-hidden="true" />
                      </div>
                    }
                  />
                </div>
              </SectionCard>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToRiskMap}
                className="h-[42px] w-full rounded-lg border border-slate-200 bg-white px-8 text-[14px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                건너뛰기
              </button>
              <button
                type="button"
                onClick={goToRiskMap}
                className="flex h-[44px] w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] px-14 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 sm:w-auto"
              >
                설정 완료
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
