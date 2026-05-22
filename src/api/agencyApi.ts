import { apiJson } from './apiClient'
import type { AgencyInfo } from '../types/agency'

type AgencyLookupInput = {
  lat: number
  lng: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function getAgencyByLocation({ lat, lng }: AgencyLookupInput) {
  const searchParams = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  })
  const response = await apiJson<unknown>(`/api/v1/agencies?${searchParams.toString()}`)

  return isRecord(response) ? (response as AgencyInfo) : {}
}
