import { apiForm, apiJson } from './apiClient'
import type { CitizenReportCreateInput, CitizenReportResponse } from '../types/report'

export function createCitizenReport(input: CitizenReportCreateInput) {
  const formData = new FormData()
  formData.append('image', input.image)
  formData.append('latitude', String(input.latitude))
  formData.append('longitude', String(input.longitude))
  formData.append('hazardType', input.hazardType)

  if (input.severity) {
    formData.append('severity', input.severity)
  }

  if (input.description) {
    formData.append('description', input.description)
  }

  return apiForm<CitizenReportResponse>('/api/citizen/report', formData)
}

export function getCitizenReports(limit = 10) {
  const searchParams = new URLSearchParams({ limit: String(limit) })
  return apiJson<CitizenReportResponse[]>(`/api/citizen/report?${searchParams.toString()}`)
}

export function getCitizenReport(reportId: string) {
  return apiJson<CitizenReportResponse>(`/api/citizen/report/${encodeURIComponent(reportId)}`)
}

export function getReportId(report: Pick<CitizenReportResponse, 'id' | 'reportId'>) {
  return report.reportId ?? report.id ?? ''
}
