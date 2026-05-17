import { Inbox, MapPin } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { RiskBadge } from '../components/ui/RiskBadge'
import { SectionHeader } from '../components/ui/SectionHeader'
import { StatCard } from '../components/ui/StatCard'

export function ComponentPreviewPage() {
  return (
    <>
      <SectionHeader title="컴포넌트 미리보기" description="디자인 시스템 요소를 빠르게 확인하는 개발용 화면입니다." />
      <div className="grid gap-6">
        <Card title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <ButtonLink to="/risk-map">Link Button</ButtonLink>
          </div>
        </Card>
        <Card title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge>Neutral</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </Card>
        <Card title="RiskBadge">
          <div className="flex flex-wrap gap-3">
            <RiskBadge riskLevel="low" />
            <RiskBadge riskLevel="medium" />
            <RiskBadge riskLevel="high" />
            <RiskBadge riskLevel="critical" />
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="데모 지표" value="87%" description="AI 판별 신뢰도" icon={<MapPin />} />
          <StatCard title="신고 수" value="124건" description="오늘 접수된 신고" />
          <StatCard title="처리율" value="72%" description="보수 완료 기준" trend="+8% 개선" />
        </div>
        <EmptyState icon={<Inbox />} title="데이터가 없습니다" description="필터 조건을 조정하거나 새 신고가 접수되면 이 영역에 표시됩니다." action={<Button>새로고침</Button>} />
      </div>
    </>
  )
}
