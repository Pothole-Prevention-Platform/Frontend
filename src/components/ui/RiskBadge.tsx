import type { RiskLevel } from '../../types'
import { Badge } from './Badge'

const riskMap: Record<RiskLevel, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  low: { label: '낮음', variant: 'success' },
  medium: { label: '보통', variant: 'warning' },
  high: { label: '높음', variant: 'warning' },
  critical: { label: '매우 높음', variant: 'danger' },
}

export function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  const risk = riskMap[riskLevel]
  return <Badge variant={risk.variant}>위험도 {risk.label}</Badge>
}
