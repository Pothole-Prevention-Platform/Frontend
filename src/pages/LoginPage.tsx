import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

function BrandLogo() {
  const [showImage, setShowImage] = useState(true)

  return (
    <Link to="/" className="inline-flex items-center" aria-label="포트홀 가드 AI 홈으로 이동">
      {showImage ? (
        <img
          src="/assets/loading/pothole-guard-logo-cropped.png"
          alt="포트홀 가드 AI"
          className="h-[72px] w-auto object-contain sm:h-[82px] lg:h-[88px]"
          onError={() => setShowImage(false)}
        />
      ) : (
        <div>
          <h1 className="text-[28px] font-black text-[#07182F] sm:text-[34px]">
            포트홀 가드 <span className="text-[#0B6FE8]">AI</span>
          </h1>
          <p className="mt-1 text-xs font-bold text-slate-500">AI로 예측하고, 함께 지키는 안전한 도로</p>
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
          className="h-9 w-auto object-contain sm:h-10"
          onError={() => setShowImage(false)}
        />
      ) : (
        <span className="text-lg font-black text-slate-700">국토교통부</span>
      )}
    </div>
  )
}

function HeroImageLayer() {
  const [showImage, setShowImage] = useState(true)

  if (!showImage) {
    return null
  }

  return (
    <img
      src="/assets/auth/login-hero.webp"
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover object-center"
      onError={() => setShowImage(false)}
    />
  )
}

function RiskCard() {
  return (
    <div className="absolute bottom-[17%] left-[40%] z-20 hidden w-[214px] rounded-[14px] border border-white/80 bg-white/92 p-5 shadow-[0_22px_48px_rgba(21,76,140,0.18)] backdrop-blur-md sm:block xl:bottom-[18%] xl:left-[41%] xl:w-[220px]">
      <div className="absolute -bottom-6 left-10 h-0 w-0 border-x-[15px] border-t-[24px] border-x-transparent border-t-white/90" />
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white">
          <AlertTriangle size={17} fill="white" strokeWidth={2.4} aria-hidden="true" />
        </span>
        <p className="text-[16px] font-black text-[#07182F]">포트홀 위험 감지</p>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-600">위험도</span>
        <span className="text-[18px] font-black text-red-500">85%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-red-100">
        <div className="h-full w-[85%] rounded-full bg-red-500" />
      </div>
      <div className="mt-5">
        <p className="text-sm font-bold text-slate-600">위치</p>
        <p className="mt-2 text-[14px] font-extrabold leading-relaxed text-slate-700">서울특별시 강남구 역삼로 123</p>
      </div>
    </div>
  )
}

function LoginHeroPanel() {
  return (
    <section className="relative isolate min-h-[560px] overflow-hidden bg-[#eef7ff] px-6 py-7 sm:min-h-[680px] sm:px-10 lg:min-h-svh lg:px-12 lg:py-11 xl:px-14">
      <HeroImageLayer />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(238,247,255,0.72)_0%,rgba(238,247,255,0.32)_46%,rgba(238,247,255,0.02)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#eef7ff]/45 to-transparent" />
      <RiskCard />

      <div className="relative z-30 flex min-h-[506px] flex-col justify-between sm:min-h-[620px] lg:min-h-[calc(100svh-88px)]">
        <div>
          <BrandLogo />
          <div className="mt-10 max-w-[600px] sm:mt-14 lg:mt-[68px]">
            <h2 className="text-[38px] font-black leading-tight text-[#07182F] sm:text-[48px] lg:text-[54px] xl:text-[56px]">
              AI로 예측하고,
              <br />
              함께 지키는 <span className="text-[#096BE8]">안전한 도로</span>
            </h2>
            <p className="mt-6 max-w-[560px] text-[17px] font-semibold leading-[1.7] text-slate-600 sm:text-[19px]">
              AI가 위험을 예측하고 시민과 함께 신속하게 대응하여 모두가 안심하고 이동할 수 있는 도로 환경을
              만듭니다.
            </p>
          </div>
        </div>

        <footer className="mt-12 flex flex-col gap-4 text-slate-500 sm:flex-row sm:items-end sm:gap-8 lg:gap-10">
          <MinistryLogo />
          <p className="text-xs font-semibold leading-relaxed sm:text-[13px]">
            © 2024 Ministry of Land, Infrastructure and Transport.
            <br />
            All rights reserved.
          </p>
        </footer>
      </div>
    </section>
  )
}

function LoginCard() {
  const navigate = useNavigate()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/setup')
  }

  return (
    <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white/96 px-6 pb-7 pt-8 shadow-[0_26px_72px_rgba(15,40,70,0.14)] sm:px-10 sm:pb-8 sm:pt-10 lg:px-12 lg:pb-8 lg:pt-12 xl:px-14">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-blue-100 text-blue-700 sm:h-[70px] sm:w-[70px]">
          <LockKeyhole size={31} strokeWidth={2.1} aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-[30px] font-black text-[#07182F] sm:text-[34px]">로그인</h2>
        <p className="mt-3 text-[15px] font-semibold text-slate-500 sm:text-base">
          포트홀 가드 AI 서비스에 오신 것을 환영합니다.
        </p>
      </div>

      <form className="mt-8" onSubmit={handleSubmit}>
        <label className="relative block" htmlFor="email">
          <span className="sr-only">이메일 주소</span>
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="이메일 주소를 입력하세요"
            className="h-[56px] w-full rounded-lg border border-slate-200 bg-white px-14 text-base font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:h-[58px]"
          />
        </label>

        <label className="relative mt-4 block" htmlFor="password">
          <span className="sr-only">비밀번호</span>
          <LockKeyhole
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            className="h-[56px] w-full rounded-lg border border-slate-200 bg-white px-14 pr-14 text-base font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:h-[58px]"
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-600"
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {isPasswordVisible ? (
              <EyeOff size={24} strokeWidth={1.9} aria-hidden="true" />
            ) : (
              <Eye size={24} strokeWidth={1.9} aria-hidden="true" />
            )}
          </button>
        </label>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-[22px] w-[22px] rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[15px] font-semibold text-slate-700">자동 로그인</span>
          </label>

          <div className="flex items-center gap-4 text-[15px] font-black text-blue-700">
            <button type="button" className="hover:text-blue-500">
              비밀번호 찾기
            </button>
            <span className="h-4 w-px bg-slate-300" />
            <Link to="/auth/signup" className="hover:text-blue-500">
              회원가입
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="mt-7 h-[56px] w-full rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-lg font-black text-white shadow-[0_14px_24px_rgba(0,95,220,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(0,95,220,0.3)] sm:h-[58px]"
        >
          로그인
        </button>
      </form>

      <div className="mt-7 flex items-center gap-5">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[15px] font-bold text-slate-500">또는</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          className="flex h-[54px] w-full items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white text-base font-extrabold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 sm:h-[56px] sm:text-[17px]"
        >
          <span className="text-[30px] font-black text-[#4285F4]" aria-hidden="true">
            G
          </span>
          Google로 로그인
        </button>

        <button
          type="button"
          className="flex h-[54px] w-full items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white text-base font-extrabold text-slate-800 transition hover:border-yellow-200 hover:bg-yellow-50 sm:h-[56px] sm:text-[17px]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEE500]" aria-hidden="true">
            <span className="h-4 w-5 rounded-[50%] bg-[#371D1E]" />
          </span>
          카카오로 로그인
        </button>
      </div>

      <div className="mt-7 flex items-center justify-center gap-2 text-slate-500">
        <ShieldCheck size={21} strokeWidth={1.8} aria-hidden="true" />
        <p className="text-[15px] font-semibold">사용자 정보를 안전하게 보호합니다.</p>
      </div>
    </div>
  )
}

export function LoginPage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-white">
      <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,1.04fr)_minmax(520px,0.96fr)]">
        <LoginHeroPanel />
        <section className="flex min-h-svh items-center justify-center bg-white px-4 py-8 sm:px-8 lg:px-10 lg:py-8">
          <LoginCard />
        </section>
      </div>
    </main>
  )
}
