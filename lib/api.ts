const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const api = {
  baseUrl: API_BASE_URL,
  healthUrl: `${API_BASE_URL}/health`,
  ping: (payload: unknown) => request('/ping', { method: 'POST', body: JSON.stringify(payload) }),
  traceroute: (payload: unknown) => request('/traceroute', { method: 'POST', body: JSON.stringify(payload) }),
  analyze: (payload: unknown) => request('/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  compare: (payload: unknown) => request('/compare', { method: 'POST', body: JSON.stringify(payload) }),
  history: () => request('/history'),
  health: () => request('/health'),
}

export default api
