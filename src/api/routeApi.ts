import { apiJson } from './apiClient'

export type RouteCoordinate = {
  lat: number
  lng: number
}

export type DrivingRouteRequest = {
  destination: RouteCoordinate
  origin: RouteCoordinate
  waypoints?: RouteCoordinate[]
}

export type DrivingRouteResponse = {
  distanceMeters?: number
  durationSeconds?: number
  path: RouteCoordinate[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCoordinate(value: unknown): value is RouteCoordinate {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.lat === 'number' && Number.isFinite(value.lat) && typeof value.lng === 'number' && Number.isFinite(value.lng)
}

function normalizeDrivingRoute(value: unknown): DrivingRouteResponse {
  if (!isRecord(value)) {
    return { path: [] }
  }

  const path = Array.isArray(value.path) ? value.path.filter(isCoordinate) : []
  const distanceMeters = typeof value.distanceMeters === 'number' && Number.isFinite(value.distanceMeters) ? value.distanceMeters : undefined
  const durationSeconds = typeof value.durationSeconds === 'number' && Number.isFinite(value.durationSeconds) ? value.durationSeconds : undefined

  return {
    distanceMeters,
    durationSeconds,
    path,
  }
}

export async function getDrivingRoute(request: DrivingRouteRequest) {
  const response = await apiJson<unknown>('/api/v1/routes/directions', {
    body: request,
    method: 'POST',
  })

  return normalizeDrivingRoute(response)
}
