import { Clock, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ReportUploadBox } from '../components/feature/ReportUploadBox'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'

export function CitizenReportPage() {
  return (
    <>
      <SectionHeader title="시민 포트홀 신고" description="사진과 위치를 기반으로 신고를 작성하고 AI 판별 단계로 넘기는 데모 화면입니다." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ReportUploadBox />
        <div className="grid gap-4">
          <Card>
            <div className="flex gap-3">
              <MapPin className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-black text-slate-950">현재 위치 예시</p>
                <p className="mt-1 text-sm text-slate-600">서울 서초구 서초동 1327-7</p>
                <p className="text-sm font-bold text-slate-950">강남대로 327</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex gap-3">
              <Clock className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-black text-slate-950">현재 시간</p>
                <p className="mt-1 text-sm text-slate-600">2026-05-17 09:42</p>
              </div>
            </div>
          </Card>
          <label className="block text-sm font-bold text-slate-700">
            상세 설명
            <textarea className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-3" placeholder="차로 위치, 파손 크기, 위험 상황을 입력하세요." />
          </label>
          <Card className="bg-slate-950 text-white">
            <div className="flex gap-3">
              <Sparkles className="h-6 w-6 text-amber-300" />
              <p className="text-sm leading-6 text-slate-200">업로드된 사진은 AI가 포트홀 가능성을 먼저 판별합니다.</p>
            </div>
          </Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" className="flex-1">신고 제출</Button>
            <Link to="/report/ai-review" className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold">AI 판별 결과 확인하기</Link>
          </div>
        </div>
      </div>
    </>
  )
}
