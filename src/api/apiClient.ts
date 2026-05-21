const DEFAULT_API_BASE_URL = 'http://localhost:8081'

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown
  headers?: HeadersInit
}

type ApiFormOptions = Omit<RequestInit, 'body' | 'headers'> & {
  headers?: HeadersInit
}

export class ApiError extends Error {
  status: number
  statusText: string
  url: string
  body: unknown

  constructor({
    body,
    message,
    status,
    statusText,
    url,
  }: {
    body: unknown
    message: string
    status: number
    statusText: string
    url: string
  }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.url = url
    this.body = body
  }
}

function getConfiguredApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
}

function shouldUseDevProxy(apiBaseUrl: string) {
  return import.meta.env.DEV && /^https?:\/\/(localhost|127\.0\.0\.1):8081\/?$/.test(apiBaseUrl)
}

function getRequestBaseUrl() {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl()

  if (shouldUseDevProxy(configuredApiBaseUrl)) {
    return ''
  }

  return configuredApiBaseUrl.replace(/\/$/, '')
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getRequestBaseUrl()}${normalizedPath}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getErrorMessage(body: unknown, fallback: string) {
  if (isRecord(body)) {
    const message = body.message ?? body.error ?? body.detail

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (typeof body === 'string' && body.trim()) {
    return body
  }

  return fallback
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json() as Promise<unknown>
  }

  return response.text()
}

async function throwApiError(response: Response): Promise<never> {
  const body = await readResponseBody(response)
  const fallback = `API 요청에 실패했습니다. (${response.status} ${response.statusText})`

  throw new ApiError({
    body,
    message: getErrorMessage(body, fallback),
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  })
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    await throwApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function apiJson<T>(path: string, options: ApiRequestOptions = {}) {
  const { body, headers, ...requestOptions } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildApiUrl(path), {
    ...requestOptions,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  return parseJsonResponse<T>(response)
}

export async function apiForm<T>(path: string, formData: FormData, options: ApiFormOptions = {}) {
  const { headers, ...requestOptions } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')

  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    ...requestOptions,
    headers: requestHeaders,
    body: formData,
  })

  return parseJsonResponse<T>(response)
}

export async function apiBlob(path: string, options: Omit<RequestInit, 'body'> = {}) {
  const response = await fetch(buildApiUrl(path), options)

  if (!response.ok) {
    await throwApiError(response)
  }

  return response.blob()
}
