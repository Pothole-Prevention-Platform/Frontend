import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  FileText,
  Info,
  LocateFixed,
  Lock,
  MapPin,
  Minus,
  Plus,
  RefreshCcw,
  X,
} from 'lucide-react'
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk'
import { useNavigate } from 'react-router-dom'
import {
  createCitizenReport,
  getReportId,
  REPORT_IMAGE_MAX_BYTES,
} from '../api/reportApi'
import { interactiveKakaoMapOptions } from '../constants/kakaoMapOptions'
import {
  aiVerificationSteps,
  citizenReportMock,
  recentCitizenReports,
  riskSeverityOptions,
} from '../data/mockData'
import type { RecentCitizenReport, ReportSeverityId, RiskSeverityOption } from '../types'
import type { HazardType, ReporterSeverity } from '../types/report'
import { cn } from '../utils/cn'

type SectionTitleProps = {
  number: number
  title: string
  label?: '필수' | '선택'
}

const reportLocationOptions = [
  {
    id: 'gangnam-teheran',
    district: '강남구',
    label: '강남구 테헤란로',
    address: '서울특별시 강남구 테헤란로 123',
    latitude: 37.5006,
    longitude: 127.0334,
    previewPosition: { left: 57, top: 66 },
  },
  {
    id: 'seocho-yangjaecheon',
    district: '서초구',
    label: '서초구 양재천로',
    address: '서울특별시 서초구 양재천로 123',
    latitude: 37.4759,
    longitude: 127.0384,
    previewPosition: { left: 54, top: 75 },
  },
  {
    id: 'songpa-olympic',
    district: '송파구',
    label: '송파구 올림픽로',
    address: '서울특별시 송파구 올림픽로 300',
    latitude: 37.5133,
    longitude: 127.1043,
    previewPosition: { left: 77, top: 62 },
  },
  {
    id: 'jongno-changgyeonggung',
    district: '종로구',
    label: '종로구 창경궁로',
    address: '서울특별시 종로구 창경궁로 256',
    latitude: 37.5847,
    longitude: 127.0008,
    previewPosition: { left: 46, top: 38 },
  },
  {
    id: 'mapo-worldcup',
    district: '마포구',
    label: '마포구 월드컵로',
    address: '서울특별시 마포구 월드컵로 45',
    latitude: 37.5568,
    longitude: 126.9106,
    previewPosition: { left: 21, top: 51 },
  },
] as const

type ReportLocationId = (typeof reportLocationOptions)[number]['id']
type ReportLocationOption = (typeof reportLocationOptions)[number]

const defaultReportLocationId: ReportLocationId = 'seocho-yangjaecheon'

const riskTypeOptions = [
  '포트홀 (도로 파임)',
  '균열 (도로 갈라짐)',
  '도로 침하',
  '낙하물',
  '기타 도로 위험',
] as const

const hazardTypeByLabel: Record<string, HazardType> = {
  '포트홀 (도로 파임)': 'POTHOLE',
  '균열 (도로 갈라짐)': 'CRACK',
  '도로 침하': 'SUBSIDENCE',
  낙하물: 'FALLING_OBJECT',
  '기타 도로 위험': 'OTHER',
}

const reporterSeverityById: Record<ReportSeverityId, ReporterSeverity> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
}

const severityColorClasses: Record<RiskSeverityOption['color'], { dot: string; text: string; ring: string }> = {
  green: {
    dot: 'bg-green-500',
    text: 'text-green-700',
    ring: 'ring-green-100',
  },
  yellow: {
    dot: 'bg-yellow-400',
    text: 'text-amber-600',
    ring: 'ring-yellow-100',
  },
  orange: {
    dot: 'bg-orange-500',
    text: 'text-orange-600',
    ring: 'ring-orange-100',
  },
  red: {
    dot: 'bg-red-600',
    text: 'text-red-600',
    ring: 'ring-red-100',
  },
}

const statusClasses: Record<RecentCitizenReport['statusColor'], string> = {
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  cyan: 'bg-cyan-100 text-cyan-700',
}

function formatFileSize(file: File) {
  const sizeInMb = file.size / 1024 / 1024

  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(1)}MB`
  }

  return `${Math.max(1, Math.round(file.size / 1024))}KB`
}

function SectionTitle({ number, title, label }: SectionTitleProps) {
  return (
    <h3 className="text-[17px] font-black text-[#07182F]">
      {number}. {title}{' '}
      {label && (
        <span className={cn('text-[13px] font-black', label === '필수' ? 'text-blue-700' : 'text-slate-400')}>
          ({label})
        </span>
      )}
    </h3>
  )
}

function BlankPhotoSpace({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="img"
      aria-label={compact ? '최근 신고 사진 없음' : '첨부 사진 없음'}
      className={cn('h-full w-full bg-slate-50', compact && 'rounded-xl')}
    />
  )
}

function FallbackLocationMap({ location }: { location: ReportLocationOption }) {
  return (
    <div
      role="img"
      aria-label={`${location.address} 지도 미리보기`}
      className="absolute inset-0 overflow-hidden bg-slate-100"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute left-[-18%] top-[20%] h-6 w-[140%] rotate-[-18deg] rounded-full bg-green-100 shadow-[0_0_0_6px_rgba(255,255,255,0.62)]" />
      <div className="absolute left-[-18%] top-[54%] h-7 w-[142%] rotate-[14deg] rounded-full bg-slate-200 shadow-[0_0_0_6px_rgba(255,255,255,0.58)]" />
      <div className="absolute left-[46%] top-[-28%] h-[160%] w-5 rotate-[9deg] rounded-full bg-blue-100 shadow-[0_0_0_5px_rgba(255,255,255,0.55)]" />
      <div
        className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
        style={{ left: `${location.previewPosition.left}%`, top: `${location.previewPosition.top}%` }}
      >
        <MapPin className="text-blue-700 drop-shadow-md" size={46} fill="#0B6DDE" aria-hidden="true" />
        <span className="mt-[-4px] max-w-[120px] truncate rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-blue-700 shadow-sm">
          {location.district}
        </span>
      </div>
    </div>
  )
}

function UploadedPreview({
  previewUrl,
  fileName,
  fileSize,
  onClear,
}: {
  previewUrl: string | null
  fileName: string | null
  fileSize: string | null
  onClear: () => void
}) {
  return (
    <div>
      <div className="relative h-[148px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        {previewUrl ? (
          <img src={previewUrl} alt="신고된 포트홀 사진 미리보기" className="h-full w-full object-cover" />
        ) : (
          <BlankPhotoSpace />
        )}

        {previewUrl && (
          <button
            type="button"
            onClick={onClear}
            aria-label="첨부 사진 제거"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-md transition hover:bg-slate-50"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      {fileName && <p className="mt-3 text-[14px] font-black text-slate-700">{fileName}</p>}
      {fileSize && <p className="mt-1 text-[12px] font-semibold text-slate-500">{fileSize}</p>}
    </div>
  )
}

function PhotoSection({
  previewUrl,
  fileName,
  fileSize,
  onFileChange,
  onClearFile,
}: {
  previewUrl: string | null
  fileName: string | null
  fileSize: string | null
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClearFile: () => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <label
        htmlFor="report-photo"
        className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/25 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50"
      >
        <input
          id="report-photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={onFileChange}
        />
        <CloudUpload size={48} strokeWidth={1.7} className="text-slate-600" aria-hidden="true" />
        <span className="mt-4 text-[14px] font-black text-slate-700">파일을 드래그하거나 클릭하여 업로드</span>
        <span className="mt-2 text-[12px] font-semibold text-slate-500">JPG, PNG 파일 (최대 10MB)</span>
      </label>

      <UploadedPreview previewUrl={previewUrl} fileName={fileName} fileSize={fileSize} onClear={onClearFile} />
    </div>
  )
}

function formatCoordinate(value: number) {
  return value.toFixed(6)
}

function MapPreview({ location }: { location: ReportLocationOption }) {
  const kakaoJavaScriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY?.trim() ?? ''
  const [isMapLoading, mapError] = useKakaoLoader({
    appkey: kakaoJavaScriptKey,
  })
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const [mapLevel, setMapLevel] = useState(4)
  const position = {
    lat: location.latitude,
    lng: location.longitude,
  }
  const canShowKakaoMap = Boolean(kakaoJavaScriptKey) && !mapError

  useEffect(() => {
    if (!mapRef.current || typeof kakao === 'undefined') {
      return
    }

    const nextCenter = new kakao.maps.LatLng(location.latitude, location.longitude)
    mapRef.current.relayout()
    mapRef.current.panTo(nextCenter)
  }, [location.latitude, location.longitude])

  const changeZoomLevel = (delta: number) => {
    setMapLevel((current) => {
      const nextLevel = Math.min(10, Math.max(1, current + delta))
      mapRef.current?.setLevel(nextLevel)
      return nextLevel
    })
  }

  const recenterMap = () => {
    setMapLevel(4)

    if (!mapRef.current || typeof kakao === 'undefined') {
      return
    }

    mapRef.current.setLevel(4)
    mapRef.current.panTo(new kakao.maps.LatLng(location.latitude, location.longitude))
  }

  return (
    <div className="relative h-[176px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 lg:h-[156px] lg:w-[270px]">
      {canShowKakaoMap ? (
        <Map
          center={position}
          className="kakao-map-root h-full w-full"
          isPanto
          level={mapLevel}
          onCreate={(map) => {
            mapRef.current = map
          }}
          style={{ height: '100%', width: '100%' }}
          {...interactiveKakaoMapOptions}
        >
          <CustomOverlayMap position={position} yAnchor={1}>
            <div className="flex -translate-y-1 flex-col items-center">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_26px_rgba(0,95,220,0.32)]">
                <span className="absolute inset-[-7px] rounded-full bg-blue-500/20" />
                <MapPin size={25} fill="currentColor" strokeWidth={2.6} aria-hidden="true" className="relative z-10" />
              </div>
              <span className="mt-1 max-w-[118px] truncate rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-blue-700 shadow-sm">
                {location.district}
              </span>
            </div>
          </CustomOverlayMap>
        </Map>
      ) : (
        <FallbackLocationMap location={location} />
      )}

      <div className="absolute left-2 top-2 max-w-[176px] rounded-lg bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <p className="truncate text-[11px] font-black text-blue-700">{location.label}</p>
        <p className="mt-1 text-[10px] font-bold text-slate-500">
          {formatCoordinate(location.latitude)} · {formatCoordinate(location.longitude)}
        </p>
      </div>

      <div className="absolute bottom-2 left-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          aria-label="지도 확대"
          onClick={() => changeZoomLevel(-1)}
          className="flex h-8 w-8 items-center justify-center border-b border-slate-200 text-xl text-slate-700 transition hover:bg-blue-50"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="지도 축소"
          onClick={() => changeZoomLevel(1)}
          className="flex h-8 w-8 items-center justify-center text-xl text-slate-700 transition hover:bg-blue-50"
        >
          <Minus size={16} aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        aria-label="선택 위치 보기"
        onClick={recenterMap}
        className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-blue-50"
      >
        <LocateFixed size={17} aria-hidden="true" />
      </button>

      {canShowKakaoMap && isMapLoading && (
        <div className="absolute inset-x-2 bottom-12 rounded-lg bg-white/95 px-3 py-2 text-center text-[11px] font-black text-blue-700 shadow-sm">
          지도를 불러오는 중입니다.
        </div>
      )}
    </div>
  )
}

function LocationSection({
  selectedLocation,
  selectedLocationId,
  locationDetail,
  onLocationChange,
  onLocationDetailChange,
}: {
  selectedLocation: ReportLocationOption
  selectedLocationId: ReportLocationId
  locationDetail: string
  onLocationChange: (locationId: ReportLocationId) => void
  onLocationDetailChange: (locationDetail: string) => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
      <MapPreview location={selectedLocation} />

      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <MapPin size={18} className="text-blue-700" fill="#0B6DDE" aria-hidden="true" />
            <span className="text-[14px] font-black text-slate-800">선택 위치</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black text-blue-700">
              {selectedLocation.district}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onLocationChange(defaultReportLocationId)}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[12px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCcw size={14} aria-hidden="true" />
            위치 재설정
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="min-w-0">
            <label htmlFor="report-location" className="text-[12px] font-black text-slate-600">
              지원 지역
            </label>
            <div className="relative mt-2">
              <select
                id="report-location"
                value={selectedLocationId}
                onChange={(event) => onLocationChange(event.target.value as ReportLocationId)}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-9 text-[13px] font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {reportLocationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="min-w-0">
            <label htmlFor="report-address" className="text-[12px] font-black text-slate-600">
              주소
            </label>
            <input
              id="report-address"
              value={selectedLocation.address}
              readOnly
              className="mt-2 h-10 min-w-0 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/55 px-3 py-2">
          <p className="text-[12px] font-bold leading-5 text-blue-800">
            위도 {formatCoordinate(selectedLocation.latitude)} · 경도 {formatCoordinate(selectedLocation.longitude)}
          </p>
        </div>

        <div className="mt-3">
          <label htmlFor="report-location-detail" className="text-[12px] font-black text-slate-600">
            상세 위치 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="report-location-detail"
            value={locationDetail}
            onChange={(event) => onLocationDetailChange(event.target.value)}
            placeholder={citizenReportMock.detailLocationPlaceholder}
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  )
}

function SeveritySelector({
  selectedSeverity,
  onSelectSeverity,
}: {
  selectedSeverity: ReportSeverityId
  onSelectSeverity: (severity: ReportSeverityId) => void
}) {
  return (
    <div role="radiogroup" aria-label="위험 심각도" className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {riskSeverityOptions.map((option) => {
        const selected = selectedSeverity === option.id
        const colorClasses = severityColorClasses[option.color]

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelectSeverity(option.id)}
            className={cn(
              'flex min-h-[58px] items-center gap-3 rounded-lg border bg-white px-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40',
              selected
                ? 'border-blue-600 bg-blue-50/40 shadow-[0_10px_20px_rgba(0,96,210,0.12)]'
                : 'border-slate-200',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4',
                colorClasses.dot,
                colorClasses.ring,
              )}
              aria-hidden="true"
            >
              {selected && <CheckCircle2 size={15} className="text-white" />}
            </span>

            <span>
              <span className={cn('block text-[14px] font-black', selected ? colorClasses.text : 'text-slate-700')}>
                {option.label}
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-slate-500">{option.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ReportInfoSection({
  riskType,
  selectedSeverity,
  onRiskTypeChange,
  onSelectSeverity,
}: {
  riskType: string
  selectedSeverity: ReportSeverityId
  onRiskTypeChange: (riskType: string) => void
  onSelectSeverity: (severity: ReportSeverityId) => void
}) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <label htmlFor="report-date" className="text-[12px] font-black text-slate-600">
              신고 일시
            </label>
            <span className="text-[11px] font-semibold text-slate-400">(자동 기록)</span>
          </div>
          <div className="relative mt-2">
            <input
              id="report-date"
              value={citizenReportMock.reportedAt}
              readOnly
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[13px] font-semibold text-slate-700 outline-none"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} aria-hidden="true" />
          </div>
        </div>

        <div>
          <label htmlFor="risk-type" className="text-[12px] font-black text-slate-600">
            위험 유형
          </label>
          <select
            id="risk-type"
            value={riskType}
            onChange={(event) => onRiskTypeChange(event.target.value)}
            className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            {riskTypeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-black text-slate-600">위험 심각도</p>
        <SeveritySelector selectedSeverity={selectedSeverity} onSelectSeverity={onSelectSeverity} />
      </div>
    </div>
  )
}

function ReportForm({
  selectedSeverity,
  riskType,
  description,
  selectedLocation,
  selectedLocationId,
  locationDetail,
  previewUrl,
  fileName,
  fileSize,
  onFileChange,
  onClearFile,
  onRiskTypeChange,
  onSelectSeverity,
  onDescriptionChange,
  onLocationChange,
  onLocationDetailChange,
  onSubmit,
  errorMessage,
  isSubmitting,
  onMockReview,
}: {
  selectedSeverity: ReportSeverityId
  riskType: string
  description: string
  selectedLocation: ReportLocationOption
  selectedLocationId: ReportLocationId
  locationDetail: string
  previewUrl: string | null
  fileName: string | null
  fileSize: string | null
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClearFile: () => void
  onRiskTypeChange: (riskType: string) => void
  onSelectSeverity: (severity: ReportSeverityId) => void
  onDescriptionChange: (description: string) => void
  onLocationChange: (locationId: ReportLocationId) => void
  onLocationDetailChange: (locationDetail: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  errorMessage: string
  isSubmitting: boolean
  onMockReview: () => void
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,40,70,0.07)]"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[20px] font-black text-[#07182F]">새로운 위험 신고</h2>
      </div>

      <div className="border-b border-slate-200 px-5 py-4">
        <SectionTitle number={1} title="사진 첨부" label="필수" />
        <p className="mt-2 text-[12px] font-semibold text-slate-500">
          포트홀, 도로 파손이 명확하게 보이도록 촬영해 주세요.
        </p>
        <div className="mt-4">
          <PhotoSection
            previewUrl={previewUrl}
            fileName={fileName}
            fileSize={fileSize}
            onFileChange={onFileChange}
            onClearFile={onClearFile}
          />
        </div>
      </div>

      <div className="border-b border-slate-200 px-5 py-4">
        <SectionTitle number={2} title="위치 정보" label="필수" />
        <div className="mt-4">
          <LocationSection
            selectedLocation={selectedLocation}
            selectedLocationId={selectedLocationId}
            locationDetail={locationDetail}
            onLocationChange={onLocationChange}
            onLocationDetailChange={onLocationDetailChange}
          />
        </div>
      </div>

      <div className="border-b border-slate-200 px-5 py-4">
        <SectionTitle number={3} title="신고 정보" />
        <div className="mt-3">
          <ReportInfoSection
            riskType={riskType}
            selectedSeverity={selectedSeverity}
            onRiskTypeChange={onRiskTypeChange}
            onSelectSeverity={onSelectSeverity}
          />
        </div>
      </div>

      <div className="px-5 py-4">
        <SectionTitle number={4} title="추가 설명" label="선택" />
        <div className="relative mt-3">
          <textarea
            id="report-description"
            maxLength={300}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="도로 상태, 크기, 발생 원인 등 추가 정보를 입력해 주세요. (최대 300자)"
            className="h-[92px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-20 text-[13px] font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          <label htmlFor="report-description" className="sr-only">
            추가 설명
          </label>
          <p className="pointer-events-none absolute bottom-3 right-4 text-[12px] font-semibold text-slate-400">
            {description.length} / 300
          </p>
        </div>

        {errorMessage && (
          <div
            className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-bold leading-5 text-red-700"
            aria-live="polite"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={onMockReview}
              className="mt-2 text-[12px] font-black text-red-800 underline underline-offset-4"
            >
              데모 결과 화면으로 계속 보기
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="mt-5 flex h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-[16px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <FileText size={20} aria-hidden="true" />
          {isSubmitting ? '신고 접수 중' : '신고 접수'}
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-slate-400">
          <Lock size={14} aria-hidden="true" />
          <p className="text-center text-[12px] font-semibold">
            개인정보는 안전하게 보호되며, 신고 내용은 담당 기관에만 공유됩니다.
          </p>
        </div>
      </div>
    </form>
  )
}

function AiVerificationIllustration() {
  const sparkles = [
    { id: 'left', className: 'left-[18px] top-[62px] h-6 w-6 text-blue-300/80' },
    { id: 'right', className: 'right-[15px] top-[82px] h-5 w-5 text-blue-300/80' },
    { id: 'top', className: 'right-[52px] top-[18px] h-3 w-3 text-blue-300/70' },
  ] as const

  return (
    <div
      role="img"
      aria-label="AI 이미지 자동 분석을 나타내는 파란 반도체 칩 아이콘"
      className="relative mx-auto h-[136px] w-[176px]"
    >
      <div className="absolute left-1/2 top-[54%] h-[86px] w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-blue-200/90" />
      <div className="absolute left-1/2 top-[54%] h-[112px] w-[156px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-blue-100/90" />

      <span className="absolute left-[8px] top-[42px] h-3 w-3 rounded-full bg-blue-300/70" />
      <span className="absolute left-[20px] top-[34px] h-1.5 w-1.5 rounded-full bg-blue-200" />
      <span className="absolute right-[8px] top-[72px] h-3 w-3 rounded-full bg-blue-300/70" />
      <span className="absolute right-[26px] top-[26px] h-1.5 w-1.5 rounded-full bg-blue-300" />

      <span className="absolute left-[26px] top-[58px] h-[2px] w-[33px] rounded-full bg-blue-300/70" />
      <span className="absolute left-[36px] top-[78px] h-[2px] w-[26px] rounded-full bg-blue-200/90" />
      <span className="absolute right-[28px] top-[48px] h-[2px] w-[30px] rounded-full bg-blue-300/70" />
      <span className="absolute right-[36px] top-[88px] h-[2px] w-[24px] rounded-full bg-blue-200/90" />

      {sparkles.map((sparkle) => (
        <span key={sparkle.id} className={cn('absolute', sparkle.className)} aria-hidden="true">
          <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-current" />
          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-current" />
        </span>
      ))}

      <div className="absolute left-1/2 top-[58px] h-[70px] w-[70px] -translate-x-1/2 rounded-[18px] bg-gradient-to-br from-[#1F8FFF] to-[#075ED5] shadow-[0_18px_36px_rgba(0,96,210,0.26),inset_0_1px_0_rgba(255,255,255,0.35)]">
        <div className="absolute -left-3 top-[15px] space-y-2">
          {[0, 1, 2, 3].map((pin) => (
            <span key={`left-${pin}`} className="block h-1.5 w-3 rounded-l-full bg-blue-300/90" />
          ))}
        </div>
        <div className="absolute -right-3 top-[15px] space-y-2">
          {[0, 1, 2, 3].map((pin) => (
            <span key={`right-${pin}`} className="block h-1.5 w-3 rounded-r-full bg-blue-300/90" />
          ))}
        </div>
        <div className="absolute -top-3 left-[15px] flex gap-2">
          {[0, 1, 2, 3].map((pin) => (
            <span key={`top-${pin}`} className="h-3 w-1.5 rounded-t-full bg-blue-300/90" />
          ))}
        </div>
        <div className="absolute -bottom-3 left-[15px] flex gap-2">
          {[0, 1, 2, 3].map((pin) => (
            <span key={`bottom-${pin}`} className="h-3 w-1.5 rounded-b-full bg-blue-300/90" />
          ))}
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-[28px] font-black tracking-normal text-white">
          AI
        </span>
      </div>
    </div>
  )
}

function AiGuideCard() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 shadow-[0_16px_40px_rgba(0,96,210,0.06)] sm:p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-[18px] font-black text-blue-700">AI 자동 검증 안내</h2>
        <Info size={16} className="text-blue-700" aria-hidden="true" />
      </div>

      <div className="mt-8 flex justify-center">
        <AiVerificationIllustration />
      </div>

      <p className="mt-7 text-center text-[14px] font-bold leading-relaxed text-slate-700">
        신고 접수 후 AI가 이미지를 분석하여
        <br className="hidden sm:block" />
        포트홀 여부와 위험도를 자동으로 판단합니다.
      </p>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white/80">
        {aiVerificationSteps.map((step) => (
          <div key={step.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
            <CheckCircle2 size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-slate-600">{step.title}</span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-[14px] font-black text-slate-600">
        평균 처리 시간: <span className="text-blue-700">2~5분</span>
      </p>
    </section>
  )
}

function RecentThumbnail() {
  return (
    <div className="h-[72px] w-[78px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
      <BlankPhotoSpace compact />
    </div>
  )
}

function RecentReportItem({ report }: { report: RecentCitizenReport }) {
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_78px] gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <span className={cn('inline-flex h-6 items-center rounded-full px-2 text-[11px] font-black', statusClasses[report.statusColor])}>
          {report.status}
        </span>
        <h3 className="mt-2 truncate text-[14px] font-black text-[#07182F]">{report.title}</h3>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-[11px] font-semibold text-slate-500">
          <MapPin size={12} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{report.location}</span>
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <Calendar size={12} aria-hidden="true" />
          {report.date}
        </p>
      </div>

      <RecentThumbnail />
    </article>
  )
}

function RecentReportsCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,40,70,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-black text-[#07182F]">최근 신고 내역</h2>
        <button type="button" className="flex items-center gap-1 text-[12px] font-black text-blue-700 transition hover:text-blue-500">
          전체 보기
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3">
        {recentCitizenReports.map((report) => (
          <RecentReportItem key={report.id} report={report} />
        ))}
      </div>
    </section>
  )
}

export function CitizenReportPage() {
  const navigate = useNavigate()
  const [selectedSeverity, setSelectedSeverity] = useState<ReportSeverityId>(citizenReportMock.defaultSeverity)
  const [riskType, setRiskType] = useState(citizenReportMock.defaultRiskType)
  const [description, setDescription] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState<ReportLocationId>(defaultReportLocationId)
  const [locationDetail, setLocationDetail] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const preservePreviewUrlRef = useRef(false)
  const selectedLocation =
    reportLocationOptions.find((location) => location.id === selectedLocationId) ?? reportLocationOptions[0]

  useEffect(() => {
    return () => {
      if (previewUrl && !preservePreviewUrlRef.current) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      if (file.size > REPORT_IMAGE_MAX_BYTES) {
        setSelectedFile(null)
        setPreviewUrl(null)
        setSubmitError('이미지는 10MB 이하만 업로드할 수 있습니다.')
        event.target.value = ''
        return
      }

      preservePreviewUrlRef.current = false

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setSubmitError('')
    }
  }

  const handleClearFile = () => {
    preservePreviewUrlRef.current = false

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleLocationChange = (locationId: ReportLocationId) => {
    setSelectedLocationId(locationId)
    setSubmitError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setSubmitError('신고 사진을 먼저 첨부해 주세요.')
      return
    }

    if (selectedFile.size > REPORT_IMAGE_MAX_BYTES) {
      setSubmitError('이미지는 10MB 이하만 업로드할 수 있습니다.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const result = await createCitizenReport({
        image: selectedFile,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: selectedLocation.address,
        locationDetail: locationDetail.trim() || undefined,
        hazardType: hazardTypeByLabel[riskType] ?? 'OTHER',
        reporterSeverity: reporterSeverityById[selectedSeverity],
        description: description.trim() || undefined,
      })
      const reportId = getReportId(result)

      if (!reportId) {
        setSubmitError('신고는 접수되었지만 결과 번호를 찾을 수 없습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      preservePreviewUrlRef.current = Boolean(previewUrl)

      navigate(`/report/ai-review?reportId=${encodeURIComponent(reportId)}`, {
        state: previewUrl ? { reportId, localImageUrl: previewUrl } : undefined,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setSubmitError(`백엔드 연결에 실패했습니다. 서버 실행 상태를 확인해 주세요. (${message})`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fileName = selectedFile?.name ?? null
  const fileSize = selectedFile ? formatFileSize(selectedFile) : null

  return (
    <div className="min-w-0">
      <div>
        <h1 className="text-[30px] font-black text-[#07182F] sm:text-[34px]">시민 신고</h1>
        <p className="mt-2 text-[15px] font-semibold text-slate-500">
          도로 파손, 포트홀 등 위험 요소를 신고해 주세요.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_335px]">
        <ReportForm
          selectedSeverity={selectedSeverity}
          riskType={riskType}
          description={description}
          selectedLocation={selectedLocation}
          selectedLocationId={selectedLocationId}
          locationDetail={locationDetail}
          previewUrl={previewUrl}
          fileName={fileName}
          fileSize={fileSize}
          onFileChange={handleFileChange}
          onClearFile={handleClearFile}
          onRiskTypeChange={setRiskType}
          onSelectSeverity={setSelectedSeverity}
          onDescriptionChange={setDescription}
          onLocationChange={handleLocationChange}
          onLocationDetailChange={setLocationDetail}
          onSubmit={handleSubmit}
          errorMessage={submitError}
          isSubmitting={isSubmitting}
          onMockReview={() => navigate('/report/ai-review')}
        />

        <aside className="grid gap-5 lg:grid-cols-2 xl:block xl:space-y-5">
          <AiGuideCard />
          <RecentReportsCard />
        </aside>
      </div>
    </div>
  )
}
