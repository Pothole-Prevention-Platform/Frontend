import type { AgencyContact } from '../../types'
import { Card } from '../ui/Card'

export function AgencyCard({ agency }: { agency: AgencyContact }) {
  return (
    <Card title={agency.agencyName} description={agency.department}>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-bold text-slate-500">대표 연락처</dt>
          <dd className="mt-1 text-slate-950">{agency.phone}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">주소</dt>
          <dd className="mt-1 text-slate-950">{agency.address}</dd>
        </div>
        <div>
          <dt className="font-bold text-slate-500">처리 안내</dt>
          <dd className="mt-1 leading-6 text-slate-700">{agency.processingGuide}</dd>
        </div>
      </dl>
    </Card>
  )
}
