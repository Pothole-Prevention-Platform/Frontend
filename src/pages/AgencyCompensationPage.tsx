import { type ChangeEvent, type ReactNode, useState } from 'react'
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  Info,
  Landmark,
  LocateFixed,
  MapPin,
  Maximize2,
  Megaphone,
  Minus,
  Phone,
  Plus,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  createClaimDraft,
  downloadClaimPdf,
  getClaim,
  submitClaim,
  uploadClaimAttachment,
} from '../api/claimApi'
import {
  accidentInfo,
  agencyContacts,
  agencyLookupResult,
  claimChecklistItems,
  claimDocumentPreview,
  compensationSteps,
  evidencePhotos,
  vehicleInfo,
} from '../data/mockData'
import type { ClaimChecklistItem, EvidencePhoto } from '../types'
import type { AttachmentResponse, ChecklistResponse, ClaimAttachmentType, ClaimResponse } from '../types/claim'
import { cn } from '../utils/cn'

type ModeKey = 'agency' | 'claim'

type AssetImageProps = {
  sources: string[]
  alt: string
  className: string
  fallback: ReactNode
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

function ModeCard({
  active,
  description,
  icon,
  onClick,
  title,
}: {
  active: boolean
  description: string
  icon: ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex min-h-[78px] items-center gap-4 rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40',
        active && 'border-blue-600 shadow-[0_14px_32px_rgba(0,95,220,0.1)]',
      )}
    >
      <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600')}>
        {icon}
      </span>
      <span className="min-w-0">
        <strong className="block text-[16px] font-black text-[#07182F]">{title}</strong>
        <span className="mt-1 block text-[13px] font-semibold leading-5 text-slate-500">{description}</span>
      </span>
    </button>
  )
}

function MapFallback() {
  return (
    <div role="img" aria-label="사고 위치 지도 미리보기" className="relative h-full w-full overflow-hidden bg-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute left-[-45px] top-10 h-12 w-[560px] rotate-[-22deg] rounded-full bg-blue-100 shadow-[0_0_0_10px_rgba(255,255,255,0.65)]" />
      <div className="absolute left-[-35px] top-[138px] h-14 w-[570px] rotate-[17deg] rounded-full bg-slate-200 shadow-[0_0_0_10px_rgba(255,255,255,0.6)]" />
      <div className="absolute left-[60px] top-[-55px] h-[420px] w-8 rotate-[23deg] rounded-full bg-blue-100 shadow-[0_0_0_8px_rgba(255,255,255,0.5)]" />
      <div className="absolute right-[-30px] top-3 h-[330px] w-[95px] rotate-[15deg] bg-green-200/80" />
    </div>
  )
}

function EvidenceFallback({ type }: { type: EvidencePhoto['fallbackType'] }) {
  if (type === 'wheel') {
    return (
      <div role="img" aria-label="차량 휠 손상 사진 대체 이미지" className="relative h-full w-full bg-slate-300">
        <div className="absolute left-[18%] top-[18%] h-[64%] w-[64%] rounded-full bg-slate-800" />
        <div className="absolute left-[31%] top-[31%] h-[38%] w-[38%] rounded-full bg-slate-300" />
        <div className="absolute left-[45%] top-[45%] h-[12%] w-[12%] rounded-full bg-slate-700" />
      </div>
    )
  }

  if (type === 'tire') {
    return (
      <div role="img" aria-label="타이어 손상 사진 대체 이미지" className="relative h-full w-full bg-slate-300">
        <div className="absolute left-[12%] top-0 h-full w-[18%] bg-slate-700" />
        <div className="absolute left-[42%] top-0 h-full w-[18%] bg-slate-500" />
        <div className="absolute left-[72%] top-0 h-full w-[16%] bg-slate-700" />
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label="도로 파손 부위 사진 대체 이미지"
      className="h-full w-full bg-[radial-gradient(circle_at_45%_58%,#1f2937_0_16%,#777_17%_42%,#cbd5e1_43%)]"
    />
  )
}

function DocumentFallback() {
  return (
    <div role="img" aria-label="보상 청구서 미리보기" className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="rounded bg-blue-50 px-2 py-2 text-center text-[8px] font-black text-blue-800">
        도로관리기관 보상 청구서
      </div>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="mt-2 h-2 rounded bg-slate-200" />
      ))}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-8 rounded border border-slate-200" />
        <div className="h-8 rounded border border-slate-200" />
      </div>
      <div className="mt-auto h-8 rounded bg-slate-100" />
    </div>
  )
}

function StatusBadge({ status }: { status: ClaimChecklistItem['status'] }) {
  return (
    <span className={cn('rounded-full px-3 py-1 text-[11px] font-black', status === '완료' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
      {status}
    </span>
  )
}

function getClaimId(claim: ClaimResponse | null) {
  return claim?.claimId ?? claim?.id ?? ''
}

const attachmentTypeOptions: Array<{ label: string; value: ClaimAttachmentType }> = [
  { label: '피해 사진', value: 'PHOTO_DAMAGE' },
  { label: '수리 견적서', value: 'REPAIR_ESTIMATE' },
  { label: '통장 사본', value: 'BANKBOOK' },
  { label: '신분증 사본', value: 'ID_CARD' },
  { label: '기타 자료', value: 'OTHER' },
]

const claimStatusLabels: Record<string, string> = {
  DRAFT: '초안',
  SUBMITTED: '제출 완료',
  ACCEPTED: '승인',
  REJECTED: '반려',
}

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '-'
  }

  return `${value.toLocaleString('ko-KR')}원`
}

function toApiDateTime(value: string) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function getChecklistItems(checklist: ChecklistResponse | null | undefined): ClaimChecklistItem[] {
  if (!checklist) {
    return claimChecklistItems
  }

  return [
    { id: 'claim-form', title: '보상 청구서 (기본 정보)', status: checklist.claimForm ? '완료' : '준비 중' },
    { id: 'incident-statement', title: '사고 경위서', status: checklist.incidentStatement ? '완료' : '준비 중' },
    { id: 'damage-photos', title: '피해 사진', status: checklist.damagePhotos ? '완료' : '준비 중' },
    { id: 'repair-estimate', title: '수리 견적서', status: checklist.repairEstimate ? '완료' : '준비 중' },
    { id: 'bankbook-copy', title: '통장 사본', status: checklist.bankbook ? '완료' : '준비 중' },
    { id: 'id-copy', title: '신분증 사본', status: checklist.idCard ? '완료' : '준비 중' },
  ]
}

function mergeUploadedAttachment(claim: ClaimResponse | null, attachment: AttachmentResponse) {
  if (!claim) {
    return claim
  }

  return {
    ...claim,
    attachments: [...(claim.attachments ?? []), attachment],
  }
}

export function AgencyCompensationPage() {
  const [searchParams] = useSearchParams()
  const reportId = searchParams.get('reportId') ?? ''
  const [activeMode, setActiveMode] = useState<ModeKey>('agency')
  const [photos, setPhotos] = useState(evidencePhotos)
  const [documentPage, setDocumentPage] = useState(claimDocumentPreview.currentPage)
  const [notice, setNotice] = useState('')
  const [claim, setClaim] = useState<ClaimResponse | null>(null)
  const [incidentAt, setIncidentAt] = useState('')
  const [incidentType, setIncidentType] = useState(accidentInfo.accidentType)
  const [damageDescription, setDamageDescription] = useState('포트홀 충격으로 차량 타이어와 휠에 손상이 발생했습니다.')
  const [estimatedCost, setEstimatedCost] = useState('350000')
  const [vehicleModel, setVehicleModel] = useState(vehicleInfo.model)
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(vehicleInfo.plateNumber)
  const [vehicleYear, setVehicleYear] = useState(vehicleInfo.year)
  const [insurer, setInsurer] = useState(vehicleInfo.insuranceCompany)
  const [contact, setContact] = useState(vehicleInfo.phone)
  const [attachmentType, setAttachmentType] = useState<ClaimAttachmentType>('PHOTO_DAMAGE')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [isCreatingClaim, setIsCreatingClaim] = useState(false)
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const navigate = useNavigate()
  const claimId = getClaimId(claim)
  const isDraftClaim = !claim || claim.status === 'DRAFT'
  const displayChecklistItems = getChecklistItems(claim?.checklist)
  const displayClaimStatus = claim?.status ? claimStatusLabels[claim.status] ?? claim.status : '초안 생성 전'

  const vehicleFields = [
    { label: '차량 번호', value: claim?.vehiclePlateNumber ?? vehiclePlateNumber },
    { label: '차종', value: claim?.vehicleModel ?? vehicleModel },
    { label: '연식', value: claim?.vehicleYear ? String(claim.vehicleYear) : vehicleYear },
    { label: '보험사', value: claim?.insurer ?? insurer },
  ]

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAttachmentFile(event.target.files?.[0] ?? null)
  }

  const handleCreateClaimDraft = async () => {
    const parsedEstimatedCost = Number.parseInt(estimatedCost.replace(/[^\d]/g, ''), 10)
    const parsedVehicleYear = Number.parseInt(vehicleYear.replace(/[^\d]/g, ''), 10)

    if (!reportId) {
      setNotice('신고 번호가 없어 청구 초안을 만들 수 없습니다. AI 판별 화면에서 보상 청구하기를 눌러 이동해 주세요.')
      return
    }

    if (!damageDescription.trim()) {
      setNotice('피해 내용을 입력해 주세요.')
      return
    }

    if (!Number.isFinite(parsedEstimatedCost) || parsedEstimatedCost <= 0) {
      setNotice('예상 수리비를 숫자로 입력해 주세요.')
      return
    }

    if (vehicleYear.trim() && (!Number.isFinite(parsedVehicleYear) || parsedVehicleYear < 1900)) {
      setNotice('차량 연식은 1900년 이후 숫자로 입력해 주세요.')
      return
    }

    setIsCreatingClaim(true)
    setNotice('')

    try {
      const createdClaim = await createClaimDraft({
        reportId,
        incidentAt: toApiDateTime(incidentAt),
        incidentType: incidentType.trim() || undefined,
        damageDescription: damageDescription.trim(),
        estimatedCost: parsedEstimatedCost,
        vehicleInfo: {
          model: vehicleModel.trim() || undefined,
          plateNumber: vehiclePlateNumber.trim() || undefined,
          year: Number.isFinite(parsedVehicleYear) ? parsedVehicleYear : undefined,
          insurer: insurer.trim() || undefined,
          contact: contact.trim() || undefined,
        },
      })

      setClaim(createdClaim)
      setActiveMode('claim')
      setNotice('보상 청구 초안이 생성되었습니다. 필요한 첨부자료를 추가한 뒤 제출해 주세요.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setNotice(`청구 초안 생성에 실패했습니다. (${message})`)
    } finally {
      setIsCreatingClaim(false)
    }
  }

  const handleUploadAttachment = async () => {
    if (!claimId) {
      setNotice('먼저 보상 청구 초안을 생성해 주세요.')
      return
    }

    if (!isDraftClaim) {
      setNotice('이미 제출된 청구에는 첨부 파일을 추가할 수 없습니다.')
      return
    }

    if (!attachmentFile) {
      setNotice('업로드할 첨부 파일을 선택해 주세요.')
      return
    }

    setIsUploadingAttachment(true)
    setNotice('')

    try {
      const uploadedAttachment = await uploadClaimAttachment({
        claimId,
        attachmentType,
        file: attachmentFile,
      })

      try {
        const refreshedClaim = await getClaim(claimId)
        setClaim(refreshedClaim)
      } catch {
        setClaim((currentClaim) => mergeUploadedAttachment(currentClaim, uploadedAttachment))
      }

      setAttachmentFile(null)
      setNotice('첨부 파일이 업로드되었습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setNotice(`첨부 파일 업로드에 실패했습니다. (${message})`)
    } finally {
      setIsUploadingAttachment(false)
    }
  }

  const handleSubmitClaim = async () => {
    if (!claimId) {
      setNotice('먼저 보상 청구 초안을 생성해 주세요.')
      return
    }

    if (!isDraftClaim) {
      setNotice('이미 제출된 청구입니다.')
      return
    }

    setIsSubmittingClaim(true)
    setNotice('')

    try {
      const submittedClaim = await submitClaim(claimId)
      setClaim(submittedClaim)
      setNotice('보상 청구가 제출되었습니다. 담당 기관 확인 후 진행됩니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setNotice(`보상 청구 제출에 실패했습니다. (${message})`)
    } finally {
      setIsSubmittingClaim(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!claimId) {
      setNotice('먼저 보상 청구 초안을 생성해 주세요.')
      return
    }

    setIsDownloadingPdf(true)
    setNotice('')

    try {
      const pdfBlob = await downloadClaimPdf(claimId)
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `claim_${claimId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(pdfUrl)
      setNotice('문서 다운로드를 시작했습니다.')
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setNotice(`문서 다운로드에 실패했습니다. (${message})`)
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div className="min-w-0">
      <div>
        <h1 className="text-[30px] font-black text-[#07182F] sm:text-[34px]">관할기관 안내 · 보상 청구</h1>
        <p className="mt-2 text-[15px] font-semibold leading-6 text-slate-500">
          사고 발생 위치의 관할기관을 안내하고, 보상 청구를 도와드립니다.
        </p>
      </div>

      <div className="mt-6 grid gap-2 md:grid-cols-2">
        <ModeCard
          active={activeMode === 'agency'}
          icon={<Landmark size={24} aria-hidden="true" />}
          title="관할기관 안내"
          description="사고 위치의 관할기관 및 담당 부서를 안내해드립니다."
          onClick={() => setActiveMode('agency')}
        />
        <ModeCard
          active={activeMode === 'claim'}
          icon={<FileCheck2 size={24} aria-hidden="true" />}
          title="보상 청구"
          description="보상 청구에 필요한 서류 준비와 제출을 도와드립니다."
          onClick={() => setActiveMode('claim')}
        />
      </div>

      <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_35px_rgba(15,40,70,0.06)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.92fr)_minmax(0,1.08fr)]">
          <div className="min-w-0">
            <div className="relative h-[285px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <AssetImage
                sources={[agencyLookupResult.mapImageUrl, agencyLookupResult.fallbackMapImageUrl]}
                alt="사고 위치 지도 미리보기"
                className="h-full w-full object-cover"
                fallback={<MapFallback />}
              />
              <div className="absolute left-4 top-4 max-w-[250px] rounded-xl bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,40,70,0.12)] backdrop-blur">
                <p className="text-[13px] font-black text-blue-700">선택 위치</p>
                <p className="mt-2 text-[12px] font-black leading-5 text-slate-700">{agencyLookupResult.roadAddress}</p>
                <p className="mt-1 text-[12px] font-bold text-slate-600">{agencyLookupResult.lotAddress}</p>
              </div>
              <MapPin className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-[35%] text-blue-700 drop-shadow-[0_8px_14px_rgba(0,95,220,0.28)]" size={58} fill="#0B6DDE" aria-hidden="true" />
              <div className="absolute right-3 top-[116px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
                <button type="button" aria-label="지도 확대" className="flex h-10 w-10 items-center justify-center border-b border-slate-200 text-slate-700 transition hover:bg-blue-50">
                  <Plus size={18} aria-hidden="true" />
                </button>
                <button type="button" aria-label="지도 축소" className="flex h-10 w-10 items-center justify-center text-slate-700 transition hover:bg-blue-50">
                  <Minus size={18} aria-hidden="true" />
                </button>
              </div>
              <button type="button" aria-label="현재 위치 보기" className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-blue-50">
                <LocateFixed size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[12px] font-bold leading-5 text-slate-500">
              <Info size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              도로 관할은 도로법 및 지자체 조례에 따라 달라질 수 있습니다.
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={24} className="text-green-600" fill="#22C55E" aria-hidden="true" />
              <h2 className="text-[17px] font-black text-[#07182F]">도로 관할기관 조회 결과</h2>
            </div>

            <div className="mt-4 grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-3">
              {[
                { label: '시도', value: agencyLookupResult.province },
                { label: '구청', value: agencyLookupResult.districtOffice },
                { label: '도로관리기관', value: claim?.managingAuthority ?? agencyLookupResult.roadManagementAgency },
              ].map((item) => (
                <div key={item.label} className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="text-[12px] font-black text-slate-400">{item.label}</p>
                  <p className="mt-2 text-[15px] font-black text-blue-700">{item.value}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-[15px] font-black text-[#07182F]">담당 부서 및 연락처</h3>
            <div className="mt-3 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[12px] font-black text-slate-500">
                    <th className="px-4 py-3 text-left">구분</th>
                    <th className="px-4 py-3 text-left">부서명</th>
                    <th className="px-4 py-3 text-left">주요 업무</th>
                    <th className="px-4 py-3 text-left">연락처</th>
                    <th className="px-4 py-3 text-center"><span className="sr-only">연락</span></th>
                  </tr>
                </thead>
                <tbody>
                  {agencyContacts.map((contact) => (
                    <tr key={contact.id} className="border-t border-slate-200 text-[12px]">
                      <td className="px-4 py-3 font-bold text-slate-600">{contact.category}</td>
                      <td className="px-4 py-3 font-black text-slate-700">{contact.departmentName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{contact.responsibility}</td>
                      <td className="px-4 py-3 font-black text-slate-700">{contact.phone}</td>
                      <td className="px-4 py-3">
                        <button type="button" aria-label={`${contact.departmentName} 전화 안내`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition hover:bg-blue-100">
                          <Phone size={16} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 space-y-3 md:hidden">
              {agencyContacts.map((contact) => (
                <article key={contact.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-black text-blue-700">{contact.category}</p>
                      <h4 className="mt-1 text-[15px] font-black text-slate-800">{contact.departmentName}</h4>
                    </div>
                    <button type="button" aria-label={`${contact.departmentName} 전화 안내`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Phone size={16} aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-3 text-[13px] font-semibold text-slate-600">{contact.responsibility}</p>
                  <p className="mt-2 text-[13px] font-black text-slate-800">{contact.phone}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-4 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between">
        <div className="flex items-start gap-3">
          <Megaphone size={24} className="mt-1 shrink-0 text-slate-700" aria-hidden="true" />
          <div>
            <h2 className="text-[22px] font-black text-[#07182F]">보상 청구 도우미</h2>
            <p className="mt-1 text-[13px] font-semibold leading-5 text-slate-500">
              사고 정보와 필요 서류를 확인하고, 보상 청구를 진행하세요.
            </p>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-x-9 gap-y-4">
          {compensationSteps.map((step, index) => {
            const active = step.status === 'active'

            return (
              <li key={step.id} className="relative flex items-center gap-3">
                {index !== 0 && <span className="absolute right-[calc(100%+14px)] hidden h-px w-8 bg-slate-200 sm:block" />}
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-black', active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')} aria-current={active ? 'step' : undefined}>
                  {index + 1}
                </span>
                <span>
                  <span className="block text-[13px] font-black text-slate-700">{step.title}</span>
                  <span className="mt-1 block text-[11px] font-semibold text-slate-500">{step.description}</span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-[230px_minmax(0,1fr)_400px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,40,70,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-[18px] font-black text-[#07182F]">사고 정보</h3>
            <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-black text-slate-600 transition hover:bg-blue-50">
              수정
            </button>
          </div>
          {[
            { label: '사고 일시', value: accidentInfo.occurredAt },
            { label: '사고 위치', value: accidentInfo.location, subValue: accidentInfo.lotAddress },
            { label: '사고 유형', value: accidentInfo.accidentType },
            { label: '사고 경위', value: accidentInfo.accidentDescription },
          ].map((item) => (
            <div key={item.label} className="mb-4 last:mb-0">
              <p className="text-[12px] font-black text-slate-400">{item.label}</p>
              <p className="mt-1 text-[13px] font-black leading-6 text-slate-700">{item.value}</p>
              {'subValue' in item && item.subValue && <p className="mt-1 text-[13px] font-bold text-slate-600">{item.subValue}</p>}
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,40,70,0.06)]">
          <h3 className="text-[18px] font-black text-[#07182F]">첨부 사진</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="min-w-0">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                  <button type="button" onClick={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))} aria-label={`${photo.title} 사진 제거`} className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600">
                    <X size={14} aria-hidden="true" />
                  </button>
                  <AssetImage
                    sources={[photo.imageUrl, photo.fallbackImageUrl]}
                    alt={photo.alt}
                    className="h-full w-full object-cover"
                    fallback={<EvidenceFallback type={photo.fallbackType} />}
                  />
                </div>
                <p className="mt-2 truncate text-center text-[11px] font-bold text-slate-500">{photo.title}</p>
              </div>
            ))}
            <button type="button" className="flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50/30 text-blue-700 transition hover:bg-blue-50">
              <Plus size={24} aria-hidden="true" />
              <span className="mt-2 text-[12px] font-black">추가</span>
              <span className="text-[11px] font-semibold">사진 추가</span>
            </button>
          </div>

          {photos.length === 0 && (
            <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-[12px] font-bold text-slate-500">
              첨부 사진은 데모 화면에서만 변경됩니다.
            </p>
          )}

          <h3 className="mt-5 text-[18px] font-black text-[#07182F]">차량 정보</h3>
          <div className="mt-3 grid overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-4">
            {vehicleFields.map((field) => (
              <div key={field.label} className="border-b border-slate-200 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <p className="text-[11px] font-black text-slate-400">{field.label}</p>
                <p className="mt-2 text-[13px] font-black text-slate-700">{field.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[12px] font-black text-slate-400">연락처</p>
            <p className="mt-1 text-[13px] font-black text-slate-700">{claim?.contact ?? contact}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,40,70,0.06)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[18px] font-black text-[#07182F]">청구 서류 체크리스트 & 미리보기</h3>
              <p className="mt-1 text-[12px] font-semibold text-slate-500">청구서 초안 생성에 필요한 자료를 정리합니다.</p>
            </div>
            <button
              type="button"
              onClick={claimId ? handleDownloadPdf : () => setNotice('먼저 보상 청구 초안을 생성해 주세요.')}
              disabled={isDownloadingPdf}
              className="flex h-9 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={15} aria-hidden="true" />
              {isDownloadingPdf ? '준비 중' : '서식 다운로드'}
            </button>
          </div>

          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12px] font-black text-blue-700">백엔드 청구 연동</p>
                <p className="mt-1 text-[12px] font-semibold text-slate-600">
                  {reportId ? `연결된 신고 번호: ${reportId}` : '신고 번호가 없어 데모 정보로 표시 중입니다.'}
                </p>
              </div>
              {claimId && (
                <span className="w-fit rounded-full bg-white px-3 py-1 text-[11px] font-black text-blue-700 shadow-sm">
                  청구 번호 {claimId}
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="claim-incident-at" className="text-[12px] font-black text-slate-600">
                  사고 일시
                </label>
                <input
                  id="claim-incident-at"
                  type="datetime-local"
                  value={incidentAt}
                  onChange={(event) => setIncidentAt(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="claim-incident-type" className="text-[12px] font-black text-slate-600">
                  사고 유형
                </label>
                <input
                  id="claim-incident-type"
                  value={incidentType}
                  onChange={(event) => setIncidentType(event.target.value)}
                  maxLength={30}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <label htmlFor="claim-damage-description" className="text-[12px] font-black text-slate-600">
                피해 내용
              </label>
              <textarea
                id="claim-damage-description"
                value={damageDescription}
                onChange={(event) => setDamageDescription(event.target.value)}
                className="h-[74px] w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_130px]">
              <div>
                <label htmlFor="claim-estimated-cost" className="text-[12px] font-black text-slate-600">
                  예상 수리비
                </label>
                <input
                  id="claim-estimated-cost"
                  inputMode="numeric"
                  value={estimatedCost}
                  onChange={(event) => setEstimatedCost(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateClaimDraft}
                disabled={isCreatingClaim}
                className="mt-auto h-10 rounded-lg bg-blue-700 px-4 text-[13px] font-black text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingClaim ? '생성 중' : '초안 생성'}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="claim-vehicle-model" className="text-[12px] font-black text-slate-600">
                  차종/모델명
                </label>
                <input
                  id="claim-vehicle-model"
                  value={vehicleModel}
                  onChange={(event) => setVehicleModel(event.target.value)}
                  maxLength={100}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="claim-vehicle-plate" className="text-[12px] font-black text-slate-600">
                  차량 번호
                </label>
                <input
                  id="claim-vehicle-plate"
                  value={vehiclePlateNumber}
                  onChange={(event) => setVehiclePlateNumber(event.target.value)}
                  maxLength={20}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="claim-vehicle-year" className="text-[12px] font-black text-slate-600">
                  연식
                </label>
                <input
                  id="claim-vehicle-year"
                  inputMode="numeric"
                  value={vehicleYear}
                  onChange={(event) => setVehicleYear(event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div>
                <label htmlFor="claim-insurer" className="text-[12px] font-black text-slate-600">
                  보험사
                </label>
                <input
                  id="claim-insurer"
                  value={insurer}
                  onChange={(event) => setInsurer(event.target.value)}
                  maxLength={50}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="claim-contact" className="text-[12px] font-black text-slate-600">
                  연락처
                </label>
                <input
                  id="claim-contact"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  maxLength={30}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)_126px]">
              <div>
                <label htmlFor="claim-attachment-type" className="text-[12px] font-black text-slate-600">
                  첨부 유형
                </label>
                <select
                  id="claim-attachment-type"
                  value={attachmentType}
                  onChange={(event) => setAttachmentType(event.target.value as ClaimAttachmentType)}
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {attachmentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="claim-attachment-file" className="text-[12px] font-black text-slate-600">
                  첨부 파일
                </label>
                <input
                  id="claim-attachment-file"
                  type="file"
                  onChange={handleAttachmentChange}
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 file:mr-3 file:h-full file:border-0 file:bg-slate-100 file:px-3 file:text-[12px] file:font-black file:text-slate-600"
                />
              </div>
              <button
                type="button"
                onClick={handleUploadAttachment}
                disabled={isUploadingAttachment || !isDraftClaim}
                className="mt-auto h-10 rounded-lg border border-blue-200 bg-white px-3 text-[12px] font-black text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingAttachment ? '업로드 중' : isDraftClaim ? '업로드' : '업로드 불가'}
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleSubmitClaim}
                disabled={isSubmittingClaim || !isDraftClaim}
                className="h-10 rounded-lg bg-slate-900 px-4 text-[13px] font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingClaim ? '제출 중' : isDraftClaim ? '청구 제출' : '제출 완료'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloadingPdf ? '다운로드 준비 중' : '문서 다운로드'}
              </button>
            </div>

            {claim && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] font-black text-slate-400">예상 보상금</p>
                    <p className="mt-1 text-[15px] font-black text-blue-700">
                      {formatCurrency(claim.estimatedCompensation)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400">관할기관</p>
                    <p className="mt-1 text-[13px] font-black text-slate-700">
                      {claim.managingAuthority ?? agencyLookupResult.roadManagementAgency}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400">청구 상태</p>
                    <p className="mt-1 text-[13px] font-black text-slate-700">{displayClaimStatus}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400">평균 처리 소요</p>
                    <p className="mt-1 text-[13px] font-black text-slate-700">
                      {claim.averageProcessingDays ? `${claim.averageProcessingDays}일` : '-'}
                    </p>
                  </div>
                </div>

                {claim.requiredDocs && claim.requiredDocs.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[12px] font-black text-slate-600">필요 서류</p>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {claim.requiredDocs.map((doc) => (
                        <li key={doc} className="rounded-lg bg-slate-50 px-3 py-2 text-[12px] font-bold text-slate-600">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {claim.document && (
                  <div className="mt-4">
                    <p className="text-[12px] font-black text-slate-600">자동 생성 청구서</p>
                    <pre className="mt-2 max-h-[180px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-3 text-[12px] font-semibold leading-5 text-slate-700">
                      {claim.document}
                    </pre>
                  </div>
                )}

                {claim.attachments && claim.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[12px] font-black text-slate-600">업로드된 첨부</p>
                    <ul className="mt-2 space-y-2">
                      {claim.attachments.map((attachment, index) => (
                        <li
                          key={`${attachment.id ?? attachment.originalName ?? 'attachment'}-${index}`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-600"
                        >
                          {attachment.originalName ?? '첨부 파일'} · {attachment.attachmentType ?? 'OTHER'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {claim.disclaimer && (
                  <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-[12px] font-bold leading-5 text-blue-700">
                    {claim.disclaimer}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_170px]">
            <ul className="space-y-3">
              {displayChecklistItems.map((item) => {
                const complete = item.status === '완료'

                return (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', complete ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 bg-white text-transparent')} aria-hidden="true">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span className="min-w-0 text-[13px] font-bold leading-5 text-slate-700">{item.title}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </li>
                )
              })}
            </ul>

            <div className="mx-auto h-[210px] w-[150px] overflow-hidden rounded-xl">
              <AssetImage
                sources={[claimDocumentPreview.imageUrl, claimDocumentPreview.fallbackImageUrl]}
                alt="보상 청구서 미리보기"
                className="h-full w-full object-cover"
                fallback={<DocumentFallback />}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-slate-500">
            <button type="button" onClick={() => setDocumentPage((page) => Math.max(1, page - 1))} disabled={documentPage === 1} aria-label="이전 청구서 미리보기 페이지" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition hover:bg-blue-50 disabled:opacity-40">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="text-[13px] font-black">{documentPage} / {claimDocumentPreview.totalPage}</span>
            <button type="button" onClick={() => setDocumentPage((page) => Math.min(claimDocumentPreview.totalPage, page + 1))} disabled={documentPage === claimDocumentPreview.totalPage} aria-label="다음 청구서 미리보기 페이지" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition hover:bg-blue-50 disabled:opacity-40">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setNotice('문서 확대 보기는 데모 화면입니다.')} aria-label="청구서 미리보기 확대" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 transition hover:bg-blue-50">
              <Maximize2 size={15} aria-hidden="true" />
            </button>
          </div>

          {notice && (
            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-[12px] font-bold leading-5 text-blue-700" aria-live="polite">
              <p>{notice}</p>
              {notice.includes('제출') && (
                <button type="button" onClick={() => navigate('/alerts')} className="mt-2 text-[12px] font-black text-blue-800 underline underline-offset-4">
                  실시간 알림 보기
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmitClaim}
            disabled={isSubmittingClaim || !isDraftClaim}
            className="mt-4 h-11 w-full rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmittingClaim ? '제출 중' : isDraftClaim ? '서류 검토 및 제출하기' : '제출 완료'}
          </button>
        </section>
      </div>

      <div className="mt-4 flex items-start gap-2 text-[12px] font-semibold leading-5 text-slate-500">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        보상 청구는 도로 파손 등 관리 주체의 과실이 인정되는 경우에 한해 가능할 수 있습니다.
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[12px] font-semibold leading-5 text-blue-700">
        <Building2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        관할기관 안내 정보는 데모 데이터를 함께 사용하며, 보상 청구 접수는 백엔드 연결이 가능할 때 실제 요청으로 처리됩니다.
      </div>
    </div>
  )
}
