import { type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
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

type ImageState = 'webp' | 'png' | 'hidden'
type UserTypeId = 'driver' | 'rider' | 'admin'

type UserTypeOption = {
  id: UserTypeId
  title: string
  description: string
  alt: string
  imageBase: string
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

type SetupImageProps = {
  basePath: string
  alt: string
  className: string
  fallback: ReactNode
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
    fallback: <UserRound size={34} strokeWidth={2.1} aria-hidden="true" />,
  },
  {
    id: 'rider',
    title: '배달 라이더',
    description: '배달 경로의 위험 구간을 확인하고 안전하게 운행합니다.',
    alt: '배달 라이더 아이콘',
    imageBase: '/assets/setup/setup-user-rider',
    fallback: <Route size={34} strokeWidth={2.1} aria-hidden="true" />,
  },
  {
    id: 'admin',
    title: '지자체 담당자',
    description: '지역 내 도로 위험을 모니터링하고 관리 업무에 활용합니다.',
    alt: '지자체 담당자 아이콘',
    imageBase: '/assets/setup/setup-user-admin',
    fallback: <Building2 size={34} strokeWidth={2.1} aria-hidden="true" />,
  },
]

const cityOptions = ['서울특별시', '부산광역시', '대전광역시', '광주광역시', '경기도']
const districtOptions = ['강남구', '서초구', '송파구', '종로구', '마포구']
const radiusOptions = ['500m', '1km', '2km', '3km', '직접 설정']

function BrowserChrome() {
  return (
    <div className="hidden h-[86px] border-b border-slate-200 bg-white shadow-sm md:block">
      <div className="flex h-[42px] items-center gap-4 bg-slate-100 px-5">
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex h-8 w-[210px] items-center gap-2 rounded-t-xl bg-white px-3 shadow-sm">
          <BrandMark compact />
          <span className="text-xs font-bold text-slate-700">포트홀 가드 AI</span>
          <span className="ml-auto text-slate-400" aria-hidden="true">×</span>
        </div>
        <button type="button" className="text-xl text-slate-500" aria-label="새 탭 열기">+</button>
      </div>
      <div className="flex h-[44px] items-center gap-5 px-5">
        <ChevronLeft size={20} className="text-slate-500" aria-hidden="true" />
        <ChevronRight size={20} className="text-slate-400" aria-hidden="true" />
        <div className="flex h-8 flex-1 items-center rounded-full bg-slate-100 px-4">
          <span className="mr-2 text-[13px] text-slate-500" aria-hidden="true">🔒</span>
          <span className="text-[13px] font-medium text-slate-600">https://pothole-guard.ai/setup</span>
        </div>
        <span className="text-lg text-slate-500" aria-hidden="true">☆</span>
      </div>
    </div>
  )
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  const [showImage, setShowImage] = useState(true)

  if (showImage) {
    return (
      <img
        src="/assets/loading/pothole-guard-logo.png"
        alt={compact ? '' : '포트홀 가드 AI'}
        className={compact ? 'h-5 w-auto object-contain' : 'h-16 w-auto object-contain'}
        onError={() => setShowImage(false)}
        aria-hidden={compact ? 'true' : undefined}
      />
    )
  }

  return (
    <div className={cn('flex items-center justify-center rounded-xl bg-blue-600 text-white', compact ? 'h-5 w-5' : 'h-12 w-12')}>
      <ShieldCheck size={compact ? 14 : 28} aria-hidden="true" />
    </div>
  )
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      <div className="min-w-0">
        <h1 className="text-[24px] font-black tracking-[-0.04em] text-[#07182F]">
          포트홀 가드 <span className="text-[#0B6DDE]">AI</span>
        </h1>
        <p className="mt-1 text-[10px] font-bold text-slate-500">AI로 예측하고, 함께 지키는 안전한 도로</p>
      </div>
    </div>
  )
}

function MinistryLogo() {
  const [showImage, setShowImage] = useState(true)

  return (
    <div className="flex items-center gap-3">
      {showImage ? (
        <img
          src="/assets/loading/molit-logo.png"
          alt="국토교통부"
          className="h-10 w-auto object-contain"
          onError={() => setShowImage(false)}
        />
      ) : (
        <span className="text-[17px] font-black text-slate-700">국토교통부</span>
      )}
    </div>
  )
}

function SetupImage({ basePath, alt, className, fallback }: SetupImageProps) {
  const [imageState, setImageState] = useState<ImageState>('webp')

  if (imageState === 'hidden') {
    return <div className={className}>{fallback}</div>
  }

  return (
    <img
      src={`${basePath}.${imageState}`}
      alt={alt}
      className={className}
      onError={() => setImageState((current) => (current === 'webp' ? 'png' : 'hidden'))}
    />
  )
}

function SetupSidebar() {
  return (
    <aside className="hidden min-h-[calc(100svh-86px)] w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 shadow-[8px_0_30px_rgba(15,40,70,0.04)] lg:flex">
      <BrandLogo />
      <nav className="mt-10 space-y-2" aria-label="서비스 메뉴">
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
      <div className="relative mt-auto space-y-8">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 text-center shadow-[0_18px_45px_rgba(0,96,210,0.07)]">
          <p className="text-[14px] font-black leading-relaxed text-blue-700">
            AI가 도로를 지키고
            <br />
            시민이 함께 안전을 만듭니다.
          </p>
          <SetupImage
            basePath="/assets/auth/signup-security"
            alt="안전한 개인정보 보호를 상징하는 방패 일러스트"
            className="mx-auto mt-4 h-[62px] w-[72px] object-contain"
            fallback={
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
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
        <button
          type="button"
          aria-label="사이드바 접기"
          className="absolute bottom-3 right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-md"
        >
          <ChevronLeft size={20} aria-hidden="true" />
          <ChevronLeft size={20} className="-ml-3" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

function MobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <BrandLogo />
      <TopUserBar compact />
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
    <div className="mx-auto mt-7 w-full max-w-[980px]">
      <ol className="relative grid grid-cols-4 gap-2">
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-slate-200" aria-hidden="true" />
        <div className="absolute left-[12.5%] top-4 h-[2px] w-[25%] bg-blue-600" aria-hidden="true" />
        {setupSteps.map((label, index) => {
          const active = index === 0
          return (
            <li key={label} className="relative z-10 flex flex-col items-center text-center">
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
              <span className={cn('mt-3 text-[11px] font-black sm:text-[12px]', active ? 'text-blue-700' : 'text-slate-500')}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function SectionCard({ number, title, description, children }: { number: number; title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_34px_rgba(15,40,70,0.06)]">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-black text-[#07182F]">
            {number}. {title}
          </h2>
          <CircleHelp size={16} className="text-slate-400" aria-hidden="true" />
        </div>
        <p className="mt-2 text-[12px] font-semibold text-slate-500">{description}</p>
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
        'relative flex min-h-[112px] items-center gap-5 rounded-xl border bg-white px-6 text-left transition focus-visible:outline-blue-400 sm:px-8',
        selected
          ? 'border-blue-600 bg-blue-50/20 shadow-[0_10px_24px_rgba(0,96,210,0.1)]'
          : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/30',
      )}
    >
      <span
        className={cn(
          'absolute left-4 top-4 flex h-[18px] w-[18px] items-center justify-center rounded-full border',
          selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white',
        )}
      >
        {selected && <Check size={12} strokeWidth={3} aria-hidden="true" />}
      </span>
      <SetupImage
        basePath={option.imageBase}
        alt={option.alt}
        className="ml-8 flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-blue-50 object-contain text-blue-700"
        fallback={option.fallback}
      />
      <span>
        <span className="block text-[15px] font-black text-[#07182F]">{option.title}</span>
        <span className="mt-2 block text-[12px] font-semibold leading-relaxed text-slate-500">{option.description}</span>
      </span>
    </button>
  )
}

function SelectField({ id, label, icon, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[12px] font-bold text-slate-500">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-700">{icon}</span>
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-white px-12 text-[15px] font-black text-[#07182F] shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
    <div className="flex min-h-[70px] items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center gap-4">
        <span className="text-slate-600">{icon}</span>
        <div>
          <h3 className="text-[15px] font-black text-[#07182F]">{title}</h3>
          <p className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-500">{description}</p>
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
      <BrowserChrome />
      <MobileHeader />
      <div className="flex">
        <SetupSidebar />
        <section className="relative min-h-[calc(100svh-86px)] flex-1 bg-gradient-to-br from-white via-[#FBFDFF] to-[#F4F8FF] px-4 pb-8 pt-5 sm:px-6 xl:px-10">
          <div className="absolute right-9 top-6">
            <TopUserBar />
          </div>
          <div className="mx-auto max-w-[1180px]">
            <div className="pr-0 md:pr-44">
              <h1 className="text-[30px] font-black text-[#07182F] sm:text-[32px]">초기 설정</h1>
              <p className="mt-2 text-[14px] font-semibold text-slate-500">서비스를 맞춤 설정하고 더 안전한 도로 환경을 만들어보세요.</p>
            </div>

            <SetupProgress />

            <div className="mt-7 space-y-3">
              <SectionCard number={1} title="사용자 유형 선택" description="서비스 이용 목적에 맞는 사용자 유형을 선택해주세요.">
                <div className="grid gap-5 lg:grid-cols-3">
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
                <div className="grid items-end gap-6 xl:grid-cols-[1fr_1fr_360px]">
                  <SelectField id="city" label="시/도 선택" icon={<MapPin size={18} fill="#0B6DDE" aria-hidden="true" />} value={city} options={cityOptions} onChange={setCity} />
                  <SelectField id="district" label="자치구 선택" icon={<Building2 size={18} aria-hidden="true" />} value={district} options={districtOptions} onChange={setDistrict} />
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center xl:justify-end">
                    <SetupImage
                      basePath="/assets/setup/setup-region-map"
                      alt="선택 지역 지도 미리보기"
                      className="h-[86px] w-full rounded-2xl border border-slate-100 bg-slate-50 object-cover sm:w-[190px]"
                      fallback={<MapPin size={34} fill="#0B6DDE" className="text-blue-700" aria-hidden="true" />}
                    />
                    <p className="text-[13px] font-bold leading-relaxed text-slate-600">
                      선택 지역의 맞춤형
                      <br className="hidden sm:block" />
                      위험 정보를 제공합니다.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard number={3} title="위치 권한 및 알림 설정" description="정확한 위치 기반 서비스와 중요한 알림을 받기 위한 설정입니다.">
                <div className="grid gap-5 lg:grid-cols-2">
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
                <div className="grid items-center gap-6 xl:grid-cols-[1fr_70px_1fr_220px]">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-black text-slate-600">
                      <MapPin size={15} className="text-blue-700" aria-hidden="true" />
                      위험 알림 반경 설정
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-slate-500">현재 위치 기준으로 위험 알림을 받을 반경을 설정합니다.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {radiusOptions.map((option) => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => setRadius(option)}
                          className={cn(
                            'h-9 rounded-lg border px-5 text-[13px] font-black transition',
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

                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-black text-slate-600">
                      <Route size={15} className="text-green-600" aria-hidden="true" />
                      관심 경로 설정 <span className="text-slate-400">(선택)</span>
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-slate-500">자주 이용하는 경로를 등록하면 경로상의 위험을 미리 알려드립니다.</p>
                    <button
                      type="button"
                      className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-white px-5 text-[13px] font-black text-blue-700 transition hover:bg-blue-50"
                    >
                      관심 경로 추가
                      <Plus size={17} aria-hidden="true" />
                    </button>
                  </div>

                  <SetupImage
                    basePath="/assets/setup/setup-route-map"
                    alt="관심 경로 미리보기 지도"
                    className="h-[86px] w-full rounded-2xl border border-slate-100 bg-slate-50 object-cover xl:w-[220px]"
                    fallback={<Route size={34} className="text-blue-700" aria-hidden="true" />}
                  />
                </div>
              </SectionCard>
            </div>

            <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToRiskMap}
                className="h-[42px] rounded-lg border border-slate-200 bg-white px-8 text-[14px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                건너뛰기
              </button>
              <button
                type="button"
                onClick={goToRiskMap}
                className="flex h-[44px] items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] px-14 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5"
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
