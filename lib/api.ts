const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').trim().replace(/\/$/, '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured. Set it to the deployed Flask backend URL.')
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options })
  } catch {
    throw new Error('Cannot connect to the Python backend. Check the API URL, server status, and CORS configuration.')
  }
  if (!response.ok) { let message = `API request failed (${response.status})`; try { const detail = await response.json(); message = detail.error || detail.message || detail.detail || message } catch {} throw new Error(message) }
  return response.json() as Promise<T>
}

export const api = {
  baseUrl: API_BASE_URL,
  healthUrl: `${API_BASE_URL}/api/health`,
  ping: (target: string, signal?: AbortSignal) => request('/api/ping', { method: 'POST', body: JSON.stringify({ target }), signal }),
  traceroute: (target: string, signal?: AbortSignal) => request('/api/traceroute', { method: 'POST', body: JSON.stringify({ target }), signal }),
  analyze: (payload: unknown) => request('/api/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  compare: (payload: unknown) => request('/api/compare', { method: 'POST', body: JSON.stringify(payload) }),
  history: () => request('/api/history'),
  health: () => request('/api/health'),
}

export default api
