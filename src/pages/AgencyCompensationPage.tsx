import { Camera, CheckCircle2, FileText, MapPin } from 'lucide-react'
import { AgencyCard } from '../components/feature/AgencyCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { agencyContacts, compensationDrafts } from '../data/mockData'

export function AgencyCompensationPage() {
  const agency = agencyContacts[0]
  const draft = compensationDrafts[0]
  const steps = ['신고 접수', 'AI 검증', '관할 기관 확인', '현장 확인', '보수 처리']

  return (
    <>
      <SectionHeader
        title="관할 기관 연결 및 보상 청구 보조"
        description="신고 위치와 도로 유형을 바탕으로 관할 기관 정보를 확인하고 청구서 초안 작성에 필요한 자료를 정리합니다."
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Card title="신고 위치 요약">
            <div className="flex gap-3">
              <MapPin className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-black text-slate-950">강남대로 327 인근 3차로</p>
                <p className="mt-1 text-sm text-slate-500">서울 서초구 서초동 1327-7</p>
              </div>
            </div>
          </Card>
          <Card title="도로 유형">
            <div className="grid grid-cols-2 gap-3">
              {['국도', '지방도', '시도', '구도'].map((type) => (
                <div key={type} className={`rounded-lg border p-4 text-center font-black ${type === '시도' ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-200'}`}>
                  {type}
                </div>
              ))}
            </div>
          </Card>
          <AgencyCard agency={agency} />
        </div>
        <div className="space-y-4">
          <Card title="처리 타임라인">
            <div className="grid gap-3 sm:grid-cols-5">
              {steps.map((step, index) => (
                <div key={step} className="rounded-lg bg-slate-50 p-3 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{index + 1}</div>
                  <p className="mt-2 text-sm font-bold text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="보상 청구 보조" description="법률 자문이나 보상 확정이 아닌, 제출 자료 정리를 돕는 청구서 초안 생성 기능입니다.">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: '피해 사진', value: `${draft.attachedEvidenceCount}개 첨부`, icon: Camera },
                { label: '위치', value: draft.location, icon: MapPin },
                { label: '시간', value: draft.occurredAt, icon: CheckCircle2 },
                { label: '차량 피해 내용', value: draft.damageType, icon: FileText },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-slate-200 p-4">
                  <Icon className="h-5 w-5 text-amber-600" />
                  <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
                  <p className="mt-1 font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
              <Badge variant="info">{draft.draftStatus}</Badge>
              <Button type="button">청구서 초안 생성</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
