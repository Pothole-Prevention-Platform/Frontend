import { Bell, CloudRain, Route, ShieldAlert } from 'lucide-react'
import { AlertPreview } from '../components/feature/AlertPreview'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { RiskBadge } from '../components/ui/RiskBadge'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/ui/StatCard'
import { potholeRiskZones, weatherAlerts } from '../data/mockData'

export function AlertsPage() {
  return (
    <>
      <SectionHeader title="실시간 위험 알림" description="운전자와 배달 라이더가 위험 구간에 접근하기 전에 음성 및 푸시 알림을 받는 데모 화면입니다." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="오늘 위험 요약" value="주의" description="퇴근 시간대 고위험 4곳" icon={<ShieldAlert />} />
        <StatCard title="강우 위험" value="37mm" description="강남권 시간당 강수량" icon={<CloudRain />} />
        <StatCard title="경로 위험도" value="82점" description="예상 경로 내 3개 구간" icon={<Route />} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <AlertPreview />
          <Card title="푸시 알림 설정">
            {['위험 구간 접근 알림', '우천 후 노면 파손 알림', '신고 처리 상태 알림'].map((item) => (
              <label key={item} className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm font-bold">
                <span className="flex items-center gap-2"><Bell className="h-4 w-4 text-amber-600" />{item}</span>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-amber-500" />
              </label>
            ))}
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="기상 위험 카드">
            {weatherAlerts.map((alert) => (
              <div key={alert.id} className="mb-3 rounded-lg bg-amber-50 p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-black text-slate-950">{alert.title}</p>
                  <Badge variant="warning">{alert.rainfallAmount}mm</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{alert.district}</p>
                <p className="mt-2 text-sm font-semibold text-amber-800">{alert.riskMessage}</p>
              </div>
            ))}
          </Card>
          <Card title="고위험 구간 목록">
            {potholeRiskZones.filter((zone) => zone.riskLevel !== 'low').map((zone) => (
              <div key={zone.id} className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <div>
                  <p className="font-bold text-slate-950">{zone.roadName}</p>
                  <p className="text-sm text-slate-500">{zone.district} · {zone.riskScore}점</p>
                </div>
                <RiskBadge riskLevel={zone.riskLevel} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}
