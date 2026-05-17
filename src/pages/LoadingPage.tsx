import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Cog, LoaderCircle } from 'lucide-react'

const progressSteps = [
  { label: '데이터 동기화', status: '완료', icon: Check, state: 'done' },
  { label: '지도 로딩', status: '진행 중', icon: LoaderCircle, state: 'active' },
  { label: '알림 설정 확인', status: '대기 중', icon: Cog, state: 'waiting' },
] as const

export function LoadingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)

  const isDataDone = progress >= 34
  const isMapDone = progress >= 78
  const isReady = progress >= 100

  useEffect(() => {
    const duration = 2600
    const startedAt = performance.now()
    let animationFrameId = 0

    const animate = (now: number) => {
      const elapsed = now - startedAt
      const nextProgress = Math.min(Math.round((elapsed / duration) * 100), 100)

      setProgress(nextProgress)

      if (nextProgress < 100) {
        animationFrameId = window.requestAnimationFrame(animate)
      } else {
        window.setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 350)
      }
    }

    animationFrameId = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(animationFrameId)
  }, [navigate])

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-white px-4 py-10 text-slate-950">
      <img
        src="/assets/loading/loading-map-left.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-[52%] object-cover object-left opacity-90 contrast-125"
      />
      <img
        src="/assets/loading/loading-map-right.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[52%] object-cover object-right opacity-90 contrast-125"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.84)_36%,rgba(255,255,255,0.58)_62%,rgba(255,255,255,0.72)_100%)]" />

      <section className="relative z-10 flex w-full max-w-[760px] flex-col items-center text-center">
        <img
          src="/assets/loading/pothole-guard-logo.png"
          alt="포트홀 가드 AI"
          className="h-[116px] w-auto object-contain sm:h-[150px]"
        />

        <h1 className="mt-5 text-[24px] font-black tracking-[-0.05em] text-[#07182F] sm:text-[28px]">
          AI로 예측하고, 함께 지키는 안전한 도로
        </h1>

        <div className="mt-9 w-full max-w-[560px] rounded-[20px] border border-slate-200/80 bg-white/90 px-5 py-8 shadow-[0_24px_70px_rgba(20,68,120,0.14)] backdrop-blur-xl sm:px-8">
          <div className="flex items-center justify-center gap-4">
            <LoaderCircle
              className="h-8 w-8 animate-spin text-blue-600"
              strokeWidth={3}
              aria-hidden="true"
            />
            <p className="text-[20px] font-black tracking-[-0.04em] text-slate-900">
              {isReady ? '위험 지도 준비 완료' : '위험 지도를 불러오는 중'}
            </p>
          </div>

          <div
            className="mx-auto mt-8 flex h-[128px] w-[128px] items-center justify-center rounded-full p-3 shadow-[0_12px_28px_rgba(11,109,222,0.18)]"
            style={{
              background: `conic-gradient(#0B6DDE ${progress * 3.6}deg, #dbeafe 0deg)`,
            }}
            role="progressbar"
            aria-label="위험 지도 로딩 진행률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <span className="text-[34px] font-black tracking-[-0.04em] text-slate-900">
                {progress}
                <span className="text-[18px]">%</span>
              </span>
            </div>
          </div>

          <p className="mt-5 text-sm font-bold tracking-[-0.03em] text-slate-500">
            잠시만 기다려주세요. 더 안전한 도로를 준비하고 있어요.
          </p>

          <div className="mt-7 h-px bg-slate-200" />

          <div className="mt-7 grid grid-cols-3 items-start gap-2">
            {progressSteps.map(({ label, status, icon: Icon, state }, index) => {
              const isStepDone = index === 0 ? isDataDone : index === 1 ? isMapDone : isReady
              const isStepActive =
                (index === 0 && !isDataDone) ||
                (index === 1 && isDataDone && !isMapDone) ||
                (index === 2 && isMapDone && !isReady)
              const displayStatus = isStepDone ? '완료' : isStepActive ? '진행 중' : status
              const StepIcon = isStepDone ? Check : isStepActive ? LoaderCircle : Icon

              return (
              <div key={label} className="relative flex flex-col items-center">
                {index > 0 ? (
                  <div className="absolute right-1/2 top-5 h-px w-full border-t border-dashed border-blue-200" />
                ) : null}
                <div
                  className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full ${
                    isStepDone || isStepActive
                      ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)]'
                      : state === 'waiting'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <StepIcon
                    className={isStepActive ? 'h-5 w-5 animate-spin' : 'h-5 w-5'}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-[13px] font-black tracking-[-0.03em] text-slate-800">
                  {label}
                </p>
                <p className="mt-1 text-xs font-bold tracking-[-0.03em] text-slate-500">
                  {displayStatus}
                </p>
              </div>
              )
            })}
          </div>
        </div>

        <footer className="mt-10 flex flex-col items-center gap-4">
          <img
            src="/assets/loading/molit-logo.png"
            alt="국토교통부"
            className="h-10 w-auto object-contain"
          />
          <p className="text-xs font-medium text-slate-500">
            © 2024 Ministry of Land, Infrastructure and Transport. All rights reserved.
          </p>
        </footer>

        <div className="sr-only">
          <Link to="/auth/login" replace>
            로그인으로 이동
          </Link>
        </div>
      </section>
    </main>
  )
}
