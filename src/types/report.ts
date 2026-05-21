export interface ReportAiResult {
  detected?: boolean
  confidence?: number
  severity?: string
  estimatedSizeCm?: number
  cracks?: boolean | string
  depthMinCm?: number
  depthMaxCm?: number
  shape?: string
  processingTimeMs?: number
  description?: string
  [key: string]: unknown
}

export interface ReportAgencyResult {
  agencyName?: string
  departmentName?: string
  department?: string
  jurisdiction?: string
  roadManagementAgency?: string
  phone?: string
  address?: string
  [key: string]: unknown
}

export interface CitizenReportCreateInput {
  image: File
  latitude: number
  longitude: number
  hazardType: string
  severity?: string
  description?: string
}

export interface CitizenReportResponse {
  id?: string
  reportId?: string
  imageUrl?: string
  latitude?: number
  longitude?: number
  hazardType?: string
  severity?: string
  description?: string
  address?: string
  location?: string
  createdAt?: string
  reportedAt?: string
  aiResult?: ReportAiResult
  ai?: ReportAiResult
  aiReview?: ReportAiResult
  analysis?: ReportAiResult
  jurisdictionResult?: ReportAgencyResult
  agencyResult?: ReportAgencyResult
  agency?: ReportAgencyResult
  responsibleAgency?: ReportAgencyResult
  [key: string]: unknown
}
