export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'

export type ClaimAttachmentType = 'PHOTO_DAMAGE' | 'REPAIR_ESTIMATE' | 'BANKBOOK' | 'ID_CARD' | 'OTHER'

export interface ClaimVehicleInfo {
  model?: string
  plateNumber?: string
  year?: number
  insurer?: string
  contact?: string
}

export interface ClaimDraftInput {
  reportId: string
  incidentAt?: string
  incidentType?: string
  damageDescription: string
  estimatedCost: number
  vehicleInfo?: ClaimVehicleInfo
}

export interface ClaimUpdateInput {
  incidentAt?: string
  incidentType?: string
  damageDescription?: string
  estimatedCost?: number
  vehicleInfo?: ClaimVehicleInfo
}

export interface ClaimAttachmentInput {
  claimId: string
  attachmentType: ClaimAttachmentType | string
  file: File
}

export interface AttachmentResponse {
  id?: number
  attachmentType?: string | null
  fileUrl?: string | null
  originalName?: string | null
  sizeBytes?: number | null
  uploadedAt?: string | null
  [key: string]: unknown
}

export interface ChecklistResponse {
  claimForm?: boolean | null
  incidentStatement?: boolean | null
  damagePhotos?: boolean | null
  repairEstimate?: boolean | null
  bankbook?: boolean | null
  idCard?: boolean | null
  allReady?: boolean | null
  [key: string]: unknown
}

export interface ClaimResponse {
  claimId?: string
  reportId?: string
  incidentAt?: string | null
  incidentType?: string | null
  incidentAddress?: string | null
  incidentLocationDetail?: string | null
  damageDescription?: string | null
  estimatedCost?: number | null
  estimatedCompensation?: number | null
  vehicleModel?: string | null
  vehiclePlateNumber?: string | null
  vehicleYear?: number | null
  insurer?: string | null
  contact?: string | null
  managingAuthority?: string | null
  document?: string | null
  requiredDocs?: string[] | null
  checklist?: ChecklistResponse | null
  attachments?: AttachmentResponse[] | null
  averageProcessingDays?: number | null
  status?: ClaimStatus | string | null
  disclaimer?: string | null
  generatedAt?: string | null
  submittedAt?: string | null

  id?: string
  pdfUrl?: string
  [key: string]: unknown
}
