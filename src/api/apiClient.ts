import type { ErrorBody } from '../types/api'

const DEFAULT_API_BASE_URL = 'http://localhost:8081'

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
}

type ApiFormOptions = Omit<RequestInit, 'body' | 'headers'> & {
  headers?: HeadersInit
}

type ApiErrorInput = {
  body: unknown
  code?: string
  message: string
  status: number
  statusText: string
  url: string
}

export class ApiError extends Error {
  readonly body: unknown
  readonly code?: string
  readonly status: number
  readonly statusText: string
  readonly url: string

  constructor({ body, code, message, status, statusText, url }: ApiErrorInput) {
    super(message)
    this.name = 'ApiError'
    this.body = body
    this.code = code
    this.status = status
    this.statusText = statusText
    this.url = url
  }
}

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function getErrorBody(body: unknown): ErrorBody | undefined {
  if (!isRecord(body)) {
    return undefined
  }

  if (isRecord(body.error)) {
    return body.error
  }

  const code = getString(body.code)
  const message = getString(body.message)

  if (code || message) {
    return { code, message }
  }

  return undefined
}

function buildErrorMessage(status: number, statusText: string, body: unknown) {
  const errorBody = getErrorBody(body)
  const code = getString(errorBody?.code)
  const backendMessage = getString(errorBody?.message)
  const statusLabel = status > 0 ? `${status}${statusText ? ` ${statusText}` : ''}` : '네트워크 오류'
  const details = [code ? `[${code}]` : undefined, backendMessage].filter(Boolean).join(' ')

  return details ? `API 요청에 실패했습니다. (${statusLabel}) ${details}` : `API 요청에 실패했습니다. (${statusLabel})`
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as unknown
    } catch {
      return undefined
    }
  }

  const text = await response.text()

  if (!text.trim()) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

async function request(path: string, options: RequestInit) {
  const url = buildApiUrl(path)

  try {
    return await fetch(url, options)
  } catch (error) {
    const detail = error instanceof Error ? error.message : '알 수 없는 연결 오류'

    throw new ApiError({
      body: error,
      code: 'NETWORK',
      message: `백엔드 서버에 연결하지 못했습니다. (네트워크 오류) ${detail}`,
      status: 0,
      statusText: 'NETWORK_ERROR',
      url,
    })
  }
}

async function parseJsonResponse(response: Response) {
  const body = await readResponseBody(response)

  if (!response.ok) {
    const errorBody = getErrorBody(body)

    throw new ApiError({
      body,
      code: getString(errorBody?.code),
      message: buildErrorMessage(response.status, response.statusText, body),
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    })
  }

  return body
}

export function unwrapApiResponse<T>(body: unknown): T {
  if (!isRecord(body)) {
    return body as T
  }

  const hasWrapperShape =
    'success' in body ||
    'data' in body ||
    'result' in body ||
    'payload' in body ||
    'body' in body ||
    'response' in body ||
    'error' in body

  if (!hasWrapperShape) {
    return body as T
  }

  if (body.success === false) {
    const errorBody = getErrorBody(body)

    throw new ApiError({
      body,
      code: getString(errorBody?.code),
      message: buildErrorMessage(0, '', body),
      status: 0,
      statusText: 'API_ERROR',
      url: '',
    })
  }

  if ('data' in body) {
    return body.data as T
  }

  if ('result' in body) {
    return body.result as T
  }

  if ('payload' in body) {
    return body.payload as T
  }

  if ('body' in body) {
    return body.body as T
  }

  return body.response as T
}

export async function apiJson<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, ...requestOptions } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')
  requestHeaders.set('Content-Type', 'application/json')

  const response = await request(path, {
    ...requestOptions,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return unwrapApiResponse<T>(await parseJsonResponse(response))
}

export async function apiForm<T>(path: string, formData: FormData, options: ApiFormOptions = {}) {
  const { headers, ...requestOptions } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')

  const response = await request(path, {
    method: 'POST',
    ...requestOptions,
    headers: requestHeaders,
    body: formData,
  })

  return unwrapApiResponse<T>(await parseJsonResponse(response))
}

export async function apiBlob(path: string, options: Omit<RequestInit, 'body'> = {}) {
  const requestHeaders = new Headers(options.headers)
  requestHeaders.set('Accept', 'application/pdf,application/octet-stream,*/*')

  const response = await request(path, {
    ...options,
    headers: requestHeaders,
  })

  if (!response.ok) {
    const body = await readResponseBody(response)
    const errorBody = getErrorBody(body)

    throw new ApiError({
      body,
      code: getString(errorBody?.code),
      message: buildErrorMessage(response.status, response.statusText, body),
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    })
  }

  return response.blob()
}
