import { apiJson } from './apiClient'
import type { AgencyInfo } from '../types/agency'

type AgencyLookupInput = {
  lat: number
  lng: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getAgencyByLocation(lat: number, lng: number): Promise<AgencyInfo>
export function getAgencyByLocation(input: AgencyLookupInput): Promise<AgencyInfo>
export async function getAgencyByLocation(latOrInput: number | AgencyLookupInput, lng?: number): Promise<AgencyInfo> {
  const coordinates = typeof latOrInput === 'number' ? { lat: latOrInput, lng } : latOrInput

  if (typeof coordinates.lng !== 'number' || !Number.isFinite(coordinates.lat) || !Number.isFinite(coordinates.lng)) {
    throw new Error('관할기관 조회 좌표가 올바르지 않습니다.')
  }

  const searchParams = new URLSearchParams({
    lat: String(coordinates.lat),
    lng: String(coordinates.lng),
  })
  const response = await apiJson<unknown>(`/api/v1/agencies?${searchParams.toString()}`)

  return isRecord(response) ? (response as AgencyInfo) : {}
}
