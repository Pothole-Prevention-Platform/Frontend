import { BellRing, Volume2 } from 'lucide-react'

export function AlertPreview() {
  return (
    <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
          <Volume2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-200">음성 알림 예시</p>
          <p className="text-lg font-black">전방 50m 포트홀 위험 구간입니다</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <BellRing className="h-4 w-4 text-amber-300" />
          푸시 알림 미리보기
        </div>
        <p className="mt-2 text-sm text-slate-300">강남대로 327 인근 매우 높은 위험 구간 접근 중</p>
      </div>
    </div>
  )
}
