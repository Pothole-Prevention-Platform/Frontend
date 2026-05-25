export interface AgencyDepartment {
  category?: string
  departmentName?: string
  mainTask?: string
  phoneNumber?: string
  [key: string]: unknown
}

export interface AgencyInfo {
  sido?: string
  districtName?: string
  agencyName?: string
  departments?: AgencyDepartment[]
  roadName?: string
  managingAuthority?: string
  departmentName?: string
  mainTask?: string
  phone?: string
  phoneNumber?: string
  contact?: string
  address?: string
  [key: string]: unknown
}
