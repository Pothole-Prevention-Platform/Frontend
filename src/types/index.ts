export type UserRole = 'rider' | 'driver' | 'victim' | 'admin'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type RoadType = 'national' | 'provincial' | 'city' | 'district'

export type ReportStatus = 'received' | 'reviewing' | 'scheduled' | 'completed'

export interface PotholeRiskZone {
  id: string
  roadName: string
  district: string
  riskLevel: RiskLevel
  riskScore: number
  lat: number
  lng: number
  mainReasons: string[]
  rainfallScore: number
  roadAgeScore: number
  sewerAgingScore: number
  undergroundConstructionScore: number
}

export interface CitizenReport {
  id: string
  location: string
  roadName: string
  reportedAt: string
  aiConfidence: number
  empathyCount: number
  status: ReportStatus
}

export interface AgencyContact {
  id: string
  roadType: RoadType
  agencyName: string
  department: string
  phone: string
  address: string
  processingGuide: string
}

export interface CompensationDraft {
  id: string
  damageType: string
  location: string
  occurredAt: string
  attachedEvidenceCount: number
  draftStatus: string
}

export interface WeatherAlert {
  id: string
  title: string
  district: string
  rainfallAmount: number
  riskMessage: string
  issuedAt: string
}

export interface AdminReportRow {
  id: string
  roadName: string
  district: string
  riskLevel: RiskLevel
  reportCount: number
  empathyCount: number
  untreatedDays: number
  status: ReportStatus
  priorityScore: number
}
