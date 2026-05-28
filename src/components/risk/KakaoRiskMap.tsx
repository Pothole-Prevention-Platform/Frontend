import { useEffect, useMemo, useState } from 'react'
import { CustomOverlayMap, Map, Rectangle, useKakaoLoader } from 'react-kakao-maps-sdk'
import { X } from 'lucide-react'
import { interactiveKakaoMapOptions } from '../../constants/kakaoMapOptions'
import type { RiskGridResult } from '../../types/risk'
import { cn } from '../../utils/cn'

type KakaoRiskMapProps = {
  activeGridCode?: string
  gridResults: RiskGridResult[]
  isGridDetailLoading: boolean
  onClearSelectedGrid: () => void
  onSelectGrid: (result: RiskGridResult) => void
  selectedGrid: RiskGridResult | null
}

type RiskMarkerTone = 'red' | 'orange' | 'yellow' | 'green' | 'gray'

type RiskMarker = {
  bounds: {
    ne: LatLng
    sw: LatLng
  }
  gridCode?: string
  id: string
  label: string
  result: RiskGridResult
  riskLevelLabel: string
  riskScore?: number
  tone: RiskMarkerTone
  position: {
    lat: number
    lng: number
  }
}

type LatLng = {
  lat: number
  lng: number
}

const INITIAL_MAP_CENTER = {
  lat: 37.5509,
  lng: 126.8495,
}

const MAX_VISIBLE_MARKERS = 40
const FALLBACK_VISIBLE_MARKERS = 20
const GRID_HALF_SIZE_METERS = 250
const METERS_PER_LATITUDE_DEGREE = 111_320
const MIN_PRIORITY_RISK_SCORE = 20

const riskToneClasses: Record<RiskMarkerTone, string> = {
  red: 'bg-red-600 text-white shadow-red-500/35',
  orange: 'bg-orange-500 text-white shadow-orange-500/35',
  yellow: 'bg-yellow-500 text-slate-950 shadow-yellow-500/35',
  green: 'bg-green-500 text-white shadow-green-500/35',
  gray: 'bg-slate-500 text-white shadow-slate-500/30',
}

const riskAreaStyles: Record<RiskMarkerTone, { fillColor: string; strokeColor: string }> = {
  red: { fillColor: '#EF4444', strokeColor: '#DC2626' },
  orange: { fillColor: '#F97316', strokeColor: '#EA580C' },
  yellow: { fillColor: '#EAB308', strokeColor: '#CA8A04' },
  green: { fillColor: '#22C55E', strokeColor: '#16A34A' },
  gray: { fillColor: '#64748B', strokeColor: '#475569' },
}

const riskLabelByTone: Record<RiskMarkerTone, string> = {
  red: '위험',
  orange: '주의',
  yellow: '관심',
  green: '안전',
  gray: '미확인',
}

const riskLegendItems: { label: string; range: string; tone: RiskMarkerTone }[] = [
  { label: '안전', range: '0~20%', tone: 'green' },
  { label: '관심', range: '20~40%', tone: 'yellow' },
  { label: '주의', range: '40~70%', tone: 'orange' },
  { label: '위험', range: '70% 이상', tone: 'red' },
  { label: '미확인', range: '데이터 없음', tone: 'gray' },
]

function getNumberField(result: RiskGridResult, keys: string[]) {
  for (const key of keys) {
    const value = result[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

function getStringField(result: RiskGridResult, keys: string[]) {
  for (const key of keys) {
    const value = result[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

function getGridCenter(result: RiskGridResult) {
  const centerLat = getNumberField(result, ['centerLat', 'latitude', 'lat'])
  const centerLng = getNumberField(result, ['centerLng', 'longitude', 'lng'])

  return centerLat !== undefined && centerLng !== undefined ? { lat: centerLat, lng: centerLng } : undefined
}

function getGridBounds(center: LatLng) {
  const latDelta = GRID_HALF_SIZE_METERS / METERS_PER_LATITUDE_DEGREE
  const lngMetersPerDegree = METERS_PER_LATITUDE_DEGREE * Math.cos((center.lat * Math.PI) / 180)
  const lngDelta = GRID_HALF_SIZE_METERS / Math.max(lngMetersPerDegree, 1)

  return {
    ne: {
      lat: center.lat + latDelta,
      lng: center.lng + lngDelta,
    },
    sw: {
      lat: center.lat - latDelta,
      lng: center.lng - lngDelta,
    },
  }
}

function getRiskToneFromValues(rawLevel: string | undefined, riskScore: number | undefined): RiskMarkerTone {
  if (rawLevel === '위험') {
    return 'red'
  }

  if (rawLevel === '주의') {
    return 'orange'
  }

  if (rawLevel === '관심') {
    return 'yellow'
  }

  if (rawLevel === '안전') {
    return 'green'
  }

  if (riskScore !== undefined) {
    if (riskScore >= 70) {
      return 'red'
    }

    if (riskScore >= 40) {
      return 'orange'
    }

    if (riskScore >= 20) {
      return 'yellow'
    }

    return 'green'
  }

  return 'gray'
}

function getRiskTone(result: RiskGridResult): RiskMarkerTone {
  const rawLevel = getStringField(result, ['riskLevel', 'riskGrade', 'grade', 'level'])
  const riskScore = getNumberField(result, ['riskScore', 'score', 'riskPercent', 'value'])
  return getRiskToneFromValues(rawLevel, riskScore)
}

function getDisplayRiskLevel(result: RiskGridResult) {
  const tone = getRiskTone(result)
  return tone === 'gray' ? getStringField(result, ['riskLevel', 'riskGrade', 'grade', 'level']) ?? riskLabelByTone.gray : riskLabelByTone[tone]
}

function buildMarkers(results: RiskGridResult[]) {
  const markers = results
    .map((result, index): RiskMarker | undefined => {
      const center = getGridCenter(result)

      if (!center) {
        return undefined
      }

      const gridCode = getStringField(result, ['gridCode', 'gridId'])
      const districtName = getStringField(result, ['districtName', 'district', 'guName'])
      const tone = getRiskTone(result)

      return {
        gridCode,
        bounds: getGridBounds(center),
        id: gridCode ?? `risk-marker-${index}`,
        label: districtName ?? gridCode ?? `위험 격자 ${index + 1}`,
        position: center,
        result,
        riskLevelLabel: getDisplayRiskLevel(result),
        riskScore: getNumberField(result, ['riskScore']),
        tone,
      }
    })
    .filter((marker): marker is RiskMarker => marker !== undefined)
    .sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))

  const priorityMarkers = markers.filter((marker) => (marker.riskScore ?? 0) >= MIN_PRIORITY_RISK_SCORE)

  if (priorityMarkers.length > 0) {
    return priorityMarkers.slice(0, MAX_VISIBLE_MARKERS)
  }

  return markers
    .filter((marker) => (marker.riskScore ?? 0) > 0)
    .slice(0, FALLBACK_VISIBLE_MARKERS)
}

function formatValue(value: number | string | undefined) {
  if (value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  return value
}

function formatCalculatedAt(value: string | undefined) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function RiskDetailPanel({
  isLoading,
  onClose,
  result,
}: {
  isLoading: boolean
  onClose: () => void
  result: RiskGridResult
}) {
  const fields = [
    { label: '격자 코드', value: getStringField(result, ['gridCode', 'gridId']) },
    { label: '분석 범위', value: '500m 격자' },
    { label: '자치구', value: getStringField(result, ['districtName', 'district', 'guName']) },
    { label: '위험 등급', value: getDisplayRiskLevel(result) },
    { label: '위험도', value: getNumberField(result, ['riskScore']) },
    { label: '강수 점수', value: getNumberField(result, ['rainfallScore']) },
    { label: '교통 점수', value: getNumberField(result, ['trafficScore']) },
    { label: '하수 점수', value: getNumberField(result, ['sewerScore']) },
    { label: '굴착 점수', value: getNumberField(result, ['excavationScore']) },
    { label: '산출 시각', value: formatCalculatedAt(result.calculatedAt ?? result.updatedAt) },
  ]

  return (
    <div className="absolute right-4 top-4 z-30 w-[min(330px,calc(100%-2rem))] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:right-6 sm:top-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-black text-blue-700">선택 격자</p>
          <h2 className="mt-1 truncate text-[16px] font-black text-slate-900">
            {[getStringField(result, ['districtName', 'district', 'guName']), getStringField(result, ['gridCode', 'gridId'])].filter(Boolean).join(' ') || '위험 격자'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="선택 격자 닫기"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        {fields.map((field) => (
          <div key={field.label} className={cn('rounded-lg bg-slate-50 px-3 py-2', field.label === '산출 시각' && 'col-span-2')}>
            <dt className="text-[11px] font-black text-slate-400">{field.label}</dt>
            <dd className="mt-1 text-[13px] font-black text-slate-800">{formatValue(field.value)}</dd>
          </div>
        ))}
      </dl>

      {isLoading && (
        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-[12px] font-bold text-blue-700">
          상세 정보를 불러오는 중입니다.
        </p>
      )}
    </div>
  )
}

export function KakaoRiskMap({
  activeGridCode,
  gridResults,
  isGridDetailLoading,
  onClearSelectedGrid,
  onSelectGrid,
  selectedGrid,
}: KakaoRiskMapProps) {
  const kakaoJavaScriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim() ?? ''
  const [isLoading, error] = useKakaoLoader({
    appkey: kakaoJavaScriptKey,
  })
  const markers = useMemo(() => buildMarkers(gridResults), [gridResults])
  const [isMapCreated, setIsMapCreated] = useState(false)
  const [shouldRenderMarkers, setShouldRenderMarkers] = useState(false)

  useEffect(() => {
    if (!isMapCreated || isLoading) {
      setShouldRenderMarkers(false)
      return
    }

    setShouldRenderMarkers(false)
    const markerRenderTimer = window.setTimeout(() => {
      setShouldRenderMarkers(true)
    }, 120)

    return () => window.clearTimeout(markerRenderTimer)
  }, [isLoading, isMapCreated, markers])

  if (!kakaoJavaScriptKey) {
    return (
      <section className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-center shadow-[0_18px_45px_rgba(15,40,70,0.08)] sm:h-[500px] xl:h-[560px]">
        <p className="text-[14px] font-bold leading-6 text-slate-600">카카오 지도 키가 설정되지 않아 지도를 표시할 수 없습니다.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-center shadow-[0_18px_45px_rgba(15,40,70,0.08)] sm:h-[500px] xl:h-[560px]">
        <p className="text-[14px] font-bold leading-6 text-slate-600">카카오 지도를 불러오지 못했습니다. 도메인 등록과 JavaScript 키를 확인해 주세요.</p>
      </section>
    )
  }

  return (
    <section className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_18px_45px_rgba(15,40,70,0.08)] sm:h-[500px] xl:h-[560px]">
      <Map
        center={INITIAL_MAP_CENTER}
        className="kakao-map-root h-full w-full"
        isPanto
        level={7}
        onCreate={() => setIsMapCreated(true)}
        style={{ height: '100%', width: '100%' }}
        {...interactiveKakaoMapOptions}
      >
        {shouldRenderMarkers && markers.map((marker) => {
          const isSelected = marker.gridCode !== undefined && marker.gridCode === activeGridCode
          const areaStyle = riskAreaStyles[marker.tone]

          return (
            <Rectangle
              key={`${marker.id}-grid`}
              bounds={marker.bounds}
              fillColor={areaStyle.fillColor}
              fillOpacity={isSelected ? 0.22 : 0.12}
              onClick={() => onSelectGrid(marker.result)}
              strokeColor={areaStyle.strokeColor}
              strokeOpacity={isSelected ? 0.75 : 0.42}
              strokeWeight={isSelected ? 3 : 2}
              zIndex={isSelected ? 8 : 5}
            />
          )
        })}

        {shouldRenderMarkers && markers.map((marker) => {
          const isSelected = marker.gridCode !== undefined && marker.gridCode === activeGridCode
          const markerValue = marker.riskScore === undefined ? marker.riskLevelLabel : Math.round(marker.riskScore)

          return (
            <CustomOverlayMap
              key={marker.id}
              clickable
              position={marker.position}
              yAnchor={1}
              zIndex={isSelected ? 20 : 10}
            >
              <button
                type="button"
                onClick={() => onSelectGrid(marker.result)}
                className="flex -translate-y-1 flex-col items-center outline-none transition hover:scale-110 focus-visible:scale-110 focus-visible:ring-4 focus-visible:ring-blue-200"
                aria-label={`${marker.label} ${marker.riskLevelLabel} 상세 보기`}
              >
                <span
                  className={cn(
                    'flex h-10 min-w-10 items-center justify-center rounded-full border-[3px] border-white px-2 text-[12px] font-black shadow-xl sm:h-11 sm:min-w-11 sm:text-[13px]',
                    riskToneClasses[marker.tone],
                    isSelected && 'ring-4 ring-blue-200',
                  )}
                >
                  {markerValue}
                </span>
              </button>
            </CustomOverlayMap>
          )
        })}
      </Map>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-slate-900/5" />

      {isLoading && (
        <div className="absolute left-4 top-4 z-20 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] font-bold text-blue-700 shadow-sm">
          카카오 지도를 불러오는 중입니다.
        </div>
      )}

      {!isLoading && isMapCreated && !shouldRenderMarkers && markers.length > 0 && (
        <div className="absolute left-4 top-4 z-20 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[12px] font-bold text-blue-700 shadow-sm">
          위험 격자를 지도에 표시하는 중입니다.
        </div>
      )}

      {!isLoading && shouldRenderMarkers && markers.length === 0 && (
        <div className="absolute left-4 top-4 z-20 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-[12px] font-bold text-slate-600 shadow-sm">
          표시할 위험 격자가 없습니다.
        </div>
      )}

      <div className="absolute bottom-5 right-4 z-20 grid min-w-[250px] grid-cols-5 gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:right-6">
        {riskLegendItems.map((item) => (
          <div key={item.tone} className="text-center">
            <span className={cn('mx-auto block h-3 w-3 rounded-full', riskToneClasses[item.tone].split(' ')[0])} />
            <span className="mt-1 block text-[10px] font-black text-slate-700">{item.label}</span>
            <span className="mt-0.5 block text-[9px] font-bold text-slate-500">{item.range}</span>
          </div>
        ))}
        <p className="col-span-5 mt-1 text-center text-[10px] font-bold text-slate-500">
          원형 마커와 반투명 500m 격자는 같은 위험 등급 색상입니다.
        </p>
      </div>

      {selectedGrid && (
        <RiskDetailPanel
          isLoading={isGridDetailLoading}
          onClose={onClearSelectedGrid}
          result={selectedGrid}
        />
      )}
    </section>
  )
}
