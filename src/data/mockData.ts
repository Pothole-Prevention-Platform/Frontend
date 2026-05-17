import type {
  AdminReportRow,
  AlertSettings,
  AlertToggleSetting,
  AiAnalysisStep,
  AiDetectedFeature,
  AiRecommendedAction,
  AiReviewResult,
  AiVerificationStep,
  AccidentInfo,
  AgencyContact,
  AgencyLookupResult,
  ClaimChecklistItem,
  ClaimDocumentPreview,
  CompensationStep,
  CurrentDangerAlert,
  CitizenReport,
  CitizenReportMock,
  CompensationDraft,
  EvidencePhoto,
  PotholeRiskZone,
  RecentAiResult,
  RecentCitizenReport,
  RecentDangerAlert,
  RiskMapFilter,
  RiskMapHighZone,
  RiskMapLegendItem,
  RiskMapStats,
  RiskSeverityOption,
  RoutePreview,
  VehicleInfo,
  WeatherAlert,
} from '../types'

export const citizenReportMock: CitizenReportMock = {
  uploadedFileName: 'IMG_20240524_102358.jpg',
  uploadedFileSize: '1.2MB',
  previewSources: ['/assets/report/report-pothole-preview.webp', '/assets/report/report-pothole-preview.png'],
  mapSources: ['/assets/report/report-location-map.webp', '/assets/report/report-location-map.png'],
  address: '서울특별시 서초구 양재천로 123',
  detailLocationPlaceholder: '건물명, 도로명, 방향, 주변 시설 등 상세 정보를 입력하세요.',
  gpsAccuracy: '정확도 5m',
  reportedAt: '2024-05-24 10:23',
  defaultRiskType: '포트홀 (도로 파임)',
  defaultSeverity: 'high',
}

export const riskSeverityOptions: RiskSeverityOption[] = [
  {
    id: 'low',
    label: '낮음',
    description: '주행 주의 필요',
    color: 'green',
  },
  {
    id: 'medium',
    label: '보통',
    description: '서행 권장',
    color: 'yellow',
  },
  {
    id: 'high',
    label: '높음',
    description: '차량 손상 우려',
    color: 'orange',
  },
  {
    id: 'critical',
    label: '매우 높음',
    description: '사고 위험 높음',
    color: 'red',
  },
]

export const aiVerificationSteps: AiVerificationStep[] = [
  {
    id: 'image-analysis',
    title: '이미지 자동 분석 (수초 내 완료)',
  },
  {
    id: 'location-cross-check',
    title: '위치 및 주변 데이터 교차 검증',
  },
  {
    id: 'agency-transfer',
    title: '위험도 산정 및 담당 기관 전달',
  },
]

export const aiReviewResult: AiReviewResult = {
  capturedAt: '2024.07.12 14:35',
  location: '서울특별시 강남구 테헤란로 123',
  potholeProbability: 96,
  confidence: 96,
  resultLevel: '매우 높음',
  description: '포트홀로 판단될 가능성이 매우 높습니다.',
  imageSources: [
    '/assets/ai-review/ai-review-main.webp',
    '/assets/ai-review/ai-review-main.png',
    '/assets/report/report-pothole-preview.webp',
    '/assets/report/report-pothole-preview.png',
  ],
}

export const aiDetectedFeatures: AiDetectedFeature[] = [
  {
    id: 'crack',
    label: '균열',
    value: '심함',
    score: 5,
    severity: 'warning',
    iconName: 'waves',
  },
  {
    id: 'depth',
    label: '깊이',
    value: '깊음 (5~7cm 추정)',
    score: 4,
    severity: 'warning',
    iconName: 'ruler',
  },
  {
    id: 'surface-damage',
    label: '노면 파손',
    value: '넓음 (45cm 추정)',
    score: 5,
    severity: 'warning',
    iconName: 'scan',
  },
  {
    id: 'shape',
    label: '형태',
    value: '불규칙형',
    severity: 'normal',
    iconName: 'listChecks',
  },
  {
    id: 'risk',
    label: '위험도',
    value: '높음',
    severity: 'danger',
    iconName: 'alertTriangle',
  },
]

export const aiAnalysisSteps: AiAnalysisStep[] = [
  {
    id: 'image-received',
    title: '1. 이미지 수신',
    description: '사진을 안전하게 업로드 완료',
    status: 'complete',
    iconName: 'image',
  },
  {
    id: 'preprocess',
    title: '2. 전처리',
    description: '품질 향상 및 노이즈 제거',
    status: 'complete',
    iconName: 'scan',
  },
  {
    id: 'object-detection',
    title: '3. 객체 탐지 (포트홀)',
    description: '도로 손상 영역 탐지',
    status: 'complete',
    iconName: 'crosshair',
  },
  {
    id: 'feature-analysis',
    title: '4. 특성 분석',
    description: '균열, 깊이, 면적 등 분석',
    status: 'complete',
    iconName: 'shield',
  },
  {
    id: 'result-summary',
    title: '5. 결과 종합',
    description: '포트홀 가능성 및 위험도 산출',
    status: 'complete',
    iconName: 'fileCheck',
  },
]

export const aiRecommendedActions: AiRecommendedAction[] = [
  {
    id: 'confirm-report',
    title: '신고 확정',
    description: '이 내용으로 관할기관 안내 화면을 확인합니다.',
    actionType: 'confirm',
    route: '/agency',
    variant: 'primary',
    iconName: 'checkCircle',
  },
  {
    id: 'retake-photo',
    title: '재촬영 권장',
    description: '더 좋은 진단을 위해 촬영해 주세요.',
    actionType: 'retake',
    route: '/report',
    variant: 'secondary',
    iconName: 'camera',
  },
  {
    id: 'suspect-report',
    title: '허위 신고 의심',
    description: '포트홀로 보기 어렵습니다.',
    actionType: 'suspect',
    variant: 'warning',
    iconName: 'shieldAlert',
  },
]

export const recentAiResults: RecentAiResult[] = [
  {
    id: 'recent-ai-1',
    thumbnailSources: [
      '/assets/ai-review/recent-ai-1.webp',
      '/assets/ai-review/recent-ai-1.png',
      '/assets/ai-review/ai-review-main.webp',
      '/assets/ai-review/ai-review-main.png',
      '/assets/report/report-pothole-preview.webp',
      '/assets/report/report-pothole-preview.png',
    ],
    percent: 96,
    level: '매우 높음',
    location: '서울 강남구 테헤란로 123',
    date: '2024.07.12 14:35',
  },
  {
    id: 'recent-ai-2',
    thumbnailSources: [
      '/assets/ai-review/recent-ai-2.webp',
      '/assets/ai-review/recent-ai-2.png',
      '/assets/ai-review/ai-review-main.webp',
      '/assets/ai-review/ai-review-main.png',
      '/assets/report/report-pothole-preview.webp',
      '/assets/report/report-pothole-preview.png',
    ],
    percent: 78,
    level: '높음',
    location: '서울 서초구 반포대로 45',
    date: '2024.07.12 11:22',
  },
  {
    id: 'recent-ai-3',
    thumbnailSources: [
      '/assets/ai-review/recent-ai-3.webp',
      '/assets/ai-review/recent-ai-3.png',
      '/assets/ai-review/ai-review-main.webp',
      '/assets/ai-review/ai-review-main.png',
      '/assets/report/report-pothole-preview.webp',
      '/assets/report/report-pothole-preview.png',
    ],
    percent: 42,
    level: '보통',
    location: '서울 송파구 올림픽로 300',
    date: '2024.07.11 16:08',
  },
  {
    id: 'recent-ai-4',
    thumbnailSources: [
      '/assets/ai-review/recent-ai-4.webp',
      '/assets/ai-review/recent-ai-4.png',
      '/assets/ai-review/ai-review-main.webp',
      '/assets/ai-review/ai-review-main.png',
      '/assets/report/report-pothole-preview.webp',
      '/assets/report/report-pothole-preview.png',
    ],
    percent: 12,
    level: '낮음',
    location: '서울 강동구 천호대로 89',
    date: '2024.07.11 09:41',
  },
]

export const recentCitizenReports: RecentCitizenReport[] = [
  {
    id: 'recent-report-1',
    status: '검수 완료',
    title: '포트홀 (도로 파임)',
    location: '강남구 테헤란로 123',
    date: '2024-05-24 10:23',
    thumbnailSources: ['/assets/report/recent-report-1.webp', '/assets/report/recent-report-1.png'],
    statusColor: 'orange',
  },
  {
    id: 'recent-report-2',
    status: '검토 중',
    title: '균열 (도로 갈라짐)',
    location: '서초구 효령로 256',
    date: '2024-05-23 14:56',
    thumbnailSources: ['/assets/report/recent-report-2.webp', '/assets/report/recent-report-2.png'],
    statusColor: 'blue',
  },
  {
    id: 'recent-report-3',
    status: '처리 완료',
    title: '포트홀 (도로 파임)',
    location: '송파구 올림픽로 45',
    date: '2024-05-22 10:18',
    thumbnailSources: ['/assets/report/recent-report-3.webp', '/assets/report/recent-report-3.png'],
    statusColor: 'green',
  },
  {
    id: 'recent-report-4',
    status: '모니터링 중',
    title: '침하 (도로 침하)',
    location: '강동구 올림픽로 98',
    date: '2024-05-20 16:40',
    thumbnailSources: ['/assets/report/recent-report-4.webp', '/assets/report/recent-report-4.png'],
    statusColor: 'cyan',
  },
]

export const potholeRiskZones: PotholeRiskZone[] = [
  {
    id: 'rz-001',
    roadName: '강남대로 327 인근',
    district: '서울 서초구',
    riskLevel: 'critical',
    riskScore: 94,
    lat: 37.493,
    lng: 127.028,
    mainReasons: ['최근 24시간 강수량 급증', '노후 하수관 밀집', '반복 신고 12건'],
    rainfallScore: 92,
    roadAgeScore: 78,
    sewerAgingScore: 88,
    undergroundConstructionScore: 64,
  },
  {
    id: 'rz-002',
    roadName: '올림픽대로 잠실 방향',
    district: '서울 송파구',
    riskLevel: 'high',
    riskScore: 82,
    lat: 37.515,
    lng: 127.094,
    mainReasons: ['대형 차량 통행량 높음', '우천 후 표면 균열 증가'],
    rainfallScore: 84,
    roadAgeScore: 72,
    sewerAgingScore: 53,
    undergroundConstructionScore: 44,
  },
  {
    id: 'rz-003',
    roadName: '동탄순환대로 18길',
    district: '경기 화성시',
    riskLevel: 'medium',
    riskScore: 63,
    lat: 37.2,
    lng: 127.073,
    mainReasons: ['택지 공사 차량 진입', '배수 취약 구간'],
    rainfallScore: 66,
    roadAgeScore: 48,
    sewerAgingScore: 42,
    undergroundConstructionScore: 76,
  },
  {
    id: 'rz-004',
    roadName: '광안해변로 민락교차로',
    district: '부산 수영구',
    riskLevel: 'low',
    riskScore: 34,
    lat: 35.153,
    lng: 129.124,
    mainReasons: ['최근 보수 완료', '신고 감소 추세'],
    rainfallScore: 31,
    roadAgeScore: 38,
    sewerAgingScore: 29,
    undergroundConstructionScore: 18,
  },
]

export const citizenReports: CitizenReport[] = [
  {
    id: 'rp-2411',
    location: '서울 서초구 서초동 1327-7',
    roadName: '강남대로 327',
    reportedAt: '2026-05-17 08:42',
    aiConfidence: 87,
    empathyCount: 46,
    status: 'reviewing',
  },
  {
    id: 'rp-2412',
    location: '서울 송파구 신천동 29',
    roadName: '올림픽대로 잠실 방향',
    reportedAt: '2026-05-17 09:18',
    aiConfidence: 79,
    empathyCount: 22,
    status: 'received',
  },
  {
    id: 'rp-2413',
    location: '부산 수영구 민락동 181',
    roadName: '광안해변로',
    reportedAt: '2026-05-16 20:31',
    aiConfidence: 62,
    empathyCount: 9,
    status: 'completed',
  },
]

export const agencyContacts: AgencyContact[] = [
  {
    id: 'ag-001',
    roadType: 'city',
    category: '도로관리',
    departmentName: '도로관리과',
    responsibility: '도로 유지 · 보수, 시설물 관리',
    agencyName: '강남구 도로관리과',
    department: '도로보수 대응팀',
    phone: '02-3423-1234',
    address: '서울특별시 강남구 학동로 426',
    processingGuide: '사고 위치와 도로 관리 주체를 확인한 뒤 담당 부서 안내를 제공합니다.',
  },
  {
    id: 'ag-002',
    roadType: 'district',
    category: '시설 보수',
    departmentName: '도로시설팀',
    responsibility: '포장, 노면, 안전시설 보수',
    agencyName: '강남구 도로시설팀',
    department: '도로시설 유지관리팀',
    phone: '02-3423-5678',
    address: '서울특별시 강남구 학동로 426',
    processingGuide: '노면 파손 상태를 확인하고 보수 일정 검토를 돕습니다.',
  },
  {
    id: 'ag-003',
    roadType: 'national',
    category: '보상 업무',
    departmentName: '재난안전보험 담당',
    responsibility: '사고 접수 및 보상 안내',
    agencyName: '강남구 재난안전보험 담당',
    department: '사고 접수 및 보상 안내',
    phone: '02-3423-9876',
    address: '서울특별시 강남구 학동로 426',
    processingGuide: '보상 가능 여부 판단이 아닌, 접수 절차와 필요 서류 안내를 제공합니다.',
  },
]

export const agencyLookupResult: AgencyLookupResult = {
  selectedLocation: '서울특별시 강남구 테헤란로 123',
  roadAddress: '서울특별시 강남구 테헤란로 123',
  lotAddress: '(역삼동 123-45)',
  province: '서울특별시',
  districtOffice: '강남구청',
  roadManagementAgency: '강남구 도로관리과',
  mapImageUrl: '/assets/agency/agency-location-map.webp',
  fallbackMapImageUrl: '/assets/agency/agency-location-map.png',
}

export const compensationSteps: CompensationStep[] = [
  {
    id: 'prepare',
    title: '접수 준비',
    description: '정보 입력 및 서류 준비',
    status: 'active',
  },
  {
    id: 'review',
    title: '서류 확인',
    description: '제출 서류 검토',
    status: 'pending',
  },
  {
    id: 'submitted',
    title: '제출 완료',
    description: '접수 진행 및 결과 안내',
    status: 'pending',
  },
]

export const accidentInfo: AccidentInfo = {
  occurredAt: '2024-05-20 (월) 14:35',
  location: '서울특별시 강남구 테헤란로 123',
  lotAddress: '(역삼동 123-45)',
  accidentType: '도로 파손으로 인한 차량 손상',
  accidentDescription: '주행 중 도로 파손(포트홀)로 인해 타이어 및 휠 손상 발생',
}

export const evidencePhotos: EvidencePhoto[] = [
  {
    id: 'evidence-road',
    title: '도로 파손 부위',
    imageUrl: '/assets/agency/damage-road.webp',
    fallbackImageUrl: '/assets/agency/damage-road.png',
    alt: '도로 파손 부위 사진',
    fallbackType: 'road',
  },
  {
    id: 'evidence-wheel',
    title: '차량 휠 손상',
    imageUrl: '/assets/agency/damage-wheel.webp',
    fallbackImageUrl: '/assets/agency/damage-wheel.png',
    alt: '차량 휠 손상 사진',
    fallbackType: 'wheel',
  },
  {
    id: 'evidence-tire',
    title: '타이어 손상',
    imageUrl: '/assets/agency/damage-tire.webp',
    fallbackImageUrl: '/assets/agency/damage-tire.png',
    alt: '타이어 손상 사진',
    fallbackType: 'tire',
  },
]

export const vehicleInfo: VehicleInfo = {
  plateNumber: '12가 3456',
  model: '현대 쏘나타',
  year: '2020',
  insuranceCompany: '삼성화재',
  phone: '010-1234-5678',
}

export const claimChecklistItems: ClaimChecklistItem[] = [
  {
    id: 'claim-form',
    title: '보상 청구서 (기본 정보)',
    status: '완료',
  },
  {
    id: 'accident-statement',
    title: '사고 경위서',
    status: '완료',
  },
  {
    id: 'damage-photos',
    title: '피해 사진',
    status: '완료',
  },
  {
    id: 'repair-estimate',
    title: '수리 견적서',
    status: '준비 중',
  },
  {
    id: 'bankbook-copy',
    title: '통장 사본',
    status: '준비 중',
  },
  {
    id: 'id-copy',
    title: '신분증 사본',
    status: '준비 중',
  },
]

export const claimDocumentPreview: ClaimDocumentPreview = {
  imageUrl: '/assets/agency/claim-document-preview.webp',
  fallbackImageUrl: '/assets/agency/claim-document-preview.png',
  currentPage: 1,
  totalPage: 2,
}

export const compensationDrafts: CompensationDraft[] = [
  {
    id: 'cd-001',
    damageType: '타이어 파손 및 휠 흠집',
    location: '강남대로 327 인근 3차로',
    occurredAt: '2026-05-17 08:35',
    attachedEvidenceCount: 4,
    draftStatus: '청구서 초안 작성 가능',
  },
]

export const weatherAlerts: WeatherAlert[] = [
  {
    id: 'wa-001',
    title: '강남권 시간당 강수량 증가',
    district: '서울 강남구, 서초구',
    rainfallAmount: 37,
    riskMessage: '집중호우 이후 노면 파손 신고가 증가할 가능성이 높습니다.',
    issuedAt: '2026-05-17 09:00',
  },
  {
    id: 'wa-002',
    title: '부산 해안도로 배수 주의',
    district: '부산 수영구',
    rainfallAmount: 18,
    riskMessage: '해안가 배수 취약 구간에서 물 고임 신고가 접수되었습니다.',
    issuedAt: '2026-05-17 07:40',
  },
]

export const adminReportRows: AdminReportRow[] = [
  {
    id: 'ad-001',
    roadName: '강남대로 327',
    district: '서울 서초구',
    riskLevel: 'critical',
    reportCount: 31,
    empathyCount: 144,
    untreatedDays: 9,
    status: 'reviewing',
    priorityScore: 96,
  },
  {
    id: 'ad-002',
    roadName: '올림픽대로 잠실 방향',
    district: '서울 송파구',
    riskLevel: 'high',
    reportCount: 19,
    empathyCount: 88,
    untreatedDays: 5,
    status: 'scheduled',
    priorityScore: 84,
  },
  {
    id: 'ad-003',
    roadName: '동탄순환대로 18길',
    district: '경기 화성시',
    riskLevel: 'medium',
    reportCount: 8,
    empathyCount: 27,
    untreatedDays: 3,
    status: 'received',
    priorityScore: 62,
  },
  {
    id: 'ad-004',
    roadName: '광안해변로 민락교차로',
    district: '부산 수영구',
    riskLevel: 'low',
    reportCount: 4,
    empathyCount: 12,
    untreatedDays: 0,
    status: 'completed',
    priorityScore: 31,
  },
]

export const riskMapStats: RiskMapStats = {
  highRiskCount: 5,
  recentReportCount: 128,
  aiAccuracy: 91.3,
  highRiskDelta: 2,
  reportDeltaPercent: 23,
  accuracyDeltaPercent: 6.2,
}

export const riskMapFilters: RiskMapFilter[] = [
  {
    id: 'rainfall',
    title: '강수 이력',
    value: '최근 7일 (누적)',
  },
  {
    id: 'roadYear',
    title: '도로 준공연도',
    value: '전체',
  },
  {
    id: 'sewerAging',
    title: '하수관 노후도',
    value: '전체',
  },
  {
    id: 'undergroundConstruction',
    title: '지하 공사 현황',
    value: '전체',
  },
]

export const riskHighZones: RiskMapHighZone[] = [
  {
    id: 'risk-zone-gangnam-001',
    riskGrade: '긴급',
    roadName: '강남구 언주로 123',
    detailLocation: '언주역 사거리 인근',
    riskPercent: 83,
    reasons: ['강수 영향', '하수관 노후', '지하 공사'],
    recentReportTime: '15분 전',
    reportCount: 3,
    status: '점검 중',
    expectedAction: '당일 내',
  },
  {
    id: 'risk-zone-jongno-002',
    riskGrade: '주의',
    roadName: '종로구 창경궁로 256',
    detailLocation: '혜화역 인근',
    riskPercent: 68,
    reasons: ['강수 영향', '도로 노후'],
    recentReportTime: '1시간 전',
    reportCount: 5,
    status: '접수 완료',
    expectedAction: '1~2일 내',
  },
  {
    id: 'risk-zone-mapo-003',
    riskGrade: '관심',
    roadName: '마포구 월드컵로 45',
    detailLocation: '홍대입구역 인근',
    riskPercent: 36,
    reasons: ['강수 영향', '포장 균열'],
    recentReportTime: '3시간 전',
    reportCount: 2,
    status: '모니터링',
    expectedAction: '3~5일 내',
  },
  {
    id: 'risk-zone-seocho-004',
    riskGrade: '안전/관찰',
    roadName: '서초구 반포대로 98',
    detailLocation: '고속터미널역 인근',
    riskPercent: 12,
    reasons: ['양호'],
    recentReportTime: '1일 전',
    reportCount: 1,
    status: '보수 완료',
    expectedAction: '완료',
  },
]

export const riskLegend: RiskMapLegendItem[] = [
  {
    id: 'safe',
    label: '안전',
    range: '0~20%',
    color: 'green',
  },
  {
    id: 'attention',
    label: '관심',
    range: '20~40%',
    color: 'yellow',
  },
  {
    id: 'caution',
    label: '주의',
    range: '40~70%',
    color: 'orange',
  },
  {
    id: 'danger',
    label: '위험',
    range: '70% 이상',
    color: 'red',
  },
]

export const currentDangerAlert: CurrentDangerAlert = {
  id: 'current-danger-gangnam-001',
  title: '전방 50m 포트홀 위험 구간',
  riskLevel: 'danger',
  location: '강남구 테헤란로 123',
  direction: '진행 방향 2차로',
  distanceMeters: 50,
  badgeLabel: '위험',
}

export const routePreview: RoutePreview = {
  estimatedArrival: '14:24',
  remainingDistance: '4.2 km',
  routeMapImageUrl: '/assets/alerts/alert-route-map.webp',
}

export const alertToggleSettings: AlertToggleSetting[] = [
  {
    id: 'alert-toggle-push',
    title: '푸시 알림',
    description: '위험 구간 발생 시 푸시 알림을 받습니다.',
    status: '활성',
    enabled: true,
    type: 'push',
  },
  {
    id: 'alert-toggle-voice',
    title: '음성 알림',
    description: '운전 중 음성으로 위험 정보를 안내합니다.',
    status: '활성',
    enabled: true,
    type: 'voice',
  },
  {
    id: 'alert-toggle-rain',
    title: '집중호우 시 자동 상향',
    description: '집중호우 감지 시 알림 강도를 자동으로 상향합니다.',
    status: '활성',
    enabled: true,
    type: 'rain',
  },
]

export const recentDangerAlerts: RecentDangerAlert[] = [
  {
    id: 'recent-danger-001',
    time: '14:21',
    relativeTime: '방금 전',
    riskLevel: 'danger',
    riskLabel: '위험',
    title: '전방 50m 포트홀 위험 구간',
    detail: '강남구 테헤란로 123 | 진행 방향 2차로',
    distanceText: '50m',
  },
  {
    id: 'recent-danger-002',
    time: '14:17',
    relativeTime: '4분 전',
    riskLevel: 'caution',
    riskLabel: '주의',
    title: '전방 120m 도로 균열 발생',
    detail: '강남구 논현로 456 | 진행 방향 1차로',
    distanceText: '120m',
  },
  {
    id: 'recent-danger-003',
    time: '14:12',
    relativeTime: '9분 전',
    riskLevel: 'attention',
    riskLabel: '관심',
    title: '전방 350m 도로 패임 구간',
    detail: '강남구 도산대로 789 | 진행 방향 2차로',
    distanceText: '350m',
  },
  {
    id: 'recent-danger-004',
    time: '14:05',
    relativeTime: '16분 전',
    riskLevel: 'safe',
    riskLabel: '안전',
    title: '구간 통과 완료',
    detail: '역삼역 사거리 구간',
    distanceText: '통과 완료',
    statusText: '통과 완료',
  },
]

export const alertSettings: AlertSettings = {
  quietHoursEnabled: true,
  quietStartTime: '22:00',
  quietEndTime: '07:00',
  selectedDays: '매일',
  alertRadiusMeters: 500,
}
