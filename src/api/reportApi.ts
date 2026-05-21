import { apiForm, apiJson } from './apiClient'
import type { CitizenReportCreateInput, CitizenReportResponse } from '../types/report'

export const REPORT_IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const SEOUL_FALLBACK_COORDINATES = {
  latitude: 37.5665,
  longitude: 126.978,
} as const

function assertReportFile(file: File) {
  if (file.size > REPORT_IMAGE_MAX_BYTES) {
    throw new Error('이미지는 10MB 이하만 업로드할 수 있습니다.')
  }
}

function assertSeoulCoordinates(latitude: number, longitude: number) {
  if (latitude < 37 || latitude > 38 || longitude < 126 || longitude > 128) {
    throw new Error('신고 위치는 서울 지역 범위 안에서만 접수할 수 있습니다.')
  }
}

function appendOptionalString(formData: FormData, key: string, value: string | undefined) {
  if (value?.trim()) {
    formData.append(key, value.trim())
  }
}

export function createCitizenReport(input: CitizenReportCreateInput) {
  assertReportFile(input.image)
  assertSeoulCoordinates(input.latitude, input.longitude)

  const formData = new FormData()
  formData.append('image', input.image)
  formData.append('latitude', String(input.latitude))
  formData.append('longitude', String(input.longitude))
  appendOptionalString(formData, 'address', input.address)
  appendOptionalString(formData, 'locationDetail', input.locationDetail)
  appendOptionalString(formData, 'hazardType', input.hazardType)
  appendOptionalString(formData, 'reporterSeverity', input.reporterSeverity)
  appendOptionalString(formData, 'description', input.description)

  return apiForm<CitizenReportResponse>('/api/citizen/report', formData)
}

export function getCitizenReports(limit = 10) {
  const normalizedLimit = Math.min(50, Math.max(1, Math.trunc(limit)))
  const searchParams = new URLSearchParams({ limit: String(normalizedLimit) })
  return apiJson<CitizenReportResponse[]>(`/api/citizen/report?${searchParams.toString()}`)
}

export function getCitizenReport(reportId: string) {
  return apiJson<CitizenReportResponse>(`/api/citizen/report/${encodeURIComponent(reportId)}`)
}

export function getReportId(report: Pick<CitizenReportResponse, 'id' | 'reportId'>) {
  return report.reportId ?? report.id ?? ''
}
