export interface ErrorBody {
  code?: string
  message?: string
  [key: string]: unknown
}

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  result?: T
  payload?: T
  response?: T
  error?: ErrorBody | null
  [key: string]: unknown
}
