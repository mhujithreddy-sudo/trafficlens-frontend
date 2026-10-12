/**
 * TrafficLens Centralized API Client
 * 
 * Communicates with the FastAPI backend via NEXT_PUBLIC_API_URL.
 * Supports complete TypeScript interfaces, error handling, and offline detection.
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
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
      message = detail.detail || detail.error || detail.message || message;
    } catch {
      // JSON parse failed; keep default message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// TypeScript Interfaces
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: string;
  service: string;
  version?: string;
  database?: string;
  monitoring?: string;
  timestamp?: string;
  uptime_seconds?: number;
}

export interface NetworkInterfaceItem {
  name: string;
  ip: string;
  mac: string;
  is_up: boolean;
  speed_mbps: number;
  mtu: number;
  bytes_recv: number;
  bytes_sent: number;
  bytes_recv_formatted: string;
  bytes_sent_formatted: string;
}

export interface NetworkResponse {
  status: string;
  timestamp: string;
  hostname: string;
  local_ip: string;
  gateway?: string | null;
  os?: Record<string, string>;
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
  interfaces?: NetworkInterfaceItem[];
}

export interface BandwidthResponse {
  timestamp: string;
  active_interface: string;
  total_bytes_sent: number;
  total_bytes_recv: number;
  upload_speed_bps: number;
  download_speed_bps: number;
  upload_mbps: number;
  download_mbps: number;
  total_mbps: number;
  upload_speed_formatted: string;
  download_speed_formatted: string;
  total_speed_formatted: string;
  download_bytes_formatted: string;
  upload_bytes_formatted: string;
  total_bytes_formatted: string;
  packets_sent: number;
  packets_recv: number;
  traffic_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DeviceItem {
  id?: number;
  device_name: string;
  hostname?: string;
  interface?: string;
  ip_address: string;
  mac_address: string;
  status: string;
  download_usage: number;
  upload_usage: number;
  total_usage: number;
  download_bytes?: number;
  upload_bytes?: number;
  download_usage_formatted: string;
  upload_usage_formatted: string;
  total_usage_formatted: string;
  speed_mbps?: number;
  device_type: 'interface' | 'lan_neighbor' | string;
  is_local: boolean;
  first_seen?: string;
  last_seen?: string;
}

export interface DevicesResponse {
  status: string;
  timestamp?: string;
  devices_count: number;
  devices: DeviceItem[];
  limitation_note?: string;
}

export interface DeviceDetailResponse {
  device: DeviceItem;
  recent_traffic: Array<{
    id: number;
    timestamp: string;
    source_ip: string;
    destination_ip: string;
    source_port: number | null;
    destination_port: number | null;
    protocol: string;
    bytes: number;
    service: string;
  }>;
  top_services: any[];
}

export interface ServiceItem {
  service: string;
  protocol: string;
  connection_count: number;
  status: string;
  local_address: string;
  remote_address: string;
  sample_remote?: string;
  download_bytes?: number;
  upload_bytes?: number;
  total_bytes?: number;
  total_bytes_formatted?: string;
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

export interface TrafficRecordItem {
  id?: number;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port?: number | null;
  destination_port?: number | null;
  protocol: string;
  packet_count: number;
  bytes: number;
  bytes_formatted: string;
  download_bytes: number;
  upload_bytes: number;
  service: string;
}

export interface TrafficResponse {
  status: string;
  total_count: number;
  records: TrafficRecordItem[];
  packet_capture_active: boolean;
}

export interface TopEntity {
  entity: string | number;
  count: number;
  bytes: number;
  bytes_formatted: string;
}

export interface TrafficSummaryResponse {
  status: string;
  timestamp: string;
  total_packets: number;
  total_bytes: number;
  total_bytes_formatted: string;
  tcp_packets: number;
  udp_packets: number;
  icmp_packets: number;
  other_packets: number;
  top_source_ips: TopEntity[];
  top_destination_ips: TopEntity[];
  top_ports: TopEntity[];
  packet_capture_available: boolean;
}

export interface AnalyticsOverviewResponse {
  total_bandwidth: number;
  total_bandwidth_formatted: string;
  download_bytes: number;
  download_bytes_formatted: string;
  upload_bytes: number;
  upload_bytes_formatted: string;
  active_devices: number;
  total_packets: number;
  current_download_mbps: number;
  current_upload_mbps: number;
  current_download_rate: string;
  current_upload_rate: string;
  peak_download_mbps: number;
  peak_upload_mbps: number;
  traffic_level: 'LOW' | 'MEDIUM' | 'HIGH';
  network_load: 'Normal' | 'Moderate' | 'Heavy';
}

export interface TopDeviceItem {
  device: string;
  ip_address?: string;
  mac_address?: string;
  download_bytes: number;
  upload_bytes: number;
  total_bytes: number;
  total_bytes_formatted: string;
  percentage: number;
}

export interface TopServiceItem {
  service: string;
  protocol: string;
  download_bytes: number;
  upload_bytes: number;
  total_bytes: number;
  total_bytes_formatted: string;
  percentage: number;
}

export interface TimelinePoint {
  timestamp: string;
  time: string;
  download_mbps: number;
  upload_mbps: number;
  total_mbps: number;
  download_bytes: number;
  upload_bytes: number;
}

export interface TimelineResponse {
  status: string;
  range: string;
  points_count: number;
  points: TimelinePoint[];
}

export interface HistoryRecord {
  id?: number;
  timestamp: string;
  time: string;
  interface_name?: string;
  download: number;
  upload: number;
  total: number;
  download_mbps?: number;
  upload_mbps?: number;
  download_formatted: string;
  upload_formatted: string;
  total_formatted: string;
  download_bytes?: number;
  upload_bytes?: number;
  bytes_recv_total?: number;
  bytes_sent_total?: number;
}

export interface HistoryResponse {
  status: string;
  timestamp?: string;
  records_count: number;
  history: HistoryRecord[];
}

export interface AlertItem {
  id?: number;
  timestamp: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  device_id?: number | null;
  resolved: boolean;
}

export interface AlertsResponse {
  status: string;
  alerts_count: number;
  alerts: AlertItem[];
}

export interface SettingsResponse {
  app_name: string;
  app_env: string;
  monitoring_mode: string;
  packet_capture_enabled: boolean;
  packet_capture_available: boolean;
  sample_interval_seconds: number;
  history_retention_hours: number;
  traffic_level_low_mbps: number;
  traffic_level_medium_mbps: number;
  bandwidth_alert_threshold_mbps: number;
  cors_origins: string[];
}

// ---------------------------------------------------------------------------
// Centralized API Client Object
// ---------------------------------------------------------------------------

export const api = {
  baseUrl: API_BASE_URL,
  healthUrl: `${API_BASE_URL}/api/health`,

  // Health
  health: () => request<HealthResponse>('/api/health'),
  getHealth: () => request<HealthResponse>('/api/health'),

  // Network & Bandwidth
  getNetwork: () => request<NetworkResponse>('/api/network'),
  getBandwidth: () => request<BandwidthResponse>('/api/bandwidth'),
  getBandwidthHistory: (hours?: number, limit: number = 60) => {
    const q = new URLSearchParams();
    if (hours) q.set('hours', String(hours));
    q.set('limit', String(limit));
    return request<HistoryResponse>(`/api/bandwidth/history?${q.toString()}`);
  },

  // Devices
  getDevices: () => request<DevicesResponse>('/api/devices'),
  getDevice: (id: number) => request<DeviceDetailResponse>(`/api/devices/${id}`),
  getDeviceTraffic: (id: number, limit: number = 50) =>
    request<any>(`/api/devices/${id}/traffic?limit=${limit}`),

  // Services
  getServices: () => request<ServicesResponse>('/api/services'),

  // Traffic
  getTraffic: (params?: { limit?: number; protocol?: string; source_ip?: string; destination_ip?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.protocol) q.set('protocol', params.protocol);
    if (params?.source_ip) q.set('source_ip', params.source_ip);
    if (params?.destination_ip) q.set('destination_ip', params.destination_ip);
    return request<TrafficResponse>(`/api/traffic?${q.toString()}`);
  },
  getTrafficSummary: () => request<TrafficSummaryResponse>('/api/traffic/summary'),

  // Analytics
  getAnalyticsOverview: () => request<AnalyticsOverviewResponse>('/api/analytics/overview'),
  getAnalyticsTimeline: (range: string = '1h') =>
    request<TimelineResponse>(`/api/analytics/timeline?range=${range}`),
  getTopDevices: (limit: number = 10) =>
    request<TopDeviceItem[]>(`/api/analytics/top-devices?limit=${limit}`),
  getTopServices: (limit: number = 10) =>
    request<TopServiceItem[]>(`/api/analytics/top-services?limit=${limit}`),

  // Alerts
  getAlerts: (limit: number = 20, resolved: boolean = false) =>
    request<AlertsResponse>(`/api/alerts?limit=${limit}&resolved=${resolved}`),

  // History
  getHistory: (limit: number = 60) =>
    request<HistoryResponse>(`/api/history?limit=${limit}`),
  getHistoryTraffic: (limit: number = 100) =>
    request<{ status: string; records_count: number; records: any[] }>(`/api/history/traffic?limit=${limit}`),
  getHistoryBandwidth: (hours?: number, limit: number = 100) => {
    const q = new URLSearchParams();
    if (hours) q.set('hours', String(hours));
    q.set('limit', String(limit));
    return request<{ status: string; records_count: number; records: any[] }>(`/api/history/bandwidth?${q.toString()}`);
  },
  getHistoryDevices: (limit: number = 100) =>
    request<{ status: string; records_count: number; records: any[] }>(`/api/history/devices?limit=${limit}`),

  // Settings
  getSettings: () => request<SettingsResponse>('/api/settings'),
  updateSettings: (data: Partial<SettingsResponse>) =>
    request<SettingsResponse>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export default api;
