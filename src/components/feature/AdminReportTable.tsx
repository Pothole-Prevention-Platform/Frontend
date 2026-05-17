import type { AdminReportRow, ReportStatus } from '../../types'
import { Badge } from '../ui/Badge'
import { RiskBadge } from '../ui/RiskBadge'

const statusLabels: Record<ReportStatus, string> = {
  received: '접수',
  reviewing: '검토 중',
  scheduled: '보수 예정',
  completed: '보수 완료',
}

export function AdminReportTable({ rows }: { rows: AdminReportRow[] }) {
  const sortedRows = [...rows].sort((a, b) => b.priorityScore - a.priorityScore)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black text-slate-500">
            <tr>
              {['도로명', '지역', '위험도', '신고 수', '공감 수', '미처리 기간', '상태', '우선순위 점수'].map((head) => (
                <th key={head} className="px-4 py-3">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-slate-950">{row.roadName}</td>
                <td className="px-4 py-4 text-slate-600">{row.district}</td>
                <td className="px-4 py-4"><RiskBadge riskLevel={row.riskLevel} /></td>
                <td className="px-4 py-4">{row.reportCount}</td>
                <td className="px-4 py-4">{row.empathyCount}</td>
                <td className="px-4 py-4">{row.untreatedDays}일</td>
                <td className="px-4 py-4"><Badge variant={row.status === 'completed' ? 'success' : 'info'}>{statusLabels[row.status]}</Badge></td>
                <td className="px-4 py-4 font-black text-slate-950">{row.priorityScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 lg:hidden">
        {sortedRows.map((row) => (
          <div key={row.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{row.roadName}</p>
                <p className="text-sm text-slate-500">{row.district}</p>
              </div>
              <RiskBadge riskLevel={row.riskLevel} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <span>신고 {row.reportCount}건</span>
              <span>공감 {row.empathyCount}명</span>
              <span>미처리 {row.untreatedDays}일</span>
              <span>우선순위 {row.priorityScore}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
