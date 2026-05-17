import { ArrowRight, MapPinned } from 'lucide-react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { ButtonLink } from '../components/ui/Button'

export function LoadingPage() {
  return (
    <PublicLayout>
      <section className="relative flex min-h-svh items-center px-5 py-12">
        <div className="absolute inset-0 opacity-40 map-grid" />
        <div className="absolute bottom-0 left-1/2 h-80 w-[780px] -translate-x-1/2 rounded-t-full bg-slate-900" />
        <div className="absolute bottom-16 left-1/2 h-56 w-28 -translate-x-1/2 skew-x-[-10deg] rounded-t-3xl bg-slate-800">
          <div className="lane-mark absolute left-1/2 top-8 h-44 w-1 -translate-x-1/2 rotate-90" />
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-black text-amber-300">POTHOLE AI</p>
            <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              AI 포트홀 위험 예측 및 신고 플랫폼
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              위험 예측부터 시민 신고, 관할 기관 연결, 보상 청구 보조까지 한 번에
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/onboarding" size="lg" className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                시작하기 <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink to="/risk-map" size="lg" variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                위험지도 바로 보기
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-bold text-red-200">위험 분석 중</span>
              <MapPinned className="h-7 w-7 text-amber-300" />
            </div>
            <div className="mt-8 space-y-4">
              {['공공 데이터 수집', '강수량·노후도 가중치 계산', '시민 신고 위험도 반영'].map((label, index) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span>{82 + index * 5}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: `${82 + index * 5}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-slate-950/80 p-5">
              <div className="h-36 rounded-xl border border-amber-300/20 bg-[radial-gradient(circle_at_35%_45%,rgba(239,68,68,0.6),transparent_18%),radial-gradient(circle_at_72%_55%,rgba(251,191,36,0.45),transparent_16%)]" />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
