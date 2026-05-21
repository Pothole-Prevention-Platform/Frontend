export type HazardType = 'POTHOLE' | 'CRACK' | 'SUBSIDENCE' | 'FALLING_OBJECT' | 'OTHER'

export type ReporterSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AiSeverity = 'NONE' | 'SMALL' | 'MEDIUM' | 'LARGE'

export type CrackSeverity = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE'

export type PotholeShape = 'IRREGULAR' | 'CIRCULAR' | 'LINEAR' | 'OTHER'

export interface ReportAiResult {
  detected?: boolean | null
  isPothole?: boolean | null
  confidence?: number | null
  severity?: AiSeverity | string | null
  riskScore?: number | null
  estimatedSizeCm?: number | null
  cracks?: CrackSeverity | string | boolean | null
  depthMinCm?: number | null
  depthMaxCm?: number | null
  shape?: PotholeShape | string | null
  bbox?: number[] | null
  processingTimeMs?: number | null
  description?: string | null
  [key: string]: unknown
}

export interface ReportAgencyResult {
  agencyName?: string | null
  departmentName?: string | null
  department?: string | null
  jurisdiction?: string | null
  roadManagementAgency?: string | null
  phone?: string | null
  address?: string | null
  [key: string]: unknown
}

export interface CitizenReportCreateInput {
  image: File
  latitude: number
  longitude: number
  address?: string
  locationDetail?: string
  hazardType?: HazardType
  reporterSeverity?: ReporterSeverity
  description?: string
}

export interface CitizenReportResponse {
  reportId?: string
  imageUrl?: string | null
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  locationDetail?: string | null
  submittedAt?: string | null
  hazardType?: HazardType | string | null
  reporterSeverity?: ReporterSeverity | string | null
  description?: string | null
  isPothole?: boolean | null
  confidence?: number | null
  severity?: AiSeverity | string | null
  riskScore?: number | null
  estimatedSizeCm?: number | null
  cracks?: CrackSeverity | string | null
  depthMinCm?: number | null
  depthMaxCm?: number | null
  shape?: PotholeShape | string | null
  bbox?: number[] | null
  managingAuthority?: string | null

  id?: string
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
