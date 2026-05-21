export type UserRole = 'rider' | 'driver' | 'victim' | 'admin'

export type * from './report'
export type * from './claim'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type RoadType = 'national' | 'provincial' | 'city' | 'district'

export type ReportStatus = 'received' | 'reviewing' | 'scheduled' | 'completed'

export type RiskMapFilterId = 'rainfall' | 'roadYear' | 'sewerAging' | 'undergroundConstruction'

export type RiskMapGrade = 'safe' | 'attention' | 'caution' | 'danger'

export type RiskMapHighZoneGrade = '긴급' | '주의' | '관심' | '안전/관찰'

export type ReportSeverityId = 'low' | 'medium' | 'high' | 'critical'

export type ReportSeverityLabel = '낮음' | '보통' | '높음' | '매우 높음'

export type ReportSeverityColor = 'green' | 'yellow' | 'orange' | 'red'

export type RecentCitizenReportStatus = '검수 완료' | '검토 중' | '처리 완료' | '모니터링 중'

export type RecentCitizenReportStatusColor = 'orange' | 'blue' | 'green' | 'cyan'

export type AiReviewLevel = '낮음' | '보통' | '높음' | '매우 높음'

export type AiReviewIconName =
  | 'image'
  | 'scan'
  | 'crosshair'
  | 'shield'
  | 'fileCheck'
  | 'waves'
  | 'ruler'
  | 'listChecks'
  | 'alertTriangle'
  | 'checkCircle'
  | 'camera'
  | 'shieldAlert'

export type AiAnalysisStepStatus = 'complete' | 'processing' | 'pending'

export type AiDetectedFeatureSeverity = 'normal' | 'warning' | 'danger'

export type AiRecommendedActionType = 'confirm' | 'retake' | 'suspect'

export type AiRecommendedActionVariant = 'primary' | 'secondary' | 'warning'

export type AlertRiskLevel = 'danger' | 'caution' | 'attention' | 'safe'

export type AlertToggleType = 'push' | 'voice' | 'rain'

export type AlertSettingDay = '매일' | '평일' | '주말'

export interface RiskMapStats {
  highRiskCount: number
  recentReportCount: number
  aiAccuracy: number
  highRiskDelta: number
  reportDeltaPercent: number
  accuracyDeltaPercent: number
}

export interface RiskMapFilter {
  id: RiskMapFilterId
  title: string
  value: string
}

export interface RiskMapHighZone {
  id: string
  riskGrade: RiskMapHighZoneGrade
  roadName: string
  detailLocation: string
  riskPercent: number
  reasons: string[]
  recentReportTime: string
  reportCount: number
  status: string
  expectedAction: string
}

export interface RiskMapLegendItem {
  id: RiskMapGrade
  label: string
  range: string
  color: 'green' | 'yellow' | 'orange' | 'red'
}

export interface CitizenReportMock {
  uploadedFileName: string
  uploadedFileSize: string
  previewSources: string[]
  mapSources: string[]
  address: string
  detailLocationPlaceholder: string
  gpsAccuracy: string
  reportedAt: string
  defaultRiskType: string
  defaultSeverity: ReportSeverityId
}

export interface RiskSeverityOption {
  id: ReportSeverityId
  label: ReportSeverityLabel
  description: string
  color: ReportSeverityColor
}

export interface AiVerificationStep {
  id: string
  title: string
  description?: string
}

export interface RecentCitizenReport {
  id: string
  status: RecentCitizenReportStatus
  title: string
  location: string
  date: string
  thumbnailSources: string[]
  statusColor: RecentCitizenReportStatusColor
}

export interface AiReviewResult {
  capturedAt: string
  location: string
  potholeProbability: number
  confidence: number
  resultLevel: AiReviewLevel
  description: string
  imageSources: string[]
}

export interface AiDetectedFeature {
  id: string
  label: string
  value: string
  score?: number
  severity: AiDetectedFeatureSeverity
  iconName?: AiReviewIconName
}

export interface AiAnalysisStep {
  id: string
  title: string
  description: string
  status: AiAnalysisStepStatus
  iconName?: AiReviewIconName
}

export interface AiRecommendedAction {
  id: string
  title: string
  description: string
  actionType: AiRecommendedActionType
  route?: string
  variant: AiRecommendedActionVariant
  iconName?: AiReviewIconName
}

export interface RecentAiResult {
  id: string
  thumbnailSources: string[]
  percent: number
  level: AiReviewLevel
  location: string
  date: string
}

export interface PotholeRiskZone {
  id: string
  roadName: string
  district: string
  riskLevel: RiskLevel
  riskScore: number
  lat: number
  lng: number
  mainReasons: string[]
  rainfallScore: number
  roadAgeScore: number
  sewerAgingScore: number
  undergroundConstructionScore: number
}

export interface CitizenReport {
  id: string
  location: string
  roadName: string
  reportedAt: string
  aiConfidence: number
  empathyCount: number
  status: ReportStatus
}

export interface AgencyContact {
  id: string
  roadType: RoadType
  category: string
  departmentName: string
  responsibility: string
  agencyName: string
  department: string
  phone: string
  address: string
  processingGuide: string
}

export interface CompensationDraft {
  id: string
  damageType: string
  location: string
  occurredAt: string
  attachedEvidenceCount: number
  draftStatus: string
}

export type CompensationStepStatus = 'active' | 'pending' | 'complete'

export type ClaimChecklistStatus = '완료' | '준비 중'

export interface AgencyLookupResult {
  selectedLocation: string
  roadAddress: string
  lotAddress: string
  province: string
  districtOffice: string
  roadManagementAgency: string
  mapImageUrl: string
  fallbackMapImageUrl: string
}

export interface CompensationStep {
  id: string
  title: string
  description: string
  status: CompensationStepStatus
}

export interface AccidentInfo {
  occurredAt: string
  location: string
  lotAddress: string
  accidentType: string
  accidentDescription: string
}

export interface EvidencePhoto {
  id: string
  title: string
  imageUrl: string
  fallbackImageUrl: string
  alt: string
  fallbackType: 'road' | 'wheel' | 'tire'
}

export interface VehicleInfo {
  plateNumber: string
  model: string
  year: string
  insuranceCompany: string
  phone: string
}

export interface ClaimChecklistItem {
  id: string
  title: string
  status: ClaimChecklistStatus
}

export interface ClaimDocumentPreview {
  imageUrl: string
  fallbackImageUrl: string
  currentPage: number
  totalPage: number
}

export interface WeatherAlert {
  id: string
  title: string
  district: string
  rainfallAmount: number
  riskMessage: string
  issuedAt: string
}

export interface CurrentDangerAlert {
  id: string
  title: string
  riskLevel: AlertRiskLevel
  location: string
  direction: string
  distanceMeters: number
  badgeLabel: string
}

export interface RoutePreview {
  estimatedArrival: string
  remainingDistance: string
  routeMapImageUrl: string
}

export interface AlertToggleSetting {
  id: string
  title: string
  description: string
  status: '활성' | '비활성'
  enabled: boolean
  type: AlertToggleType
}

export interface RecentDangerAlert {
  id: string
  time: string
  relativeTime: string
  riskLevel: AlertRiskLevel
  riskLabel: string
  title: string
  detail: string
  distanceText: string
  statusText?: string
}

export interface AlertSettings {
  quietHoursEnabled: boolean
  quietStartTime: string
  quietEndTime: string
  selectedDays: AlertSettingDay
  alertRadiusMeters: number
}

export interface AdminReportRow {
  id: string
  roadName: string
  district: string
  riskLevel: RiskLevel
  reportCount: number
  empathyCount: number
  untreatedDays: number
  status: ReportStatus
  priorityScore: number
}

export type AdminColorType = 'blue' | 'red' | 'orange' | 'green' | 'yellow' | 'gray' | 'purple' | 'teal'

export type AdminDeltaDirection = 'up' | 'down'

export type AdminKpiIconType = 'filePlus' | 'alertTriangle' | 'clock' | 'cpu'

export type AdminRiskGrade = '긴급' | '주의' | '관심'

export type AdminMapRiskLevel = 'very-high' | 'high' | 'medium' | 'low' | 'very-low'

export type AdminStatusIconType = 'fileText' | 'clipboard' | 'wrench' | 'check' | 'x'

export type AdminPriorityTab = 'risk' | 'reports' | 'unresolved'

export interface AdminFilters {
  district: string
  periodLabel: string
  status: string
}

export interface AdminKpiStat {
  id: string
  title: string
  value: string
  unit: string
  description: string
  deltaLabel: string
  deltaDirection: AdminDeltaDirection
  iconType: AdminKpiIconType
  colorType: AdminColorType
}

export interface AdminTrendDatum {
  date: string
  reportCount: number
  repairedCount: number
  completionRate: number
}

export interface AdminRiskDistributionItem {
  id: string
  label: string
  count: number
  percent: number
  colorType: AdminColorType
}

export interface AdminMapRiskPoint {
  id: string
  district: string
  value: number
  level: AdminMapRiskLevel
  x: number
  y: number
}

export interface AdminPriorityArea {
  rank: number
  district: string
  riskGrade: AdminRiskGrade
  reportCount: number
  unresolvedCount: number
  maxUnresolvedDays: number
  deltaLabel: string
  deltaDirection: AdminDeltaDirection
}

export interface AdminStatusSummaryItem {
  id: string
  label: string
  count: number
  colorType: AdminColorType
  iconType: AdminStatusIconType
}

export type MyPageStatIconType = 'clipboard' | 'mapPin' | 'wallet'

export type MyPageInterestType = 'region' | 'route'

export type MyPageNotificationIconType = 'alert' | 'bell' | 'wallet' | 'mail'

export type MyPageActivityIconType = 'report' | 'claim' | 'region'

export type MyPageActivityStatusType = 'accepted' | 'processing' | 'completed'

export type MyPageClaimStatusType = 'accepted' | 'processing' | 'completed'

export interface MyPageProfile {
  name: string
  userType: string
  email: string
  phone: string
  joinedAt: string
  avatarUrl: string
  fallbackAvatarUrl: string
}

export interface MyPageStat {
  id: string
  title: string
  value: string
  iconType: MyPageStatIconType
  sparklineValues: number[]
}

export interface MyPageBasicInfoRow {
  label: string
  value: string
}

export interface MyPageInterestItem {
  id: string
  type: MyPageInterestType
  title: string
  badgeLabel: string
  imageUrl: string
  fallbackImageUrl: string
}

export interface MyPageNotificationSetting {
  id: string
  title: string
  description: string
  enabled: boolean
  iconType: MyPageNotificationIconType
}

export interface MyPageActivity {
  id: string
  type: string
  content: string
  date: string
  status: string
  statusType: MyPageActivityStatusType
  iconType: MyPageActivityIconType
}

export interface MyPageCompensationClaim {
  id: string
  location: string
  date: string
  status: string
  statusType: MyPageClaimStatusType
}
