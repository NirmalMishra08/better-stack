import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || '/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Try to get fresh Firebase token
    try {
      const { getFirebaseToken } = await import('./auth');
      const token = await getFirebaseToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback to localStorage token if available
        const storedToken = localStorage.getItem('firebase_token');
        if (storedToken && storedToken !== 'frontend') {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    } catch {
      // Fallback to localStorage token
      const storedToken = localStorage.getItem('firebase_token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
    }
    return config;
  },
  () => {
    return Promise.reject(new Error('Request failed'));
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('firebase_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types
export interface CreateMonitorRequest {
  url: string;
  method: string;
  type: string;
  interval: number;
  status?: string;
  is_active: boolean;
}

export interface Monitor {
  id: number;
  user_id: string;
  url: string;
  method: string;
  type: string;
  interval: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMonitorResponse {
  monitor: Monitor;
  first_check?: {
    url: string;
    status_code: number;
    response_time: number;
    status: string;
    dns_ok: boolean;
    ssl_ok: boolean;
    error?: string;
  };
  message: string;
}

export interface MonitorStatusResponse {
  monitor: Monitor;
  logs: MonitorLog[];
  stats: {
    uptime_percentage: number;
    avg_response_time: number;
    total_checks: number;
    last_24h_up: number;
    last_24h_down: number;
  };
}

export interface MonitorLog {
  id: number;
  monitor_id: number;
  status_code: number | null;
  response_time: number | null;
  dns_ok: boolean | null;
  ssl_ok: boolean | null;
  content_ok: boolean | null;
  screenshot_url: string | null;
  checked_at: string;
}

export interface MonitorLogsResponse {
  logs: MonitorLog[];
  pageination: {
    limit: number;
    offset: number;
    total: number[];
    hasMore: boolean;
  };
}

export interface ToggleMonitorRequest {
  id: number;
  is_active: boolean;
}

export interface UpdateMonitorRequest {
  id: number;
  url: string;
  method?: string;
  type?: string;
  interval: number;
  is_active?: boolean;
}

export interface AuthRequest {
  provider?: string;
  email?: string;
  phone?: string;
  full_name?: string;
  password?: string;
}

export interface AuthResponse {
  user_id: string;
  provider: string;
  email: string;
  full_name: string;
}

export interface User {
  id: string;
  email: string;
  fullname: string;
  provider: string;
  phone: string | null;
  password_hash?: string | null;
  role?: string;
  profile_status?: string | null;
  created_at: string;
  updated_at: string;
  // User profile fields (from LEFT JOIN)
  id_2?: number | null;
  user_id?: string | null;
  is_premium?: boolean | null;
  stripe_id?: string | null;
  name?: string | null;
  bio?: string | null;
  created_at_2?: string | null;
  updated_at_2?: string | null;
}

// Auth API
export const authAPI = {
  login: async (token: string, userData?: AuthRequest): Promise<AuthResponse> => {
    try {
      console.log('Calling backend login endpoint:', `${API_BASE_URL}${API_VERSION}/auth/login`);
      console.log('Using Firebase token:', token ? 'Token present' : 'No token');
      const response = await apiClient.post('/auth/login', userData || {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Backend login response:', response.data);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { message?: string; response?: { data?: unknown; status?: number }; config?: { url?: string } };
      console.error('Backend login API error:', {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        url: apiError.config?.url,
      });
      throw error;
    }
  },

  getUserDetails: async (): Promise<User> => {
    const response = await apiClient.get('/auth/user-details');
    return response.data;
  },
};

export interface MonitorWithStats {
  id: number;
  user_id: string;
  url: string;
  type: string;
  interval: number;
  status: string;
  is_active: boolean;
  avg_response_time: string;
  uptime_percentage: string;
  last_check: string;
}

// Monitor API
export const monitorAPI = {
  // Create a new monitor
  createMonitor: async (data: CreateMonitorRequest): Promise<CreateMonitorResponse> => {
    const response = await apiClient.post('/monitor/create-monitor', data);
    return response.data;
  },

  // Get all monitors for the user
  getAllMonitors: async (): Promise<Monitor[]> => {
    const response = await apiClient.get('/monitor/get-all-monitors');
    return response.data;
  },

  // Get all monitors with stats
  getAllMonitorsWithStats: async (): Promise<MonitorWithStats[]> => {
    const response = await apiClient.get('/monitor/monitors/stats');
    return response.data;
  },

  // Get only active monitors
  getActiveMonitors: async (): Promise<Monitor[]> => {
    const response = await apiClient.get('/monitor/get-active-monitors');
    return response.data;
  },

  // Get monitor by ID
  getMonitorById: async (id: number): Promise<Monitor> => {
    const response = await apiClient.get(`/monitor/get-monitor/${id}`);
    return response.data;
  },

  // Get monitor status and metrics
  getMonitorStatus: async (id: number): Promise<MonitorStatusResponse> => {
    const response = await apiClient.get(`/monitor/monitors/${id}/metrics`);
    return response.data;
  },

  // Get monitor logs with pagination
  getMonitorLogs: async (
    id: number,
    options?: {
      limit?: number;
      offset?: number;
      from?: string; // YYYY-MM-DD format
      to?: string; // YYYY-MM-DD format
    }
  ): Promise<MonitorLogsResponse> => {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.from) params.append('from', options.from);
    if (options?.to) params.append('to', options.to);

    const response = await apiClient.get(`/monitor/monitor/${id}/logs?${params.toString()}`);
    return response.data;
  },

  // Toggle monitor active status
  toggleMonitor: async (id: number, isActive: boolean): Promise<Monitor> => {
    console.log(id, isActive)
    const response = await apiClient.post('/monitor/toggle-monitor', {
      id,
      is_active: isActive,
    });
    return response.data;
  },

  // Update a monitor
  updateMonitor: async (data: UpdateMonitorRequest): Promise<Monitor> => {
    const response = await apiClient.put('/monitor/update-monitor', data);
    return response.data;
  },

  // Delete a monitor
  deleteMonitor: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/monitor/delete-monitor/${id}`);
    return response.data;
  },
};

// Alert types
export interface Alert {
  id: number;
  monitor_id: number;
  url: string;
  type: string; // 'up', 'down', 'slow', 'warning'
  message: string;
  timestamp: string;
  status: string; // 'active', 'resolved'
}

export interface AlertContact {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
}

// Alert API
export const alertAPI = {
  // Get recent alerts for the user
  getRecentAlerts: async (limit?: number): Promise<Alert[]> => {
    const response = await apiClient.get(`/alert/recent?limit=${limit || 50}`);
    return response.data;
  },

  // Get user's alert contacts
  getAlertContacts: async (): Promise<AlertContact[]> => {
    const response = await apiClient.get('/alert/contacts');
    return response.data;
  },

  // Create a new alert contact
  createAlertContact: async (data: { name: string; email: string }): Promise<AlertContact> => {
    const response = await apiClient.post('/alert/contacts', data);
    return response.data;
  },
};

// Analytics types
export interface AnalyticsOverview {
  total_monitors: number;
  active_monitors: number;
  uptime_percent: number;
  avg_response_time: number;
  alerts_today: number;
  monitors_up: number;
  monitors_down: number;
}

// Analytics API
export const analyticsAPI = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  },
};

export default apiClient;


