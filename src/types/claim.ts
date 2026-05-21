export interface ClaimVehicleInfo {
  plateNumber?: string
  model?: string
  year?: string
  insuranceCompany?: string
  phone?: string
  [key: string]: unknown
}

export interface ClaimDraftInput {
  reportId: string
  damageDescription: string
  estimatedCost: number
  vehicleInfo?: ClaimVehicleInfo | string
}

export interface ClaimUpdateInput {
  damageDescription?: string
  estimatedCost?: number
  vehicleInfo?: ClaimVehicleInfo | string
  [key: string]: unknown
}

export interface ClaimAttachmentInput {
  claimId: string
  attachmentType: string
  file: File
}

export interface ClaimAttachment {
  id?: string
  attachmentId?: string
  attachmentType?: string
  fileName?: string
  fileUrl?: string
  [key: string]: unknown
}

export interface ClaimResponse {
  id?: string
  claimId?: string
  reportId?: string
  damageDescription?: string
  estimatedCost?: number
  vehicleInfo?: ClaimVehicleInfo | string
  status?: string
  submittedAt?: string
  attachments?: ClaimAttachment[]
  pdfUrl?: string
  [key: string]: unknown
}
