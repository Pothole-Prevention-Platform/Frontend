import { type FormEvent, type ReactNode, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  BellRing,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react'

type BenefitItem = {
  icon: ReactNode
  title: string
  description: string
}

type AgreementItem = {
  id: string
  icon: ReactNode
  title: string
  description: string
}

type AssetState = 'png' | 'hidden'

const securityImagePaths: Record<Exclude<AssetState, 'hidden'>, string> = {
  png: '/assets/auth/signup-security.png',
}

const benefitItems: BenefitItem[] = [
  {
    icon: <Shield size={30} strokeWidth={2.2} aria-hidden="true" />,
    title: 'AI 기반 위험 예측',
    description: '첨단 AI 기술로 위험을 미리 예측하고 사전에 대응할 수 있어요.',
  },
  {
    icon: <BellRing size={30} strokeWidth={2.1} aria-hidden="true" />,
    title: '실시간 알림',
    description: '중요한 위험 정보를 실시간으로 받아보고 신속하게 대응할 수 있어요.',
  },
  {
    icon: <Users size={31} strokeWidth={2.1} aria-hidden="true" />,
    title: '함께 만드는 안전',
    description: '시민의 참여와 신고가 더 안전한 사회를 만드는 힘이 됩니다.',
  },
]

const agreementItems: AgreementItem[] = [
  {
    id: 'location',
    icon: <MapPin size={24} strokeWidth={2.2} aria-hidden="true" />,
    title: '위치정보 활용',
    description: '위험 정보 제공 및 맞춤형 알림을 위해 위치정보를 활용합니다.',
  },
  {
    id: 'notification',
    icon: <Bell size={24} strokeWidth={2.2} aria-hidden="true" />,
    title: '서비스 알림 수신',
    description: '서비스 업데이트 및 중요 알림을 이메일, 문자, 푸시로 받아보겠습니다.',
  },
  {
    id: 'privacy',
    icon: <FileText size={24} strokeWidth={2.2} aria-hidden="true" />,
    title: '개인정보 수집 및 이용 동의',
    description: '서비스 이용을 위한 개인정보 수집 및 이용에 동의합니다.',
  },
]

function BrandLogo() {
  const [showImage, setShowImage] = useState(true)

  return (
    <Link to="/" className="flex items-center gap-3" aria-label="포트홀 가드 AI 홈으로 이동">
      {showImage ? (
        <img
          src="/assets/loading/pothole-guard-logo-cropped.png"
          alt="포트홀 가드 AI"
          className="h-[62px] w-auto max-w-[240px] object-contain sm:h-[70px] sm:max-w-[280px] lg:h-[76px] lg:max-w-[310px]"
          onError={() => setShowImage(false)}
        />
      ) : (
        <div>
          <p className="text-xl font-black text-[#07182F] sm:text-2xl">
            포트홀 가드 <span className="text-[#0B6FE8]">AI</span>
          </p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">
            AI로 예측하고, 함께 지키는 안전한 포트홀
          </p>
        </div>
      )}
    </Link>
  )
}

function MinistryLogo() {
  const [showImage, setShowImage] = useState(true)

  return (
    <div className="flex items-center gap-3">
      {showImage ? (
        <img
          src="/assets/loading/molit-logo-cropped.png"
          alt="국토교통부"
          className="h-9 w-auto max-w-[150px] object-contain sm:h-11 sm:max-w-[180px]"
          onError={() => setShowImage(false)}
        />
      ) : (
        <span className="text-lg font-black text-slate-700">국토교통부</span>
      )}
    </div>
  )
}

function SignupHeader() {
  return (
    <header className="flex min-h-[104px] shrink-0 items-center justify-between px-5 py-4 sm:px-8 lg:px-11">
      <BrandLogo />
    </header>
  )
}

function BenefitCard() {
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-[14px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,40,70,0.05)] sm:p-6">
      <div className="space-y-4">
        {benefitItems.map((item) => (
          <div key={item.title} className="grid min-w-0 grid-cols-[58px_minmax(0,1fr)] gap-4">
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[12px] border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h3 className="text-base font-black text-[#07182F]">{item.title}</h3>
              <p className="mt-2 break-all text-sm font-semibold leading-relaxed text-slate-600 sm:break-words">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityImage() {
  const [imageState, setImageState] = useState<AssetState>('png')

  if (imageState === 'hidden') {
    return (
      <div className="flex h-[78px] w-[86px] shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-md">
        <ShieldCheck size={42} strokeWidth={2.1} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={securityImagePaths[imageState]}
      alt="안전한 개인정보 보호를 나타내는 방패 일러스트"
      className="h-[78px] w-[86px] shrink-0 object-contain"
      onError={() => setImageState('hidden')}
    />
  )
}

function SignupIntroPanel() {
  return (
    <aside className="signup-intro-panel mx-auto flex min-w-0 max-w-[430px] flex-col pt-6 pb-4 lg:mx-0 lg:max-w-[460px] lg:pt-[34px] lg:pb-0">
      <div className="text-center">
        <h1 className="text-[34px] font-black text-[#07182F] sm:text-[40px]">회원가입</h1>
        <p className="mt-4 break-all text-sm font-bold text-slate-500 sm:break-words sm:text-base">
          포트홀 가드 AI와 함께 더 안전한 사회를 만들어가요.
        </p>
      </div>

      <div className="mt-8">
        <BenefitCard />
      </div>

      <div className="mt-8 grid w-full max-w-full min-w-0 grid-cols-[86px_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-[14px] border border-blue-100 bg-blue-50/75 p-5 shadow-[0_18px_45px_rgba(0,96,210,0.06)] sm:gap-5">
        <SecurityImage />
        <p className="min-w-0 flex-1 break-all text-[17px] font-black leading-relaxed text-blue-700 sm:break-words">
          AI가 도로를 지키고
          <br />
          시민이 함께 안전을 만듭니다.
        </p>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-500 sm:text-[15px]">
        <span>이미 계정이 있으신가요?</span>
        <Link to="/auth/login" className="inline-flex items-center gap-1 font-black text-blue-700 transition hover:text-blue-500">
          로그인하기
          <ChevronDown className="-rotate-90" size={17} strokeWidth={2.3} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  )
}

type TextInputProps = {
  id: string
  label: string
  placeholder: string
  type?: string
  helper?: string
  rightIcon?: ReactNode
  autoComplete?: string
}

function TextInput({
  id,
  label,
  placeholder,
  type = 'text',
  helper,
  rightIcon,
  autoComplete,
}: TextInputProps) {
  return (
    <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-start md:gap-4">
      <label htmlFor={id} className="pt-0 text-sm font-black text-[#07182F] md:pt-2.5">
        {label}
      </label>
      <div>
        <div className="relative">
          <input
            id={id}
            name={id}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">{rightIcon}</div>}
        </div>
        {helper && <p className="mt-1.5 text-xs font-semibold text-slate-500">{helper}</p>}
      </div>
    </div>
  )
}

function PasswordInput({
  id,
  label,
  placeholder,
  helper,
  autoComplete,
}: {
  id: string
  label: string
  placeholder: string
  helper?: string
  autoComplete: string
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <TextInput
      id={id}
      label={label}
      placeholder={placeholder}
      type={isVisible ? 'text' : 'password'}
      helper={helper}
      autoComplete={autoComplete}
      rightIcon={
        <button
          type="button"
          aria-label={isVisible ? `${label} 숨기기` : `${label} 보기`}
          className="text-slate-600 transition hover:text-blue-600"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <Eye size={20} strokeWidth={2} aria-hidden="true" /> : <EyeOff size={20} strokeWidth={2} aria-hidden="true" />}
        </button>
      }
    />
  )
}

function PhoneInput() {
  return (
    <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-start md:gap-4">
      <label htmlFor="phone" className="pt-0 text-sm font-black text-[#07182F] md:pt-2.5">
        휴대폰 번호
      </label>
      <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
        <label htmlFor="countryCode" className="sr-only">
          국가 번호
        </label>
        <select
          id="countryCode"
          name="countryCode"
          defaultValue="+82"
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option>+82</option>
          <option>+1</option>
          <option>+81</option>
        </select>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="휴대폰 번호를 입력하세요 (예: 010-1234-5678)"
          className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </div>
  )
}

function UserTypeSelect() {
  const [userType, setUserType] = useState('')

  return (
    <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-start md:gap-4">
      <label htmlFor="userType" className="pt-0 text-sm font-black text-[#07182F] md:pt-2.5">
        사용자 유형
      </label>
      <select
        id="userType"
        name="userType"
        value={userType}
        onChange={(event) => setUserType(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        <option value="" disabled>
          사용자 유형을 선택하세요
        </option>
        <option value="rider">배달 라이더</option>
        <option value="driver">일반 운전자</option>
        <option value="victim">피해 차주</option>
        <option value="manager">지자체 담당자</option>
      </select>
    </div>
  )
}

function AgreementRow({ item }: { item: AgreementItem }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="grid grid-cols-[28px_1fr] gap-3 rounded-lg border border-transparent px-0 py-2 transition hover:border-blue-100 hover:bg-blue-50/40 sm:grid-cols-[28px_32px_minmax(0,1fr)_104px] sm:items-center sm:px-1">
      <input
        id={item.id}
        name={item.id}
        type="checkbox"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="hidden items-center text-blue-700 sm:flex">{item.icon}</div>
      <label htmlFor={item.id} className="cursor-pointer">
        <span className="text-sm font-black text-[#07182F]">
          {item.title} <span className="text-[11px] font-bold text-slate-500">(선택)</span>
        </span>
        <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-500">{item.description}</span>
      </label>
      <button
        type="button"
        className="col-start-2 h-9 rounded-md border border-slate-200 bg-white px-3 text-[13px] font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:col-start-auto"
      >
        자세히 보기
      </button>
    </div>
  )
}

function SignupFormCard() {
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/setup')
  }

  return (
    <section className="w-full max-w-full rounded-[16px] border border-slate-200 bg-white/95 px-5 py-7 shadow-[0_22px_65px_rgba(15,40,70,0.12)] sm:max-w-none sm:px-8 lg:max-w-[1160px] lg:px-10 lg:py-8">
      <div>
        <h2 className="text-2xl font-black text-[#07182F]">회원 정보 입력</h2>
        <p className="mt-3 text-sm font-semibold text-slate-500">정확한 정보 입력은 안전한 서비스 이용을 위해 중요합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="space-y-3">
          <TextInput id="name" label="이름" placeholder="이름을 입력하세요" autoComplete="name" />
          <TextInput id="email" label="이메일" placeholder="이메일 주소를 입력하세요" type="email" autoComplete="email" />
          <PasswordInput
            id="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            helper="영문, 숫자, 특수문자 포함 8자 이상"
            autoComplete="new-password"
          />
          <PasswordInput
            id="passwordConfirm"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
          />
          <PhoneInput />
          <UserTypeSelect />
        </div>

        <div className="mt-7">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm font-bold text-slate-600">선택 사항</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-2">
            {agreementItems.map((item) => (
              <AgreementRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 h-12 w-full rounded-md bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-base font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(0,95,220,0.3)]"
        >
          가입하기
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
          <ShieldCheck size={20} strokeWidth={2} className="text-blue-600" aria-hidden="true" />
          <p className="text-[13px] font-bold">안전한 개인정보 보호를 약속합니다.</p>
        </div>
      </form>
    </section>
  )
}

function SignupFooter() {
  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white/95 px-5 py-4 sm:px-8 lg:px-11">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <MinistryLogo />
          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            © 2024 Ministry of Land,
            <br />
            Infrastructure and Transport. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end md:gap-8">
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] font-black text-slate-600" aria-label="하단 메뉴">
            <button type="button" className="hover:text-blue-700">
              이용약관
            </button>
            <button type="button" className="hover:text-blue-700">
              개인정보처리방침
            </button>
            <button type="button" className="hover:text-blue-700">
              고객센터
            </button>
            <button type="button" className="hover:text-blue-700">
              시스템 상태
            </button>
          </nav>

          <div className="flex h-10 w-fit items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-[13px] font-black text-slate-700">모든 시스템 정상</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function SignupPage() {
  return (
    <main className="flex min-h-svh flex-col overflow-x-hidden bg-gradient-to-br from-white via-[#FAFCFF] to-[#F3F8FF] text-slate-900">
      <SignupHeader />

      <div className="mx-auto grid w-full max-w-[1840px] flex-1 min-w-0 grid-cols-[minmax(0,1fr)] gap-8 px-5 pt-4 pb-10 sm:px-8 lg:grid-cols-[minmax(390px,460px)_minmax(0,1fr)] lg:gap-[88px] lg:px-11 lg:pt-2 lg:pb-9 xl:gap-[96px]">
        <SignupIntroPanel />
        <div className="flex min-w-0 items-start justify-center lg:justify-start">
          <SignupFormCard />
        </div>
      </div>

      <SignupFooter />
    </main>
  )
}
