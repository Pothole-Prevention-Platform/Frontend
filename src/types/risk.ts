export interface RiskGridResult {
  id?: number
  gridCode?: string
  districtName?: string
  centerLat?: number
  centerLng?: number
  nx?: number
  ny?: number
  latitude?: number
  longitude?: number
  riskScore?: number
  riskGrade?: string
  riskLevel?: string
  grade?: string
  rainfallScore?: number
  trafficScore?: number
  sewerScore?: number
  excavationScore?: number
  temperatureScore?: number
  potholeScore?: number
  calculatedAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface RiskDistrictRanking {
  districtName?: string
  totalGridCount?: number
  dangerGridCount?: number
  dangerGridRate?: number
  warningGridCount?: number
  warningGridRate?: number
  attentionGridCount?: number
  attentionGridRate?: number
  safeGridCount?: number
  safeGridRate?: number
  highRiskGridCount?: number
  mediumRiskGridCount?: number
  lowRiskGridCount?: number
  highRiskRatio?: number
  maxRiskScore?: number
  avgRiskScore?: number
  averageRiskScore?: number
  latestCalculatedAt?: string
  [key: string]: unknown
}

export type RiskZone = RiskGridResult

export interface RiskMapSummaryStats {
  highRiskCount?: number
  recentReportCount?: number
  latestCalculatedAt?: string | null
  [key: string]: unknown
}

export interface RiskMapSummaryResponse {
  markers?: RiskGridResult[]
  zones?: RiskGridResult[]
  stats?: RiskMapSummaryStats | null
  [key: string]: unknown
}
