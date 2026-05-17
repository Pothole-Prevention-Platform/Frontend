import { AlertTriangle, CalendarClock, ClipboardList, TimerReset } from 'lucide-react'
import { AdminReportTable } from '../components/feature/AdminReportTable'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/ui/StatCard'
import { adminReportRows } from '../data/mockData'

export function AdminDashboardPage() {
  return (
    <>
      <SectionHeader title="지자체 B2B 대시보드" description="도로 유지관리 담당자가 신고, 위험도, 미처리 기간을 기준으로 보수 우선순위를 확인하는 데모 화면입니다." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="총 신고 수" value="62건" description="최근 7일 누적" icon={<ClipboardList />} />
        <StatCard title="매우 높은 위험 구간" value="5곳" description="긴급 점검 권장" icon={<AlertTriangle />} />
        <StatCard title="미처리 건수" value="28건" description="접수 및 검토 중" icon={<TimerReset />} />
        <StatCard title="평균 처리일" value="4.6일" description="완료 건 기준" icon={<CalendarClock />} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card title="보수 우선순위 추천" description="신고 수, 공감 수, 위험도, 미처리 기간을 조합한 데모 점수입니다.">
          <p className="text-3xl font-black text-red-600">강남대로 327</p>
          <p className="mt-2 text-sm text-slate-600">매우 높은 위험도와 반복 신고가 겹쳐 긴급 현장 확인을 추천합니다.</p>
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div className="h-3 w-[96%] rounded-full bg-red-500" />
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          {['위험등급별 신고 현황', '처리 상태 분포', '최근 7일 신고 추이'].map((title, index) => (
            <Card key={title} title={title}>
              <div className="flex h-40 items-end gap-2">
                {[42, 68, 55, 88, 74, 92, 61].map((height, barIndex) => (
                  <div
                    key={`${title}-${barIndex}`}
                    className={`flex-1 rounded-t-md ${index === 0 ? 'bg-red-400' : index === 1 ? 'bg-amber-400' : 'bg-slate-700'}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <AdminReportTable rows={adminReportRows} />
      </div>
    </>
  )
}
