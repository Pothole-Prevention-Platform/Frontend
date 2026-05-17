import { type ReactNode, useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
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

export function AgencyCompensationPage() {
  const [activeMode, setActiveMode] = useState<ModeKey>('agency')
  const [photos, setPhotos] = useState(evidencePhotos)
  const [documentPage, setDocumentPage] = useState(claimDocumentPreview.currentPage)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  const vehicleFields = [
    { label: '차량 번호', value: vehicleInfo.plateNumber },
    { label: '차종', value: vehicleInfo.model },
    { label: '연식', value: vehicleInfo.year },
    { label: '보험사', value: vehicleInfo.insuranceCompany },
  ]

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
                { label: '도로관리기관', value: agencyLookupResult.roadManagementAgency },
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
            <p className="mt-1 text-[13px] font-black text-slate-700">{vehicleInfo.phone}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,40,70,0.06)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[18px] font-black text-[#07182F]">청구 서류 체크리스트 & 미리보기</h3>
              <p className="mt-1 text-[12px] font-semibold text-slate-500">청구서 초안 생성에 필요한 자료를 정리합니다.</p>
            </div>
            <button type="button" onClick={() => setNotice('서식 다운로드는 데모 화면입니다. 실제 파일은 생성되지 않습니다.')} className="flex h-9 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-black text-slate-600 transition hover:bg-blue-50">
              <Download size={15} aria-hidden="true" />
              서식 다운로드
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_170px]">
            <ul className="space-y-3">
              {claimChecklistItems.map((item) => {
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

          <button type="button" onClick={() => setNotice('제출 기능은 데모 화면입니다. 실제 접수는 담당 기관 확인 후 진행됩니다.')} className="mt-4 h-11 w-full rounded-lg bg-gradient-to-r from-[#075ED5] to-[#0068E8] text-[15px] font-black text-white shadow-[0_14px_28px_rgba(0,95,220,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,95,220,0.25)]">
            서류 검토 및 제출하기
          </button>
        </section>
      </div>

      <div className="mt-4 flex items-start gap-2 text-[12px] font-semibold leading-5 text-slate-500">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        보상 청구는 도로 파손 등 관리 주체의 과실이 인정되는 경우에 한해 가능할 수 있습니다.
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-[12px] font-semibold leading-5 text-blue-700">
        <Building2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        이 화면은 공모전 시연용 mock UI이며, 실제 관할기관 조회·보상 청구 접수·법률 판단·정부 시스템 연동을 수행하지 않습니다.
      </div>
    </div>
  )
}
