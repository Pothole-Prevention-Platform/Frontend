import { useEffect, useRef } from 'react'
import { Landmark, LocateFixed, Minus, Plus } from 'lucide-react'
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk'
import { interactiveKakaoMapOptions } from '../../constants/kakaoMapOptions'

type AgencyMapPosition = {
  lat: number
  lng: number
}

type KakaoAgencyMapProps = {
  addressLabel: string
  agencyName?: string
  detailLabel?: string
  isLoading?: boolean
  onSelectLocation: (position: AgencyMapPosition) => void
  position: AgencyMapPosition
}

function MapMessage({ children }: { children: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 px-5 text-center">
      <p className="text-[14px] font-bold leading-6 text-slate-600">{children}</p>
    </div>
  )
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

export function KakaoAgencyMap({
  addressLabel,
  agencyName,
  detailLabel,
  isLoading = false,
  onSelectLocation,
  position,
}: KakaoAgencyMapProps) {
  const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim()
  const [isMapLoading, mapError] = useKakaoLoader({
    appkey: kakaoKey ?? '',
    libraries: ['services'],
  })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || typeof kakao === 'undefined') {
      return
    }

    mapRef.current.relayout()
    mapRef.current.panTo(new kakao.maps.LatLng(position.lat, position.lng))
  }, [position.lat, position.lng])

  useEffect(() => {
    if (!containerRef.current || !mapRef.current || typeof kakao === 'undefined' || typeof ResizeObserver === 'undefined') {
      return undefined
    }

    const observer = new ResizeObserver(() => {
      if (!mapRef.current) {
        return
      }

      mapRef.current.relayout()
      mapRef.current.setCenter(new kakao.maps.LatLng(position.lat, position.lng))
    })

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [position.lat, position.lng])

  const changeZoomLevel = (delta: number) => {
    const map = mapRef.current

    if (!map) {
      return
    }

    const nextLevel = Math.min(14, Math.max(1, map.getLevel() + delta))
    map.setLevel(nextLevel)
  }

  if (!kakaoKey) {
    return <MapMessage>카카오 지도 키가 설정되지 않아 지도를 표시할 수 없습니다.</MapMessage>
  }

  if (mapError) {
    return <MapMessage>카카오 지도를 불러오지 못했습니다. 도메인 등록과 JavaScript 키를 확인해 주세요.</MapMessage>
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-100">
      <Map
        center={position}
        className="kakao-map-root h-full w-full"
        level={4}
        onClick={(_, mouseEvent) => {
          onSelectLocation({
            lat: mouseEvent.latLng.getLat(),
            lng: mouseEvent.latLng.getLng(),
          })
        }}
        onCreate={(map) => {
          mapRef.current = map
          window.setTimeout(() => {
            map.relayout()
            map.setCenter(new kakao.maps.LatLng(position.lat, position.lng))
          }, 0)
        }}
        {...interactiveKakaoMapOptions}
      >
        <CustomOverlayMap position={position} yAnchor={0.66}>
          <div className="flex flex-col items-center">
            <div className="relative h-[38px] w-[34px] drop-shadow-[0_5px_8px_rgba(0,64,160,0.32)]" aria-hidden="true">
              <span className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 rounded-full bg-[#2586ff] ring-2 ring-white" />
              <span className="absolute left-1/2 top-[25px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-[#2586ff]" />
              <span className="absolute left-1/2 top-[8px] h-4 w-4 -translate-x-1/2 rounded-full bg-white" />
              <span className="absolute left-1/2 top-[12px] h-[6px] w-[9px] -translate-x-1/2 rounded-b-full bg-[#2586ff]" />
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-blue-700 shadow-sm">사고 위치</span>
          </div>
        </CustomOverlayMap>
      </Map>

      <div className="absolute left-4 top-4 max-w-[270px] rounded-xl bg-white/95 p-4 shadow-[0_10px_24px_rgba(15,40,70,0.12)] backdrop-blur">
        <p className="flex items-center gap-1.5 text-[13px] font-black text-blue-700">
          <Landmark size={15} aria-hidden="true" />
          선택 위치
        </p>
        <p className="mt-2 text-[12px] font-black leading-5 text-slate-700">{addressLabel}</p>
        {detailLabel && <p className="mt-1 text-[12px] font-bold leading-5 text-slate-600">{detailLabel}</p>}
        <p className="mt-2 text-[11px] font-bold text-slate-500">
          위도 {formatCoordinate(position.lat)} · 경도 {formatCoordinate(position.lng)}
        </p>
        {agencyName && <p className="mt-2 rounded-lg bg-blue-50 px-2.5 py-2 text-[12px] font-black text-blue-700">{agencyName}</p>}
      </div>

      <div className="absolute right-3 top-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
        <button type="button" aria-label="지도 확대" onClick={() => changeZoomLevel(-1)} className="flex h-10 w-10 items-center justify-center border-b border-slate-200 text-slate-700 transition hover:bg-blue-50">
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" aria-label="지도 축소" onClick={() => changeZoomLevel(1)} className="flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-blue-50">
          <Minus size={18} aria-hidden="true" />
        </button>
      </div>

      {(isMapLoading || isLoading) && (
        <div className="absolute inset-x-4 bottom-4 rounded-xl bg-white/92 px-4 py-3 text-[12px] font-black text-blue-700 shadow-[0_10px_24px_rgba(15,40,70,0.12)] backdrop-blur" aria-live="polite">
          {isMapLoading ? '카카오 지도를 불러오는 중입니다.' : '관할기관 정보를 조회하는 중입니다.'}
        </div>
      )}

      <button
        type="button"
        aria-label="선택 위치로 지도 이동"
        onClick={() => mapRef.current?.panTo(new kakao.maps.LatLng(position.lat, position.lng))}
        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-blue-50"
      >
        <LocateFixed size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
