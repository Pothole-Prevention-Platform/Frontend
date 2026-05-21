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
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getCitizenReport } from '../api/reportApi'
import {
  aiAnalysisSteps,
  aiDetectedFeatures,
  aiRecommendedActions,
  aiReviewResult,
  recentAiResults,
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
  potholeProbability: number
  confidence: number
  resultLevel: string
  description: string
  imageSources: string[]
  features: AiDetectedFeature[]
}

const fallbackReviewData: AiReviewViewData = {
  capturedAt: aiReviewResult.capturedAt,
  location: aiReviewResult.location,
  potholeProbability: aiReviewResult.potholeProbability,
  confidence: aiReviewResult.confidence,
  resultLevel: aiReviewResult.resultLevel,
  description: aiReviewResult.description,
  imageSources: aiReviewResult.imageSources,
  features: aiDetectedFeatures,
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

function formatSeverity(severity: string | undefined, percent: number) {
  if (!severity) {
    if (percent >= 90) return '매우 높음'
    if (percent >= 70) return '높음'
    if (percent >= 40) return '보통'
    return '낮음'
  }

  const severityMap: Record<string, string> = {
    critical: '매우 높음',
    high: '높음',
    medium: '보통',
    low: '낮음',
  }

  return severityMap[severity.toLowerCase()] ?? severity
}

function formatCracks(value: boolean | string | undefined) {
  if (typeof value === 'boolean') {
    return value ? '있음' : '없음'
  }

  return value
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
  const detected = getBooleanOrString(aiRecord, ['detected', 'isPothole', 'potholeDetected'])
  const confidenceValue = getNumber(aiRecord, ['confidence', 'score', 'probability', 'potholeProbability']) ?? 0
  const confidence = normalizePercent(confidenceValue)
  const potholeProbability = normalizePercent(
    getNumber(aiRecord, ['potholeProbability', 'probability', 'confidence', 'score']) ?? confidence,
  )
  const severity = getString(aiRecord, ['severity', 'riskLevel', 'level']) ?? report.severity
  const estimatedSizeCm = getNumber(aiRecord, ['estimatedSizeCm', 'sizeCm', 'diameterCm'])
  const depthMinCm = getNumber(aiRecord, ['depthMinCm', 'minDepthCm'])
  const depthMaxCm = getNumber(aiRecord, ['depthMaxCm', 'maxDepthCm'])
  const cracks = formatCracks(getBooleanOrString(aiRecord, ['cracks', 'hasCracks']))
  const shape = getString(aiRecord, ['shape'])
  const processingTimeMs = getNumber(aiRecord, ['processingTimeMs', 'elapsedMs'])
  const imageUrl = getString(reportRecord, ['imageUrl', 'photoUrl', 'image'])
  const agencyLabel = buildAgencyLabel(agency)
  const resultLevel = formatSeverity(severity, potholeProbability)
  const detectedText = typeof detected === 'boolean' ? (detected ? '감지됨' : '감지되지 않음') : detected

  const features: AiDetectedFeature[] = [
    {
      id: 'detected',
      label: '포트홀 감지',
      value: detectedText ?? '분석 결과 확인 중',
      severity: detected === false ? 'normal' : 'danger',
      iconName: 'crosshair',
    },
    {
      id: 'confidence',
      label: '신뢰도',
      value: `${confidence}%`,
      score: Math.max(1, Math.ceil(confidence / 20)),
      severity: confidence >= 70 ? 'warning' : 'normal',
      iconName: 'shield',
    },
    {
      id: 'severity',
      label: '위험도',
      value: resultLevel,
      severity: potholeProbability >= 70 ? 'danger' : 'warning',
      iconName: 'alertTriangle',
    },
  ]

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
    capturedAt: report.createdAt ?? report.reportedAt ?? fallbackReviewData.capturedAt,
    location: report.address ?? report.location ?? agency?.jurisdiction ?? fallbackReviewData.location,
    potholeProbability,
    confidence,
    resultLevel,
    description:
      getString(aiRecord, ['description', 'summary', 'message']) ??
      report.description ??
      '백엔드에서 받은 인공지능 분석 결과입니다.',
    imageSources: imageUrl ? [imageUrl, ...aiReviewResult.imageSources] : aiReviewResult.imageSources,
    features,
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

function FallbackRoadImage({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="img"
      aria-label={compact ? '최근 AI 판별 포트홀 사진 대체 이미지' : 'AI가 분석한 포트홀 사진 대체 이미지'}
      className="relative h-full w-full overflow-hidden bg-slate-900"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_72%,#525252_0%,#343434_34%,#181818_58%,#0f172a_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[44%] bg-gradient-to-b from-slate-500/80 via-slate-500/40 to-transparent blur-[2px]" />
      <div className="absolute left-[-16%] top-[31%] h-[17%] w-[138%] rotate-[-7deg] bg-slate-700/80" />
      <div className="absolute left-[-14%] top-[69%] h-[25%] w-[138%] rotate-[6deg] bg-slate-800/90" />
      <div className="absolute right-[7%] top-[33%] h-[4%] w-[60%] rotate-[-7deg] rounded-full bg-yellow-400/75 blur-[1px]" />
      <div className="absolute left-1/2 top-[52%] h-[33%] w-[55%] -translate-x-1/2 rounded-[50%] bg-slate-950 shadow-[inset_0_20px_34px_rgba(0,0,0,0.8)]" />
      <div className="absolute left-1/2 top-[58%] h-[19%] w-[33%] -translate-x-1/2 rounded-[50%] bg-slate-500/70 blur-sm" />
      {!compact && (
        <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-slate-600 shadow-sm">
          데모 이미지
        </div>
      )}
    </div>
  )
}

function AnalysisDetectionOverlay() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[52%] h-[34%] w-[56%] -translate-x-1/2 rounded-[48%_52%_43%_57%] border-[3px] border-blue-500 bg-blue-500/30 shadow-[0_0_42px_rgba(37,99,235,0.75)]">
      <div className="absolute inset-0 rounded-[48%_52%_43%_57%] bg-[linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:12px_12px]" />
      <div className="absolute left-[18%] top-[24%] h-[48%] w-[58%] rounded-[50%] bg-blue-300/30 blur-sm" />
    </div>
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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_44px_rgba(15,40,70,0.07)] sm:p-4">
      <h2 className="mb-4 px-1 text-[19px] font-black tracking-[-0.04em] text-[#07182F]">
        업로드 사진 분석 결과
      </h2>

      <div className="relative h-[280px] overflow-hidden rounded-xl bg-slate-900 shadow-inner sm:h-[360px] xl:h-[390px]">
        <AssetImage
          sources={review.imageSources}
          alt="AI가 분석한 포트홀 사진"
          className="h-full w-full object-cover"
          fallback={<FallbackRoadImage />}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45" />
        <AnalysisDetectionOverlay />

        <div className="absolute inset-x-3 top-3 flex flex-col gap-2 sm:inset-x-5 sm:top-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-full truncate rounded-lg bg-black/55 px-3 py-2 text-[12px] font-bold text-white backdrop-blur sm:w-fit sm:px-4 sm:text-[13px]">
            촬영 일시&nbsp;&nbsp; {review.capturedAt}
          </div>
          <button
            type="button"
            onClick={() => onNotice('원본 보기 기능은 데모 화면에서만 표시됩니다.')}
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

function ConfidenceGauge({ value }: { value: number }) {
  const radius = 55
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - value / 100)

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
          {value}%
        </span>
      </div>

      <p className="mt-2 text-[13px] font-bold text-slate-600">높은 신뢰도</p>
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

          <div className="mt-3 flex items-end gap-2">
            <span className="text-[72px] font-black leading-none tracking-[-0.06em] text-blue-700">
              {review.potholeProbability}
            </span>
            <span className="mb-2 text-[34px] font-black text-blue-700">%</span>
          </div>

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
        신고 확정 시 데모 흐름에서는 관할기관 안내 · 보상 청구 화면으로 이동합니다.
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
          sources={item.thumbnailSources}
          alt={`${item.location} AI 판별 결과 사진`}
          className="h-full w-full object-cover"
          fallback={<FallbackRoadImage compact />}
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
        {recentAiResults.map((item, index) => (
          <RecentResultItem key={item.id} item={item} index={index} />
        ))}
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
  const reportId = searchParams.get('reportId') ?? ''
  const [notice, setNotice] = useState('')
  const [apiNotice, setApiNotice] = useState('')
  const [reviewData, setReviewData] = useState<AiReviewViewData | null>(null)
  const review = reviewData ?? fallbackReviewData

  useEffect(() => {
    let isActive = true

    if (!reportId) {
      setReviewData(null)
      setApiNotice('신고 번호가 없어 데모 분석 결과를 표시합니다.')
      return () => {
        isActive = false
      }
    }

    setApiNotice('신고 분석 결과를 불러오는 중입니다.')

    getCitizenReport(reportId)
      .then((report) => {
        if (!isActive) return

        setReviewData(mapReportToReviewData(report))
        setApiNotice('백엔드에서 불러온 실제 신고 분석 결과입니다.')
      })
      .catch((error) => {
        if (!isActive) return

        const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
        setReviewData(null)
        setApiNotice(`백엔드 응답을 불러오지 못해 데모 분석 결과를 표시합니다. (${message})`)
      })

    return () => {
      isActive = false
    }
  }, [reportId])

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

      {apiNotice && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-bold leading-5 text-blue-700" aria-live="polite">
          {apiNotice}
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
