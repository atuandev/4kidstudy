import { getAccessToken, getRefreshToken } from "./get-token"

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string
  noAuth?: boolean
  isFileUpload?: boolean
}

type CustomBody = FormData | string | undefined

const formatUrl = (url: string, baseUrl: string): string => {
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${cleanUrl}`
}

const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  options?: CustomOptions
) => {
  let body: CustomBody = undefined

  if (options?.body instanceof FormData) {
    body = options.body
  } else if (options?.body && typeof options.body === 'object') {
    body = JSON.stringify(options.body)
  } else if (typeof options?.body === 'string') {
    body = options.body
  }

  const baseHeaders: {
    [key: string]: string
  } =
    body instanceof FormData
      ? {}
      : {
          'Content-Type': 'application/json',
          credentials: 'include',
        }

  // Get both tokens using server actions
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ])

  // Add Authorization header if token exists and auth is not disabled
  if (accessToken && !options?.noAuth) {
    baseHeaders.Authorization = `Bearer ${accessToken}`
  }

  if (options?.isFileUpload) {
    delete baseHeaders['Content-Type']
  }

  const baseUrl = options?.baseUrl ?? process.env.NEXT_PUBLIC_API_ENDPOINT ?? ''

  try {
    const res = await fetch(formatUrl(url, baseUrl), {
      ...options,
      headers: {
        ...baseHeaders,
        ...options?.headers,
      } as Headers,
      body,
      method,
      credentials: 'include', // Always include credentials
    })

    // Handle 401 errors by attempting to refresh token
    // if (res.status === 401 && !url.includes('/auth/refresh')) {
    //   try {
    //     const refreshRes = await fetch(formatUrl('/auth/refresh', baseUrl), {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({ refreshToken: 'refreshToken' }),
    //     })

    //     if (refreshRes.ok) {
    //       // Retry the original request with the new token
    //       const { payload: refreshData } = await refreshRes.json()
    //       if (refreshData?.data?.accessToken) {
    //         // Update headers with new token
    //         baseHeaders.Authorization = `Bearer ${refreshData.data.accessToken}`

    //         // Retry original request
    //         const retryRes = await fetch(formatUrl(url, baseUrl), {
    //           ...options,
    //           headers: {
    //             ...baseHeaders,
    //             ...options?.headers,
    //           } as Headers,
    //           body,
    //           method,
    //         })

    //         const retryPayload: Response = await retryRes.json()
    //         return {
    //           status: retryRes.status,
    //           payload: retryPayload,
    //         }
    //       }
    //     }
    //   } catch (refreshError) {
    //     console.error('Token refresh failed:', refreshError)
    //   }
    // }

    const responseText = await res.text()
    const contentType = res.headers.get('content-type') ?? ''
    const payload: Response =
      res.status === 204 ||
      responseText.trim().length === 0 ||
      !contentType.includes('application/json')
        ? (null as Response)
        : (JSON.parse(responseText) as Response)
    return { status: res.status, payload }
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
}

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('GET', url, options)
  },
  post<Response>(url: string, body: CustomBody, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(url: string, body: CustomBody, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PUT', url, { ...options, body })
  },
  delete<Response>(url: string, body?: CustomBody, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('DELETE', url, { ...options, body })
  },
  patch<Response>(url: string, body: CustomBody, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PATCH', url, { ...options, body })
  },
}

export default http
