/**
 * API Client Utilities with Multi-Tenant Support
 * 
 * Provides helper functions for making API calls to the backend
 * with automatic base_id injection from BaseContext.
 */

/**
 * Configuration for API requests
 */
export interface ApiRequestConfig extends RequestInit {
  /** Optional base_id to override context value */
  baseId?: string;
  /** Additional headers to include */
  headers?: HeadersInit;
}

/**
 * Make an API request with base_id automatically injected
 * 
 * @param url - The API endpoint URL
 * @param baseId - The base_id to include in the request (required)
 * @param config - Optional fetch configuration
 * 
 * @returns The fetch Response object
 * 
 * @example
 * const { baseId } = useBase()
 * const response = await apiRequest('/api/scrape-followers', baseId, {
 *   method: 'POST',
 *   body: JSON.stringify({ usernames })
 * })
 */
export async function apiRequest(
  url: string,
  baseId: string,
  config?: ApiRequestConfig
): Promise<Response> {
  if (!baseId) {
    throw new Error('base_id is required for API requests. Did you forget to provide it from useBase()?')
  }

  // Merge headers with base_id
  const headers = new Headers(config?.headers)
  headers.set('X-Base-Id', baseId)
  headers.set('Content-Type', 'application/json')

  return fetch(url, {
    ...config,
    headers
  })
}

/**
 * Make a GET request with base_id
 */
export async function apiGet<T = any>(
  url: string,
  baseId: string,
  config?: ApiRequestConfig
): Promise<T> {
  // Get base URL from env
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`
  
  const response = await apiRequest(fullUrl, baseId, {
    ...config,
    method: 'GET'
  })
  
  return response.json()
}

/**
 * Make a POST request with base_id
 */
export async function apiPost<T = any>(
  url: string,
  baseId: string,
  body?: any,
  config?: ApiRequestConfig
): Promise<T> {
  // Get base URL from env
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`
  
  const response = await apiRequest(fullUrl, baseId, {
    ...config,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined
  })
  
  return response.json()
}

/**
 * Make a PUT request with base_id
 */
export async function apiPut<T = any>(
  url: string,
  baseId: string,
  body?: any,
  config?: ApiRequestConfig
): Promise<T> {
  // Get base URL from env
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`
  
  const response = await apiRequest(fullUrl, baseId, {
    ...config,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined
  })
  
  return response.json()
}

/**
 * Make a DELETE request with base_id
 */
export async function apiDelete<T = any>(
  url: string,
  baseId: string,
  config?: ApiRequestConfig
): Promise<T> {
  // Get base URL from env
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
  const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`
  
  const response = await apiRequest(fullUrl, baseId, {
    ...config,
    method: 'DELETE'
  })
  
  return response.json()
}

/**
 * Legacy wrapper for backward compatibility
 * 
 * @deprecated Use apiPost instead
 */
export async function apiPostLegacy(
  url: string,
  baseId: string,
  data: any
): Promise<Response> {
  return apiPost(url, baseId, data)
}
