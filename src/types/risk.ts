export interface RiskGridResult {
  gridCode?: string
  districtName?: string
  centerLat?: number
  centerLng?: number
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
  potholeScore?: number
  calculatedAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface RiskDistrictRanking {
  districtName?: string
  totalGridCount?: number
  highRiskGridCount?: number
  mediumRiskGridCount?: number
  lowRiskGridCount?: number
  highRiskRatio?: number
  maxRiskScore?: number
  averageRiskScore?: number
  [key: string]: unknown
}

export type RiskZone = RiskGridResult
