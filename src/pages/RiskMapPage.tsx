import { CloudRain, MapPinned, MessageSquareWarning, TrendingUp } from 'lucide-react'
import { RiskLegend } from '../components/feature/RiskLegend'
import { RiskMapMock } from '../components/feature/RiskMapMock'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { RiskBadge } from '../components/ui/RiskBadge'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/ui/StatCard'
import { potholeRiskZones } from '../data/mockData'

export function RiskMapPage() {
  const selected = potholeRiskZones[0]

  return (
    <>
      <SectionHeader
        eyebrow="AI Prediction"
        title="AI 위험 예측지도"
        description="강수량, 도로 노후도, 하수관 노후도, 지하 공사 여부와 시민 신고 데이터를 조합한 데모 위험지도입니다."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="오늘 고위험 구간" value="18곳" description="전일 대비 6곳 증가" icon={<MapPinned />} />
        <StatCard title="집중호우 영향 구간" value="7곳" description="강수량 30mm 이상" icon={<CloudRain />} />
        <StatCard title="시민 신고 반영" value="124건" description="최근 24시간 접수" icon={<MessageSquareWarning />} />
        <StatCard title="평균 위험 점수" value="72점" description="관측 구간 평균" icon={<TrendingUp />} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {['강수량', '도로 노후도', '하수관 노후도', '지하 공사 여부'].map((filter) => (
          <Badge key={filter} variant="warning">{filter}</Badge>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <RiskMapMock />
          <RiskLegend />
        </div>
        <div className="space-y-4">
          <Card title="위험 설명 패널" description="선택 구간의 위험도를 설명합니다.">
            <div className="flex items-center justify-between">
              <p className="font-black text-slate-950">{selected.roadName}</p>
              <RiskBadge riskLevel={selected.riskLevel} />
            </div>
            <p className="mt-4 text-5xl font-black text-red-600">{selected.riskScore}점</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {selected.mainReasons.map((reason) => (
                <li key={reason} className="rounded-lg bg-slate-50 p-3">{reason}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              예상 조치: 우천 이후 긴급 현장 확인 및 임시 보수 우선 배정
            </p>
          </Card>
          <Card title="최근 위험 구간">
            <div className="space-y-3">
              {potholeRiskZones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="font-bold text-slate-950">{zone.roadName}</p>
                    <p className="text-sm text-slate-500">{zone.district}</p>
                  </div>
                  <RiskBadge riskLevel={zone.riskLevel} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
