import { apiJson } from './apiClient'
import type { RiskDistrictRanking, RiskGridResult, RiskMapSummaryResponse } from '../types/risk'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getRecordArray<T extends Record<string, unknown>>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord) as T[]
  }

  if (!isRecord(value)) {
    return []
  }

  const arrayKeys = ['items', 'content', 'list', 'results', 'zones', 'gridResults', 'rankings']

  for (const key of arrayKeys) {
    const nested = value[key]

    if (Array.isArray(nested)) {
      return nested.filter(isRecord) as T[]
    }
  }

  return []
}

export async function getLatestGridRiskResults() {
  const response = await apiJson<unknown>('/api/v1/risk/grid-results/latest')
  return getRecordArray<RiskGridResult>(response)
}

export async function getGridRiskResult(gridCode: string) {
  const response = await apiJson<unknown>(`/api/v1/risk/grid-results/${encodeURIComponent(gridCode)}`)
  return isRecord(response) ? (response as RiskGridResult) : {}
}

function getRiskScore(result: RiskGridResult) {
  return typeof result.riskScore === 'number' && Number.isFinite(result.riskScore) ? result.riskScore : 0
}

export async function getRiskZones(districtName?: string) {
  const searchParams = new URLSearchParams()

  if (districtName?.trim()) {
    searchParams.set('districtName', districtName.trim())
  }

  const queryString = searchParams.toString()
  const response = await apiJson<unknown>(`/api/v1/dashboard/risk/zones${queryString ? `?${queryString}` : ''}`)
  return getRecordArray<RiskGridResult>(response).sort((a, b) => getRiskScore(b) - getRiskScore(a))
}

export async function getRiskMapSummary({
  markerLimit = 40,
  zoneLimit = 8,
}: {
  markerLimit?: number
  zoneLimit?: number
} = {}) {
  const searchParams = new URLSearchParams({
    markerLimit: String(Math.min(100, Math.max(1, Math.trunc(markerLimit)))),
    zoneLimit: String(Math.min(30, Math.max(1, Math.trunc(zoneLimit)))),
  })

  return apiJson<RiskMapSummaryResponse>(`/api/v1/dashboard/risk/map-summary?${searchParams.toString()}`)
}

export async function getDistrictRiskRanking() {
  const response = await apiJson<unknown>('/api/v1/dashboard/risk/district-ranking')
  return getRecordArray<RiskDistrictRanking>(response)
}

export const getRiskDistrictRanking = getDistrictRiskRanking
