import { FileText, ShieldCheck, Siren, Waypoints } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
  title: string
}

const authFeatures = [
  ['AI 위험 예측', ShieldCheck],
  ['시민 신고', Siren],
  ['관할 기관 연결', Waypoints],
  ['보상 청구 보조', FileText],
] as const

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <main className="grid min-h-svh bg-slate-100 lg:grid-cols-[1fr_560px]">
      <section className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div>
          <p className="text-sm font-black text-amber-400">POTHOLE AI</p>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-tight">{title}</h1>
          <p className="mt-5 max-w-lg text-slate-300">
            포트홀 위험 예측부터 신고 검증, 관할 기관 연결까지 한 화면에서 확인하는 공공 안전
            데모입니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {authFeatures.map(([label, Icon]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <Icon className="h-6 w-6 text-amber-300" aria-hidden="true" />
              <p className="mt-3 font-bold">{label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}
