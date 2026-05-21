import { apiBlob, apiForm, apiJson } from './apiClient'
import type {
  AttachmentResponse,
  ClaimAttachmentInput,
  ClaimDraftInput,
  ClaimResponse,
  ClaimUpdateInput,
} from '../types/claim'

const CLAIM_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

function assertAttachmentFile(file: File) {
  if (file.size > CLAIM_ATTACHMENT_MAX_BYTES) {
    throw new Error('첨부 파일은 10MB 이하만 업로드할 수 있습니다.')
  }
}

export function createClaimDraft(input: ClaimDraftInput) {
  return apiJson<ClaimResponse>('/api/citizen/claim', {
    method: 'POST',
    body: input,
  })
}

export function getClaim(claimId: string) {
  return apiJson<ClaimResponse>(`/api/citizen/claim/${encodeURIComponent(claimId)}`)
}

export function updateClaim(claimId: string, input: ClaimUpdateInput) {
  return apiJson<ClaimResponse>(`/api/citizen/claim/${encodeURIComponent(claimId)}`, {
    method: 'PATCH',
    body: input,
  })
}

export function uploadClaimAttachment({ attachmentType, claimId, file }: ClaimAttachmentInput) {
  assertAttachmentFile(file)

  const formData = new FormData()
  formData.append('file', file)

  const searchParams = new URLSearchParams({ attachmentType })

  return apiForm<AttachmentResponse>(
    `/api/citizen/claim/${encodeURIComponent(claimId)}/attachments?${searchParams.toString()}`,
    formData,
  )
}

export function submitClaim(claimId: string) {
  return apiJson<ClaimResponse>(`/api/citizen/claim/${encodeURIComponent(claimId)}/submit`, {
    method: 'POST',
  })
}

export function downloadClaimPdf(claimId: string) {
  return apiBlob(`/api/citizen/claim/${encodeURIComponent(claimId)}/pdf`, {
    method: 'GET',
  })
}
