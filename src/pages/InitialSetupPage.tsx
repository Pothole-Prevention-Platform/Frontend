import { Bell, Bike, Car, Shield, UserRound } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeader } from '../components/ui/SectionHeader'
import { cn } from '../utils/cn'

const roles = [
  { label: '배달 라이더', icon: Bike, description: '잦은 이동 경로의 위험 알림 중심' },
  { label: '일반 운전자', icon: Car, description: '출퇴근 도로 위험 예측 중심' },
  { label: '피해 차주', icon: UserRound, description: '신고와 청구서 초안 작성 중심' },
  { label: '지자체 담당자', icon: Shield, description: '관할 접수와 보수 우선순위 중심' },
]

export function InitialSetupPage() {
  return (
    <main className="min-h-svh bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          eyebrow="초기 설정"
          title="초기 설정"
          description="사용 목적에 맞게 화면과 알림을 맞춤 설정합니다."
          action={<ButtonLink to="/risk-map">서비스 시작하기</ButtonLink>}
        />
        <Card className="p-6">
          <h2 className="text-xl font-black text-slate-950">사용자 역할 선택</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {roles.map(({ label, icon: Icon, description }, index) => (
              <button
                type="button"
                key={label}
                className={cn(
                  'rounded-xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                  index === 0 ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200' : 'border-slate-200 bg-white',
                )}
              >
                <Icon className="h-7 w-7 text-slate-950" />
                <p className="mt-4 text-lg font-black text-slate-950">{label}</p>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              지역 선택
              <select className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3">
                {['서울특별시', '부산광역시', '대전광역시', '광주광역시', '경기도'].map((region) => (
                  <option key={region}>{region}</option>
                ))}
              </select>
            </label>
            <div>
              <p className="text-sm font-bold text-slate-700">알림 설정</p>
              <div className="mt-2 grid gap-2">
                {['위험 구간 접근 알림', '집중호우 위험 알림', '신고 처리 상태 알림'].map((item) => (
                  <label key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-amber-500" />
                    <Bell className="h-4 w-4 text-amber-600" />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
