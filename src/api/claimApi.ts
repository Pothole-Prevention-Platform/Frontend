import { apiBlob, apiForm, apiJson } from './apiClient'
import type {
  ClaimAttachmentInput,
  ClaimDraftInput,
  ClaimResponse,
  ClaimUpdateInput,
} from '../types/claim'

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
  const formData = new FormData()
  formData.append('attachmentType', attachmentType)
  formData.append('file', file)

  return apiForm<ClaimResponse>(`/api/citizen/claim/${encodeURIComponent(claimId)}/attachments`, formData)
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
