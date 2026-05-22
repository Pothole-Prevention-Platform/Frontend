import { type ElementType, type ReactNode, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  ExternalLink,
  FileCheck2,
  ImageIcon,
  ListChecks,
  Ruler,
  ScanLine,
  Shield,
  ShieldAlert,
  Upload,
  Waves,
} from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiBaseUrl } from '../api/apiClient'
import { getCitizenReport, getCitizenReports } from '../api/reportApi'
import {
  aiAnalysisSteps,
  aiDetectedFeatures,
  aiRecommendedActions,
  aiReviewResult,
} from '../data/mockData'
import type { AiDetectedFeature, AiRecommendedAction, AiReviewIconName, RecentAiResult } from '../types'
import type { CitizenReportResponse, ReportAgencyResult, ReportAiResult } from '../types/report'
import { cn } from '../utils/cn'

type AssetImageProps = {
  sources: string[]
  alt: string
  className: string
  fallback: ReactNode
}

const iconMap: Record<AiReviewIconName, ElementType> = {
  image: ImageIcon,
  scan: ScanLine,
  crosshair: Crosshair,
  shield: Shield,
  fileCheck: FileCheck2,
  waves: Waves,
  ruler: Ruler,
  listChecks: ListChecks,
  alertTriangle: AlertTriangle,
  checkCircle: CheckCircle2,
  camera: Camera,
  shieldAlert: ShieldAlert,
}

type AiReviewViewData = {
  capturedAt: string
  location: string
  potholeProbability: number | null
  confidence: number | null
  resultLevel: string
  description: string
  imageSources: string[]
  features: AiDetectedFeature[]
  isAnalysisPending: boolean
}

type ReportLoadState = {
  reportId: string
  reviewData: AiReviewViewData | null
  notice: string
}

const AI_RESULT_POLL_INTERVAL_MS = 3000
const AI_RESULT_MAX_POLL_ATTEMPTS = 12

const fallbackReviewData: AiReviewViewData = {
  capturedAt: aiReviewResult.capturedAt,
  location: aiReviewResult.location,
  potholeProbability: aiReviewResult.potholeProbability,
  confidence: aiReviewResult.confidence,
  resultLevel: aiReviewResult.resultLevel,
  description: aiReviewResult.description,
  imageSources: [],
  features: aiDetectedFeatures,
  isAnalysisPending: false,
}

function createPendingReviewData(localImageUrl: string | undefined): AiReviewViewData {
  return {
    capturedAt: '불러오는 중',
    location: '신고 위치 확인 중',
    potholeProbability: null,
    confidence: null,
    resultLevel: '분석 대기',
    description: '신고 분석 결과를 불러오는 중입니다.',
    imageSources: localImageUrl ? [localImageUrl] : [],
    isAnalysisPending: true,
    features: [
      {
        id: 'detected',
        label: '포트홀 감지',
        value: '분석 대기',
        severity: 'normal',
        iconName: 'crosshair',
      },
      {
        id: 'confidence',
        label: '신뢰도',
        value: '분석 대기',
        severity: 'normal',
        iconName: 'shield',
      },
      {
        id: 'severity',
        label: '위험도',
        value: '분석 대기',
        severity: 'normal',
        iconName: 'alertTriangle',
      },
    ],
  }
}

const aiSeverityLabels: Record<string, string> = {
  NONE: '없음',
  SMALL: '소형',
  MEDIUM: '중형',
  LARGE: '대형',
  critical: '매우 높음',
  high: '높음',
  medium: '보통',
  low: '낮음',
}

const crackLabels: Record<string, string> = {
  NONE: '없음',
  MILD: '약함',
  MODERATE: '보통',
  SEVERE: '심함',
}

const shapeLabels: Record<string, string> = {
  IRREGULAR: '불규칙형',
  CIRCULAR: '원형',
  LINEAR: '선형',
  OTHER: '기타',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getNestedRecord<T extends Record<string, unknown>>(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (isRecord(value)) {
      return value as T
    }
  }

  return undefined
}

function getString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return undefined
}

function getNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string') {
      const parsedValue = Number.parseFloat(value)

      if (Number.isFinite(parsedValue)) {
        return parsedValue
      }
    }
  }

  return undefined
}

function getBooleanOrString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]

    if (typeof value === 'boolean' || typeof value === 'string') {
      return value
    }
  }

  return undefined
}

function normalizePercent(value: number) {
  const percent = value <= 1 ? value * 100 : value
  return Math.max(0, Math.min(100, Math.round(percent)))
}

function percentLevel(percent: number): RecentAiResult['level'] {
  if (percent >= 90) return '매우 높음'
  if (percent >= 70) return '높음'
  if (percent >= 40) return '보통'
  return '낮음'
}

function optionalNumber(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function optionalString(value: string | null | undefined) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function formatSeverity(severity: string | undefined, percent: number | null) {
  if (!severity) {
    if (percent === null) return '분석 대기'
    if (percent >= 90) return '매우 높음'
    if (percent >= 70) return '높음'
    if (percent >= 40) return '보통'
    return '낮음'
  }

  return aiSeverityLabels[severity] ?? aiSeverityLabels[severity.toLowerCase()] ?? severity
}

function formatCracks(value: boolean | string | undefined) {
  if (typeof value === 'boolean') {
    return value ? '있음' : '없음'
  }

  return value ? crackLabels[value] ?? value : undefined
}

function formatShape(value: string | undefined) {
  return value ? shapeLabels[value] ?? value : undefined
}

function formatDetected(value: boolean | string | undefined) {
  if (typeof value === 'boolean') {
    return value ? '감지됨' : '감지되지 않음'
  }

  return value
}

function formatBbox(value: number[] | null | undefined) {
  if (!value || value.length < 4) {
    return undefined
  }

  const [x, y, width, height] = value
  return `x ${x}, y ${y}, 너비 ${width}, 높이 ${height}`
}

function resolveReportImageUrl(imageUrl: string | undefined) {
  if (!imageUrl) {
    return undefined
  }

  if (/^(https?:)?\/\//.test(imageUrl) || imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

function formatRecentDate(value: string | null | undefined) {
  if (!value) {
    return '시간 정보 없음'
  }

  const normalized = value.replace('T', ' ')
  const datePart = normalized.slice(0, 16)
  return datePart ? datePart.replaceAll('-', '.') : value
}

function getLocalImageUrl(locationState: unknown, reportId: string) {
  if (!isRecord(locationState)) {
    return undefined
  }

  const stateReportId = locationState.reportId
  const localImageUrl = locationState.localImageUrl

  if (typeof stateReportId === 'string' && stateReportId !== reportId) {
    return undefined
  }

  return typeof localImageUrl === 'string' && localImageUrl.trim() ? localImageUrl : undefined
}

function buildAgencyLabel(agency: ReportAgencyResult | undefined) {
  if (!agency) {
    return undefined
  }

  return (
    agency.agencyName ??
    agency.roadManagementAgency ??
    agency.departmentName ??
    agency.department ??
    agency.jurisdiction
  )
}

function mapReportToReviewData(report: CitizenReportResponse): AiReviewViewData {
  const reportRecord: Record<string, unknown> = report
  const aiResult =
    getNestedRecord<ReportAiResult>(reportRecord, ['aiResult', 'ai', 'aiReview', 'analysis', 'potholeAnalysis']) ??
    report
  const aiRecord: Record<string, unknown> = aiResult
  const agency = getNestedRecord<ReportAgencyResult>(reportRecord, [
    'jurisdictionResult',
    'agencyResult',
    'agency',
    'responsibleAgency',
  ])
  const detected =
    getBooleanOrString(aiRecord, ['detected', 'isPothole', 'potholeDetected']) ??
    (typeof report.isPothole === 'boolean' ? report.isPothole : undefined)
  const confidenceValue =
    getNumber(aiRecord, ['confidence', 'score', 'probability', 'potholeProbability']) ??
    optionalNumber(report.confidence)
  const potholeProbabilityValue =
    getNumber(aiRecord, ['potholeProbability', 'probability', 'confidence', 'score']) ?? confidenceValue
  const confidence = confidenceValue === undefined ? null : normalizePercent(confidenceValue)
  const potholeProbability =
    potholeProbabilityValue === undefined ? null : normalizePercent(potholeProbabilityValue)
  const severity = getString(aiRecord, ['severity', 'riskLevel', 'level']) ?? optionalString(report.severity)
  const riskScore = getNumber(aiRecord, ['riskScore']) ?? optionalNumber(report.riskScore)
  const estimatedSizeCm =
    getNumber(aiRecord, ['estimatedSizeCm', 'sizeCm', 'diameterCm']) ?? optionalNumber(report.estimatedSizeCm)
  const depthMinCm = getNumber(aiRecord, ['depthMinCm', 'minDepthCm']) ?? optionalNumber(report.depthMinCm)
  const depthMaxCm = getNumber(aiRecord, ['depthMaxCm', 'maxDepthCm']) ?? optionalNumber(report.depthMaxCm)
  const cracks = formatCracks(
    getBooleanOrString(aiRecord, ['cracks', 'hasCracks']) ?? optionalString(report.cracks),
  )
  const shape = formatShape(getString(aiRecord, ['shape']) ?? optionalString(report.shape))
  const bbox = Array.isArray(report.bbox) ? report.bbox : undefined
  const processingTimeMs = getNumber(aiRecord, ['processingTimeMs', 'elapsedMs'])
  const imageUrl = resolveReportImageUrl(getString(reportRecord, ['imageUrl', 'photoUrl', 'image']))
  const agencyLabel = optionalString(report.managingAuthority) ?? buildAgencyLabel(agency)
  const resultLevel = formatSeverity(severity, potholeProbability)
  const detectedText = formatDetected(detected)
  const location = [optionalString(report.address), optionalString(report.locationDetail)].filter(Boolean).join(' · ')
  const capturedAt = optionalString(report.submittedAt) ?? report.createdAt ?? report.reportedAt ?? fallbackReviewData.capturedAt
  const hasAiAnalysis =
    detected !== undefined ||
    confidence !== null ||
    potholeProbability !== null ||
    severity !== undefined ||
    riskScore !== undefined ||
    estimatedSizeCm !== undefined ||
    cracks !== undefined ||
    depthMinCm !== undefined ||
    depthMaxCm !== undefined ||
    shape !== undefined ||
    bbox !== undefined

  const features: AiDetectedFeature[] = [
    {
      id: 'detected',
      label: '포트홀 감지',
      value: detectedText ?? (hasAiAnalysis ? '분석 결과 확인 중' : '분석 대기'),
      severity: detected === true ? 'danger' : 'normal',
      iconName: 'crosshair',
    },
    {
      id: 'confidence',
      label: '신뢰도',
      value: confidence === null ? '분석 대기' : `${confidence}%`,
      score: confidence === null ? undefined : Math.max(1, Math.ceil(confidence / 20)),
      severity: confidence !== null && confidence >= 70 ? 'warning' : 'normal',
      iconName: 'shield',
    },
    {
      id: 'severity',
      label: '위험도',
      value: resultLevel,
      severity: potholeProbability !== null && potholeProbability >= 70 ? 'danger' : 'normal',
      iconName: 'alertTriangle',
    },
  ]

  if (riskScore !== undefined) {
    features.push({
      id: 'risk-score',
      label: '위험 점수',
      value: `${riskScore}/9`,
      severity: riskScore >= 6 ? 'danger' : 'warning',
      iconName: 'shieldAlert',
    })
  }

  if (estimatedSizeCm !== undefined) {
    features.push({
      id: 'estimated-size',
      label: '추정 크기',
      value: `${estimatedSizeCm}cm`,
      severity: 'warning',
      iconName: 'ruler',
    })
  }

  if (cracks) {
    features.push({
      id: 'cracks',
      label: '균열',
      value: cracks,
      severity: cracks === '없음' ? 'normal' : 'warning',
      iconName: 'waves',
    })
  }

  if (depthMinCm !== undefined || depthMaxCm !== undefined) {
    features.push({
      id: 'depth',
      label: '깊이',
      value:
        depthMinCm !== undefined && depthMaxCm !== undefined
          ? `${depthMinCm}~${depthMaxCm}cm`
          : `${depthMinCm ?? depthMaxCm}cm`,
      severity: 'warning',
      iconName: 'ruler',
    })
  }

  if (shape) {
    features.push({
      id: 'shape',
      label: '형태',
      value: shape,
      severity: 'normal',
      iconName: 'listChecks',
    })
  }

  const bboxText = formatBbox(bbox)

  if (bboxText) {
    features.push({
      id: 'bbox',
      label: '탐지 영역',
      value: bboxText,
      severity: 'normal',
      iconName: 'crosshair',
    })
  }

  if (processingTimeMs !== undefined) {
    features.push({
      id: 'processing-time',
      label: '처리 시간',
      value: `${processingTimeMs}ms`,
      severity: 'normal',
      iconName: 'scan',
    })
  }

  if (agencyLabel) {
    features.push({
      id: 'agency',
      label: '담당 기관',
      value: agencyLabel,
      severity: 'normal',
      iconName: 'fileCheck',
    })
  }

  return {
    capturedAt,
    location: location || report.location || agency?.jurisdiction || fallbackReviewData.location,
    potholeProbability,
    confidence,
    resultLevel,
    description:
      getString(aiRecord, ['description', 'summary', 'message']) ??
      report.description ??
      (!hasAiAnalysis
        ? 'AI 분석 결과가 아직 도착하지 않았습니다. 잠시 후 다시 확인해 주세요.'
        : detected === false
          ? '포트홀로 보기 어려운 신고입니다.'
          : '백엔드에서 받은 인공지능 분석 결과입니다.'),
    imageSources: imageUrl ? [imageUrl] : [],
    features,
    isAnalysisPending: !hasAiAnalysis,
  }
}

function mapReportToRecentResult(report: CitizenReportResponse): RecentAiResult {
  const confidence = optionalNumber(report.confidence)
  const percent = confidence === undefined ? 0 : normalizePercent(confidence)
  const imageUrl = resolveReportImageUrl(optionalString(report.imageUrl))
  const location =
    [optionalString(report.address), optionalString(report.locationDetail)].filter(Boolean).join(' · ') ||
    optionalString(report.location) ||
    optionalString(report.managingAuthority) ||
    '위치 정보 없음'

  return {
    id: report.reportId ?? report.id ?? `${location}-${formatRecentDate(report.submittedAt ?? report.createdAt)}`,
    thumbnailSources: imageUrl ? [imageUrl] : [],
    percent,
    level: percentLevel(percent),
    location,
    date: formatRecentDate(report.submittedAt ?? report.createdAt ?? report.reportedAt),
  }
}

function AssetImage({ sources, alt, className, fallback }: AssetImageProps) {
  const [sourceIndex, setSourceIndex] = useState(0)
  const src = sources[sourceIndex]

  if (!src) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setSourceIndex((current) => current + 1)}
    />
  )
}

function BlankImageSpace({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="img"
      aria-label={compact ? '최근 판별 이미지 없음' : '업로드 이미지 없음'}
      className={cn('h-full w-full bg-slate-50', compact && 'rounded-lg')}
    />
  )
}

function UploadedPhotoPanel({
  review,
  onNotice,
}: {
  review: AiReviewViewData
  onNotice: (message: string) => void
}) {
  const navigate = useNavigate()
  const hasImage = review.imageSources.length > 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_44px_rgba(15,40,70,0.07)] sm:p-4">
      <h2 className="mb-4 px-1 text-[19px] font-black tracking-[-0.04em] text-[#07182F]">
        업로드 사진 분석 결과
      </h2>

      <div className="relative h-[280px] overflow-hidden rounded-xl bg-slate-50 shadow-inner sm:h-[360px] xl:h-[390px]">
        <AssetImage
          key={review.imageSources.join('|') || 'empty-upload-image'}
          sources={review.imageSources}
          alt="AI가 분석한 포트홀 사진"
          className="h-full w-full object-cover"
          fallback={<BlankImageSpace />}
        />

        <div className="absolute inset-x-3 top-3 flex flex-col gap-2 sm:inset-x-5 sm:top-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-full truncate rounded-lg bg-black/55 px-3 py-2 text-[12px] font-bold text-white backdrop-blur sm:w-fit sm:px-4 sm:text-[13px]">
            촬영 일시&nbsp;&nbsp; {review.capturedAt}
          </div>
          <button
            type="button"
            onClick={() => onNotice(hasImage ? '현재 업로드된 원본 이미지를 표시 중입니다.' : '표시할 원본 이미지가 없습니다.')}
            className="flex h-10 w-fit items-center gap-2 rounded-lg bg-white/95 px-4 text-[13px] font-black text-slate-800 shadow-md transition hover:bg-blue-50"
          >
            원본 보기
            <ExternalLink size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 sm:inset-x-5 sm:bottom-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-full truncate rounded-lg bg-black/55 px-3 py-2 text-[12px] font-bold text-white backdrop-blur sm:w-fit sm:px-4 sm:text-[13px]">
            위치&nbsp;&nbsp; {review.location}
          </div>
          <button
            type="button"
            onClick={() => navigate('/report')}
            className="flex h-10 w-fit items-center gap-2 rounded-lg bg-white/95 px-4 text-[13px] font-black text-slate-800 shadow-md transition hover:bg-blue-50"
          >
            <Upload size={16} aria-hidden="true" />
            다른 사진 업로드
          </button>
        </div>
      </div>
    </section>
  )
}

function ConfidenceGauge({ value }: { value: number | null }) {
  const radius = 55
  const circumference = 2 * Math.PI * radius
  const percentValue = value ?? 0
  const dashOffset = circumference * (1 - percentValue / 100)

  return (
    <div className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-4 text-center text-[13px] font-black tracking-[-0.03em] text-slate-600">
        신뢰도
      </p>

      <div className="relative flex h-[138px] w-[138px] items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#DCFCE7"
            strokeWidth="11"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#18B977"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        <span className="relative text-[32px] font-black tracking-[-0.05em] text-[#07182F]">
          {value === null ? '대기' : `${value}%`}
        </span>
      </div>

      <p className="mt-2 text-[13px] font-bold text-slate-600">
        {value === null ? '분석 대기' : '높은 신뢰도'}
      </p>
    </div>
  )
}

function ResultCard({ review }: { review: AiReviewViewData }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,40,70,0.04)]">
      <h3 className="text-[18px] font-black tracking-[-0.04em] text-[#07182F]">
        AI 판별 결과
      </h3>

      <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,1fr)_190px] lg:grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_190px]">
        <div>
          <p className="text-[21px] font-black tracking-[-0.04em] text-[#07182F]">
            포트홀 가능성
          </p>

          {review.potholeProbability === null ? (
            <div className="mt-5 flex min-h-[78px] items-center">
              <span className="text-[42px] font-black leading-none tracking-[-0.05em] text-blue-700">
                분석 대기
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[72px] font-black leading-none tracking-[-0.06em] text-blue-700">
                {review.potholeProbability}
              </span>
              <span className="mb-2 text-[34px] font-black text-blue-700">%</span>
            </div>
          )}

          <span className="mt-3 inline-flex rounded-full bg-blue-100 px-4 py-1 text-[13px] font-black text-blue-700">
            {review.resultLevel}
          </span>

          <p className="mt-4 text-[13px] font-semibold tracking-[-0.03em] text-slate-500">
            {review.description}
          </p>
        </div>

        <ConfidenceGauge value={review.confidence} />
      </div>
    </section>
  )
}

function FeatureRow({ feature }: { feature: AiDetectedFeature }) {
  const Icon = iconMap[feature.iconName ?? 'scan']
  const isDanger = feature.severity === 'danger'
  const score = feature.score

  return (
    <div className="grid min-h-[46px] grid-cols-[28px_72px_minmax(0,1fr)] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:grid-cols-[30px_90px_minmax(0,1fr)]">
      <Icon size={18} className={isDanger ? 'text-red-600' : 'text-slate-600'} aria-hidden="true" />

      <span className="text-[13px] font-black tracking-[-0.03em] text-slate-700">
        {feature.label}
      </span>

      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        {typeof score === 'number' && <FeatureScoreDots label={feature.label} score={score} />}

        {isDanger && <AlertTriangle size={15} fill="currentColor" className="text-red-600" aria-hidden="true" />}

        <span className={cn('text-[13px] font-black tracking-[-0.03em]', isDanger ? 'text-red-600' : 'text-blue-700')}>
          {feature.value}
        </span>
      </div>
    </div>
  )
}

function FeatureScoreDots({ label, score }: { label: string; score: number }) {
  return (
    <span className="flex gap-1" aria-label={`${label} 점수 ${score}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            index < score ? 'bg-blue-700' : 'bg-slate-200',
          )}
        />
      ))}
    </span>
  )
}

function FeatureAnalysisCard({ features }: { features: AiDetectedFeature[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,40,70,0.04)]">
      <h3 className="text-[18px] font-black tracking-[-0.04em] text-[#07182F]">
        탐지된 주요 특성
      </h3>

      <div className="mt-5 space-y-2">
        {features.map((feature) => (
          <FeatureRow key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  )
}

function RecommendationActionButton({
  action,
  onSelect,
}: {
  action: AiRecommendedAction
  onSelect: (action: AiRecommendedAction) => void
}) {
  const Icon = iconMap[action.iconName ?? 'shield']
  const isPrimary = action.variant === 'primary'

  return (
    <button
      type="button"
      onClick={() => onSelect(action)}
      className={cn(
        'flex min-h-[92px] items-center justify-center gap-4 rounded-xl px-5 text-left transition focus-visible:outline-blue-400',
        isPrimary
          ? 'bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)]'
          : 'border border-blue-200 bg-white text-slate-700 shadow-sm hover:bg-blue-50',
      )}
    >
      <Icon size={34} className={isPrimary ? 'text-white' : 'text-slate-700'} aria-hidden="true" />
      <span className="min-w-0">
        <strong className="block text-[17px] font-black tracking-[-0.04em]">{action.title}</strong>
        <span className={cn('mt-1 block text-[13px] font-semibold', isPrimary ? 'text-white' : 'text-slate-500')}>
          {action.description}
        </span>
      </span>
    </button>
  )
}

function RecommendedActions({
  notice,
  reportId,
  onNotice,
}: {
  notice: string
  reportId: string
  onNotice: (message: string) => void
}) {
  const navigate = useNavigate()

  const handleSelect = (action: AiRecommendedAction) => {
    if (action.actionType === 'confirm' && reportId) {
      navigate(`/agency?reportId=${encodeURIComponent(reportId)}`)
      return
    }

    if (action.route) {
      navigate(action.route)
      return
    }

    onNotice('허위 신고 의심은 데모 상태로만 표시되며 실제 접수 변경은 없습니다.')
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,40,70,0.04)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <h3 className="text-[18px] font-black tracking-[-0.04em] text-[#07182F]">
          AI 분석 기반 권장 조치
        </h3>
        <p className="text-[12px] font-semibold text-slate-500">
          분석 결과를 바탕으로 적절한 조치를 선택해 주세요.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {aiRecommendedActions.map((action) => (
          <RecommendationActionButton key={action.id} action={action} onSelect={handleSelect} />
        ))}
      </div>

      <p className="mt-4 text-[12px] font-semibold tracking-[-0.03em] text-slate-500">
        신고 확정 시 관할기관 안내 · 보상 청구 화면으로 이동합니다.
      </p>
      {notice && (
        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-[12px] font-bold text-blue-700" aria-live="polite">
          {notice}
        </p>
      )}
    </section>
  )
}

function ProcessPanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,40,70,0.06)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-black tracking-[-0.04em] text-[#07182F]">
          AI 분석 처리 과정
        </h2>

        <span className="shrink-0 rounded-full bg-green-100 px-4 py-1.5 text-[12px] font-black text-green-700">
          분석 완료
        </span>
      </div>

      <div className="space-y-5">
        {aiAnalysisSteps.map((step, index) => {
          const Icon = iconMap[step.iconName ?? 'scan']

          return (
            <div key={step.id} className="relative grid grid-cols-[48px_minmax(0,1fr)_24px] gap-4">
              {index !== aiAnalysisSteps.length - 1 && (
                <div className="absolute left-6 top-[48px] h-[32px] border-l-2 border-dotted border-blue-200" />
              )}

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <Icon size={22} aria-hidden="true" />
              </div>

              <div className="pt-1">
                <p className="text-[14px] font-black tracking-[-0.03em] text-[#07182F]">
                  {step.title}
                </p>
                <p className="mt-1 text-[12px] font-semibold tracking-[-0.03em] text-slate-500">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 text-green-600">
                <Check size={19} strokeWidth={3} aria-label={step.status === 'complete' ? '완료' : '대기'} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function levelClass(percent: number) {
  if (percent >= 80) {
    return 'text-blue-700'
  }

  if (percent >= 30) {
    return 'text-slate-700'
  }

  return 'text-green-600'
}

function RecentResultItem({ item, index }: { item: RecentAiResult; index: number }) {
  return (
    <article
      className={cn(
        'grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-xl border bg-white p-2',
        index === 0 ? 'border-blue-400 shadow-[0_10px_22px_rgba(0,96,210,0.1)]' : 'border-slate-200',
      )}
    >
      <div className="h-[66px] w-[76px] overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
        <AssetImage
          key={`recent-${item.id}`}
          sources={item.thumbnailSources}
          alt={`${item.location} AI 판별 결과 사진`}
          className="h-full w-full object-cover"
          fallback={<BlankImageSpace compact />}
        />
      </div>

      <div className="min-w-0 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-black tracking-[-0.05em] text-blue-700">
            {item.percent}%
          </span>
          <span className={cn('text-[12px] font-black', levelClass(item.percent))}>
            {item.level}
          </span>
        </div>

        <p className="mt-1 truncate text-[12px] font-bold tracking-[-0.03em] text-slate-600">
          {item.location}
        </p>
        <p className="mt-1 text-[12px] font-semibold text-slate-500">{item.date}</p>
      </div>
    </article>
  )
}

function RecentResultsPanel({ onNotice }: { onNotice: (message: string) => void }) {
  const [recentResults, setRecentResults] = useState<RecentAiResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    getCitizenReports(4)
      .then((reports) => {
        if (!isActive) return
        setRecentResults(reports.map(mapReportToRecentResult))
      })
      .catch((error) => {
        if (!isActive) return
        const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        setRecentResults([])
        onNotice(`최근 판별 결과를 불러오지 못했습니다. (${message})`)
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [onNotice])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,40,70,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-black tracking-[-0.04em] text-[#07182F]">
          최근 판별 결과
        </h2>

        <button
          type="button"
          onClick={() => onNotice('전체 보기 화면은 데모 범위에 포함되어 있지 않습니다.')}
          className="flex items-center gap-1 text-[12px] font-black text-blue-700 transition hover:text-blue-500"
        >
          전체 보기
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-[13px] font-bold text-slate-500">
            최근 판별 결과를 불러오는 중입니다.
          </div>
        ) : recentResults.length > 0 ? (
          recentResults.map((item, index) => (
            <RecentResultItem key={item.id} item={item} index={index} />
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-[13px] font-bold text-slate-500">
            저장된 판별 결과가 없습니다.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onNotice('더 많은 기록 보기 기능은 데모 화면에서만 표시됩니다.')}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[14px] font-black text-blue-700 transition hover:bg-blue-50"
      >
        더 많은 기록 보기
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </section>
  )
}

export function AiReviewPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const reportId = searchParams.get('reportId') ?? ''
  const localImageUrl = getLocalImageUrl(location.state, reportId)
  const [notice, setNotice] = useState('')
  const [reportLoadState, setReportLoadState] = useState<ReportLoadState>({
    reportId: '',
    reviewData: null,
    notice: '',
  })
  const currentReportLoadState = reportLoadState.reportId === reportId ? reportLoadState : null
  const review =
    currentReportLoadState?.reviewData ??
    (reportId && !currentReportLoadState ? createPendingReviewData(localImageUrl) : fallbackReviewData)
  const displayApiNotice = reportId
    ? currentReportLoadState?.notice ?? '신고 분석 결과를 불러오는 중입니다.'
    : '신고 번호가 없어 데모 분석 결과를 표시합니다.'

  useEffect(() => {
    let isActive = true
    let retryTimer: ReturnType<typeof window.setTimeout> | undefined
    let pollAttempts = 0

    if (!reportId) {
      return () => {
        isActive = false
      }
    }

    const clearRetryTimer = () => {
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer)
        retryTimer = undefined
      }
    }

    const loadReport = () => {
      getCitizenReport(reportId)
        .then((report) => {
          if (!isActive) return
          const reportReviewData = mapReportToReviewData(report)
          const shouldPollAgain =
            reportReviewData.isAnalysisPending && pollAttempts < AI_RESULT_MAX_POLL_ATTEMPTS

          setReportLoadState({
            reportId,
            reviewData: {
              ...reportReviewData,
              imageSources: [
                ...(localImageUrl ? [localImageUrl] : []),
                ...reportReviewData.imageSources,
              ],
            },
            notice: reportReviewData.isAnalysisPending
              ? shouldPollAgain
                ? '백엔드가 아직 AI 결과를 내려주지 않아 자동으로 다시 확인하고 있습니다.'
                : '백엔드 응답에 AI 분석 결과가 없어 대기 상태로 표시합니다.'
              : '백엔드에서 불러온 실제 신고 분석 결과입니다.',
          })

          clearRetryTimer()

          if (shouldPollAgain) {
            pollAttempts += 1
            retryTimer = window.setTimeout(loadReport, AI_RESULT_POLL_INTERVAL_MS)
          }
        })
        .catch((error) => {
          if (!isActive) return

          const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          setReportLoadState({
            reportId,
            reviewData: null,
            notice: `백엔드 응답을 불러오지 못해 데모 분석 결과를 표시합니다. (${message})`,
          })
        })
    }

    loadReport()

    return () => {
      isActive = false
      clearRetryTimer()
    }
  }, [localImageUrl, reportId])

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] font-black tracking-[-0.05em] text-[#07182F] sm:text-[34px]">
            AI 사진 판별
          </h1>
          <p className="mt-2 text-[15px] font-semibold tracking-[-0.03em] text-slate-500">
            업로드한 사진을 AI가 분석하여 포트홀 가능성과 상태를 판단합니다.
          </p>
        </div>
      </div>

      {displayApiNotice && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-5 text-blue-700" aria-live="polite">
          {displayApiNotice}
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <UploadedPhotoPanel review={review} onNotice={setNotice} />

          <div className="grid gap-4 lg:grid-cols-2">
            <ResultCard review={review} />
            <FeatureAnalysisCard features={review.features} />
          </div>

          <RecommendedActions notice={notice} reportId={reportId} onNotice={setNotice} />
        </div>

        <aside className="grid min-w-0 gap-5 lg:grid-cols-2 xl:block xl:space-y-5">
          <ProcessPanel />
          <RecentResultsPanel onNotice={setNotice} />
        </aside>
      </div>
    </div>
  )
}
