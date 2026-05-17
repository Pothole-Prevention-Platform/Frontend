import { CheckCircle2, Droplets, Moon, Ruler, SplitSquareHorizontal } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'

export function AiReviewPage() {
  const detections = [
    ['파손 깊이 추정', '약 7cm', Ruler],
    ['도로면 균열 여부', '균열 감지', SplitSquareHorizontal],
    ['물 고임 여부', '부분 물 고임', Droplets],
    ['야간/우천 인식 난이도', '보통', Moon],
  ] as const

  return (
    <>
      <SectionHeader title="AI 사진 판별 결과" description="AI 판별 결과는 신고 검증 보조 자료이며, 최종 현장 확인은 담당 기관이 수행합니다." />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex min-h-80 items-center justify-center rounded-xl bg-slate-900 text-center text-white">
            <div>
              <div className="mx-auto h-28 w-36 rounded-[50%] border-8 border-slate-700 bg-slate-800 shadow-inner" />
              <p className="mt-5 font-bold">업로드 이미지 미리보기</p>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">AI confidence score</p>
                <p className="mt-2 text-5xl font-black text-slate-950">87%</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-black text-red-700">
                <CheckCircle2 className="h-4 w-4" />
                포트홀 가능성 높음
              </span>
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {detections.map(([label, value, Icon]) => (
              <Card key={label}>
                <Icon className="h-6 w-6 text-amber-600" />
                <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
              </Card>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/risk-map" className="flex-1">지도에 신고 반영하기</ButtonLink>
            <ButtonLink to="/agency" variant="secondary" className="flex-1">관할 기관 확인하기</ButtonLink>
          </div>
        </div>
      </div>
    </>
  )
}
