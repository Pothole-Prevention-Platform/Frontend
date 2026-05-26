import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, ChevronRight, LocateFixed, MapPin, ShieldCheck, Siren } from 'lucide-react'
import { Circle, CustomOverlayMap, Map, Polyline, ZoomControl, useKakaoLoader } from 'react-kakao-maps-sdk'
import { getDrivingRoute } from '../../api/routeApi'
import { interactiveKakaoMapOptions } from '../../constants/kakaoMapOptions'
import type { AlertRiskLevel, RoutePreview } from '../../types'
import { cn } from '../../utils/cn'

type AlertRouteMapAlert = {
  badgeLabel: string
  centerLat?: number
  centerLng?: number
  direction: string
  distanceMeters: number
  id: string
  location: string
  riskLevel: AlertRiskLevel
  title: string
}

type KakaoAlertRouteMapProps = {
  alert: AlertRouteMapAlert
  isRerouted: boolean
  onDetailRoute: () => void
  preview: RoutePreview
}

type LatLng = {
  lat: number
  lng: number
}

type MarkerTone = 'blue' | 'green' | 'orange' | 'red' | 'yellow'

const DEFAULT_DANGER_POSITION = {
  lat: 37.5037,
  lng: 127.0246,
}

const markerClasses: Record<MarkerTone, string> = {
  blue: 'bg-blue-600 text-white shadow-blue-500/35',
  green: 'bg-green-500 text-white shadow-green-500/35',
  orange: 'bg-orange-500 text-white shadow-orange-500/35',
  red: 'bg-red-600 text-white shadow-red-500/35',
  yellow: 'bg-yellow-400 text-slate-950 shadow-yellow-400/35',
}

const riskToneByLevel: Record<AlertRiskLevel, MarkerTone> = {
  danger: 'red',
  caution: 'orange',
  attention: 'yellow',
  safe: 'green',
}

function getAlertPosition(alert: AlertRouteMapAlert): LatLng {
  const lat = alert.centerLat
  const lng = alert.centerLng

  if (typeof lat === 'number' && Number.isFinite(lat) && typeof lng === 'number' && Number.isFinite(lng)) {
    return {
      lat,
      lng,
    }
  }

  return DEFAULT_DANGER_POSITION
}

function offsetPosition(position: LatLng, latOffset: number, lngOffset: number): LatLng {
  return {
    lat: position.lat + latOffset,
    lng: position.lng + lngOffset,
  }
}

function buildRoute(alert: AlertRouteMapAlert, isRerouted: boolean) {
  const danger = getAlertPosition(alert)
  const start = offsetPosition(danger, -0.0062, -0.0115)
  const destination = offsetPosition(danger, 0.0064, 0.014)
  const caution = offsetPosition(danger, -0.0015, 0.0062)

  if (isRerouted || alert.riskLevel === 'safe') {
    return {
      caution,
      danger,
      destination,
      path: [
        start,
        offsetPosition(danger, -0.0053, -0.0046),
        offsetPosition(danger, 0.0067, -0.0005),
        offsetPosition(danger, 0.0082, 0.008),
        destination,
      ],
      start,
    }
  }

  return {
    caution,
    danger,
    destination,
    path: [
      start,
      offsetPosition(danger, -0.0035, -0.005),
      danger,
      caution,
      offsetPosition(danger, 0.0025, 0.0105),
      destination,
    ],
    start,
  }
}

function RouteMarker({
  label,
  position,
  tone,
  type,
}: {
  label: string
  position: LatLng
  tone: MarkerTone
  type: 'start' | 'danger' | 'caution' | 'destination' | 'safe'
}) {
  return (
    <CustomOverlayMap clickable position={position} yAnchor={1} zIndex={type === 'danger' ? 30 : 20}>
      <div className="flex -translate-y-1 flex-col items-center">
        {type === 'danger' && (
          <>
            <span className="absolute top-1/2 h-[62px] w-[62px] -translate-y-1/2 rounded-full bg-red-500/20" aria-hidden="true" />
            <span className="absolute top-1/2 h-[42px] w-[42px] -translate-y-1/2 rounded-full bg-red-500/30" aria-hidden="true" />
          </>
        )}
        <span
          className={cn(
            'relative flex h-9 min-w-9 items-center justify-center rounded-full border-[3px] border-white px-2 text-[11px] font-black shadow-xl',
            type === 'danger' && 'h-12 min-w-12 text-[13px]',
            markerClasses[tone],
          )}
        >
          {type === 'start' && <MapPin size={17} fill="currentColor" aria-hidden="true" />}
          {type === 'destination' && <ShieldCheck size={17} aria-hidden="true" />}
          {type === 'safe' && <CheckCircle2 size={18} aria-hidden="true" />}
          {type === 'danger' && <Siren size={20} fill="currentColor" aria-hidden="true" />}
          {type === 'caution' && label}
        </span>
        <span className="mt-1 max-w-[92px] truncate rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-slate-700 shadow-sm">
          {label}
        </span>
      </div>
    </CustomOverlayMap>
  )
}

export function KakaoAlertRouteMap({
  alert,
  isRerouted,
  onDetailRoute,
  preview,
}: KakaoAlertRouteMapProps) {
  const kakaoJavaScriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim() ?? ''
  const [isLoading, error] = useKakaoLoader({
    appkey: kakaoJavaScriptKey,
  })
  const route = useMemo(() => buildRoute(alert, isRerouted), [alert, isRerouted])
  const [roadPath, setRoadPath] = useState<LatLng[]>(route.path)
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const isSafeRoute = alert.riskLevel === 'safe'
  const riskTone = riskToneByLevel[alert.riskLevel]

  useEffect(() => {
    let isActive = true

    setRoadPath(route.path)
    setIsRouteLoading(true)

    void getDrivingRoute({
      destination: route.destination,
      origin: route.start,
      // Keep alert markers visual-only. Off-road waypoint snapping can make the road route loop around itself.
      waypoints: [],
    })
      .then((drivingRoute) => {
        if (!isActive) {
          return
        }

        setRoadPath(drivingRoute.path.length >= 2 ? drivingRoute.path : route.path)
      })
      .catch(() => {
        if (isActive) {
          setRoadPath(route.path)
        }
      })
      .finally(() => {
        if (isActive) {
          setIsRouteLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [route])

  if (!kakaoJavaScriptKey) {
    return (
      <section className="relative mt-4 flex h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-center shadow-[0_16px_40px_rgba(15,40,70,0.08)] sm:h-[270px]">
        <p className="text-[14px] font-bold leading-6 text-slate-600">카카오 지도 키가 설정되지 않아 지도를 표시할 수 없습니다.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="relative mt-4 flex h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-center shadow-[0_16px_40px_rgba(15,40,70,0.08)] sm:h-[270px]">
        <p className="text-[14px] font-bold leading-6 text-slate-600">카카오 지도를 불러오지 못했습니다. 도메인 등록과 JavaScript 키를 확인해 주세요.</p>
      </section>
    )
  }

  return (
    <section className="relative mt-4 h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_16px_40px_rgba(15,40,70,0.08)] sm:h-[270px] lg:h-[270px]">
      <Map
        center={route.danger}
        className="kakao-map-root h-full w-full"
        isPanto
        level={5}
        onCreate={(map) => {
          mapRef.current = map
        }}
        style={{ height: '100%', width: '100%' }}
        {...interactiveKakaoMapOptions}
      >
        <Polyline
          endArrow
          path={roadPath}
          strokeColor={isRerouted || isSafeRoute ? '#16A34A' : '#2487EB'}
          strokeOpacity={0.9}
          strokeWeight={7}
          zIndex={12}
        />
        {!isRerouted && !isSafeRoute && (
          <Circle
            center={route.danger}
            fillColor="#EF4444"
            fillOpacity={0.18}
            radius={170}
            strokeColor="#DC2626"
            strokeOpacity={0.35}
            strokeWeight={2}
            zIndex={10}
          />
        )}
        <RouteMarker label="출발" position={route.start} tone="green" type="start" />
        {!isSafeRoute && (
          <RouteMarker
            label={alert.badgeLabel}
            position={route.danger}
            tone={isRerouted ? 'green' : riskTone}
            type={isRerouted ? 'safe' : 'danger'}
          />
        )}
        {!isRerouted && !isSafeRoute && <RouteMarker label="주의" position={route.caution} tone="orange" type="caution" />}
        <RouteMarker label="도착" position={route.destination} tone="green" type="destination" />
        <ZoomControl position="RIGHT" />
      </Map>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/5" />

      {isLoading && (
        <div className="absolute right-4 top-4 z-20 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] font-bold text-blue-700 shadow-sm">
          카카오 지도를 불러오는 중입니다.
        </div>
      )}

      {!isLoading && isRouteLoading && (
        <div className="absolute right-4 top-4 z-20 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] font-bold text-blue-700 shadow-sm">
          실제 도로 경로를 계산하는 중입니다.
        </div>
      )}

      <div className="absolute left-3 top-3 z-20 w-[126px] rounded-xl bg-white/95 p-3 shadow-[0_14px_32px_rgba(15,40,70,0.15)] backdrop-blur sm:left-5 sm:top-5 sm:w-[138px]">
        <span className={cn('mb-2 inline-flex rounded-full px-2 py-1 text-[11px] font-black', isRerouted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
          {isRerouted ? '우회 경로' : '기본 경로'}
        </span>
        <p className="text-[12px] font-black text-slate-500 sm:text-[13px]">예상 도착</p>
        <p className="mt-1 text-[24px] font-black leading-none text-blue-700">{preview.estimatedArrival}</p>
        <p className="mt-3 text-[12px] font-black text-slate-500 sm:text-[13px]">남은 거리</p>
        <p className="mt-1 text-[20px] font-black text-[#07182F]">{preview.remainingDistance}</p>
        <div className="my-3 h-px bg-slate-200" />
        <button
          type="button"
          onClick={onDetailRoute}
          className="flex items-center gap-0.5 whitespace-nowrap text-[12px] font-black text-blue-700 transition hover:text-blue-500 sm:text-[13px]"
        >
          상세 경로 보기
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => mapRef.current?.panTo(new kakao.maps.LatLng(route.danger.lat, route.danger.lng))}
        aria-label="현재 위험 지점 보기"
        className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-blue-50"
      >
        <LocateFixed size={20} aria-hidden="true" />
      </button>
    </section>
  )
}
