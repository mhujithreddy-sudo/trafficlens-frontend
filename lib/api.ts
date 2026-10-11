/**
 * TrafficLens Centralized API Client
 * 
 * Communicates with the Python Flask backend via NEXT_PUBLIC_API_URL.
 * Supports TypeScript interfaces, error handling, and offline detection.
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://trafficlens-backendtrafficlens-backend.onrender.com'
).trim().replace(/\/api\/?$/, '').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let response: Response;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(id);
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request to ${path} timed out. Check if backend is responsive.`);
    }
    throw new Error('Unable to connect to TrafficLens backend. Please make sure the backend server is running.');
  }

  if (!response.ok) {
    let message = `API request failed with HTTP status ${response.status}`;
    try {
      const detail = await response.json();
      message = detail.error || detail.message || message;
    } catch {
      // JSON parse failed; keep default message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp?: string;
  uptime_seconds?: number;
}

export interface NetworkResponse {
  status: string;
  timestamp: string;
  download_bytes: number;
  upload_bytes: number;
  total_bytes: number;
  download_bytes_formatted: string;
  upload_bytes_formatted: string;
  total_bytes_formatted: string;
  download_speed: number;
  upload_speed: number;
  total_speed: number;
  download_speed_formatted: string;
  upload_speed_formatted: string;
  total_speed_formatted: string;
  packets_sent?: number;
  packets_recv?: number;
}

export interface DeviceItem {
  device_name: string;
  interface?: string;
  ip_address: string;
  mac_address: string;
  status: string;
  download_usage: number;
  upload_usage: number;
  total_usage: number;
  download_usage_formatted: string;
  upload_usage_formatted: string;
  total_usage_formatted: string;
  speed_mbps?: number;
  device_type: 'interface' | 'lan_neighbor';
  is_local: boolean;
}

export interface DevicesResponse {
  status: string;
  timestamp?: string;
  devices_count: number;
  devices: DeviceItem[];
  limitation_note?: string;
}

export interface ServiceItem {
  service: string;
  protocol: string;
  connection_count: number;
  status: string;
  local_address: string;
  remote_address: string;
  sample_remote?: string;
}

export interface ConnectionDetail {
  service: string;
  pid: number | string;
  protocol: string;
  local_address: string;
  remote_address: string;
  status: string;
}

export interface ServicesResponse {
  status: string;
  timestamp?: string;
  total_connections: number;
  services: ServiceItem[];
  connections: ConnectionDetail[];
}

export interface HistoryRecord {
  timestamp: string;
  time: string;
  download: number;
  upload: number;
  total: number;
  download_formatted: string;
  upload_formatted: string;
  total_formatted: string;
  bytes_recv_total?: number;
  bytes_sent_total?: number;
}

export interface HistoryResponse {
  status: string;
  timestamp?: string;
  records_count: number;
  history: HistoryRecord[];
}

export const api = {
  baseUrl: API_BASE_URL,
  healthUrl: `${API_BASE_URL}/api/health`,
  health: () => request<HealthResponse>('/api/health'),
  getHealth: () => request<HealthResponse>('/api/health'),
  getNetwork: () => request<NetworkResponse>('/api/network'),
  getDevices: () => request<DevicesResponse>('/api/devices'),
  getServices: () => request<ServicesResponse>('/api/services'),
  getHistory: () => request<HistoryResponse>('/api/history'),
};

export default api;
