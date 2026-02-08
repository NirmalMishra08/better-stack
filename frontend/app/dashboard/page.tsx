'use client';

import { useState, useEffect } from 'react';
import { monitorAPI, alertAPI, analyticsAPI, type AnalyticsOverview, type MonitorLog } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
    Activity,
    Bell,
    Search,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Download,
    MoreHorizontal,
    Eye,
    Edit
} from 'lucide-react';
import NewMonitorButton from './_component/NewMonitorButton';
import Sidebar from '../components/sidebar';

export default function Dashboard() {

    const [monitoringData, setMonitoringData] = useState<Array<{
        id: number;
        name: string;
        url: string;
        status: string;
        uptime: string;
        responseTime: string;
        lastCheck: string;
        location: string;
    }>>([]);


    const [monitorsLoading, setMonitorsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    // Download monitors as CSV
    const downloadMonitorsCSV = () => {
        const headers = ['Name', 'URL', 'Status', 'Uptime', 'Response Time', 'Last Check'];
        const rows = monitoringData.map(m => [
            m.name,
            m.url,
            m.status,
            m.uptime,
            m.responseTime,
            m.lastCheck
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitors-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filter monitors
    const filteredMonitors = monitoringData.filter(m => {
        if (filterStatus === 'all') return true;
        return m.status === filterStatus;
    });

    useEffect(() => {
        const loadMonitors = async () => {
            try {
                const list = await monitorAPI.getAllMonitors();

                // Fetch metrics for each monitor
                const monitorsWithStats = await Promise.all(
                    list.map(async (m) => {
                        // Handle status which may come as object {monitor_status: string, valid: boolean}
                        let statusValue = 'unknown';
                        if (typeof m.status === 'string') {
                            statusValue = m.status;
                        } else if (m.status && typeof m.status === 'object') {
                            const statusObj = m.status as { monitor_status?: string; valid?: boolean };
                            statusValue = statusObj.monitor_status || 'unknown';
                        }

                        // Fetch logs for this monitor to calculate stats
                        let uptime = '—';
                        let responseTime = '—';
                        let lastCheck = '—';

                        try {
                            const logsResponse = await monitorAPI.getMonitorLogs(m.id, { limit: 50 });
                            if (logsResponse.logs && logsResponse.logs.length > 0) {
                                // Calculate uptime
                                const successfulChecks = logsResponse.logs.filter(
                                    log => log.status_code && log.status_code >= 200 && log.status_code < 400
                                ).length;
                                const uptimePercent = (successfulChecks / logsResponse.logs.length) * 100;
                                uptime = `${uptimePercent.toFixed(1)}%`;

                                // Calculate avg response time
                                const responseTimes = logsResponse.logs
                                    .filter(log => log.response_time && log.response_time > 0)
                                    .map(log => log.response_time!);
                                if (responseTimes.length > 0) {
                                    const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                                    responseTime = `${avgResponse.toFixed(0)}ms`;
                                }

                                // Last check time - handle UTC timestamp from database
                                const lastLog = logsResponse.logs[0];
                                if (lastLog.checked_at) {
                                    // Append 'Z' to treat as UTC if not already present
                                    const timestampStr = lastLog.checked_at.endsWith('Z')
                                        ? lastLog.checked_at
                                        : lastLog.checked_at + 'Z';
                                    const checkDate = new Date(timestampStr);
                                    const now = new Date();
                                    const diffMs = now.getTime() - checkDate.getTime();
                                    const diffMins = Math.floor(diffMs / 60000);
                                    const diffHours = Math.floor(diffMins / 60);
                                    const diffDays = Math.floor(diffHours / 24);

                                    if (diffDays > 0) {
                                        lastCheck = `${diffDays}d ago`;
                                    } else if (diffHours > 0) {
                                        lastCheck = `${diffHours}h ago`;
                                    } else if (diffMins > 0) {
                                        lastCheck = `${diffMins}m ago`;
                                    } else {
                                        lastCheck = 'Just now';
                                    }
                                }
                            }
                        } catch (e) {
                            console.error(`Failed to fetch logs for monitor ${m.id}:`, e);
                        }

                        return {
                            id: m.id,
                            name: m.url.replace(/^https?:\/\//, '').split('/')[0] || m.url,
                            url: m.url,
                            status: statusValue,
                            uptime,
                            responseTime,
                            lastCheck,
                            location: 'Global',
                        };
                    })
                );

                setMonitoringData(monitorsWithStats);
            } catch (e) {
                console.error('Failed to load monitors:', e);
            } finally {
                setMonitorsLoading(false);
            }
        };
        loadMonitors();
    }, []);

    // Chart data state
    interface ChartDataPoint {
        time: string;
        uptime: number;
        responseTime: number;
    }
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [chartLoading, setChartLoading] = useState(true);

    // Fetch monitor logs for charts
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const monitors = await monitorAPI.getAllMonitors();
                if (monitors.length === 0) {
                    setChartLoading(false);
                    return;
                }

                // Get logs from the first active monitor for the chart
                const firstMonitor = monitors[0];
                const logsResponse = await monitorAPI.getMonitorLogs(firstMonitor.id, { limit: 24 });

                if (logsResponse.logs && logsResponse.logs.length > 0) {
                    const data = logsResponse.logs.reverse().map((log: MonitorLog) => {
                        const isUp = log.status_code !== null && log.status_code >= 200 && log.status_code < 400;
                        const logDate = new Date(log.checked_at);
                        const timeLabel = logDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
                        return {
                            time: timeLabel,
                            uptime: isUp ? 100 : 0,
                            responseTime: log.response_time || 0,
                        };
                    });
                    setChartData(data);
                }
            } catch (e) {
                console.error('Failed to load chart data:', e);
            } finally {
                setChartLoading(false);
            }
        };
        fetchChartData();
    }, []);

    // Fetch recent alerts from backend
    const [recentAlerts, setRecentAlerts] = useState<Array<{
        id: number;
        type: string;
        monitor: string;
        message: string;
        time: string;
        severity: string;
    }>>([]);
    const [alertsCount, setAlertsCount] = useState(0);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await alertAPI.getRecentAlerts(10);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todayAlerts = data.filter(a => {
                    const alertDate = new Date(a.timestamp);
                    return alertDate >= today;
                });
                setAlertsCount(todayAlerts.length);

                setRecentAlerts(data.slice(0, 5).map(a => ({
                    id: a.id,
                    type: a.type,
                    monitor: a.url.replace(/^https?:\/\//, '').split('/')[0] || 'Monitor',
                    message: a.message,
                    time: formatTimestamp(a.timestamp),
                    severity: a.type === 'down' ? 'high' : a.type === 'slow' ? 'medium' : 'low',
                })));
            } catch (e) {
                console.error('Failed to load alerts:', e);
            }
        };
        loadAlerts();
    }, []);

    const formatTimestamp = (timestamp: string): string => {
        if (!timestamp) return '—';
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} minutes ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} days ago`;
        } catch {
            return timestamp;
        }
    };

    // Fetch analytics overview from backend
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const data = await analyticsAPI.getOverview();
                setAnalytics(data);
            } catch (e) {
                console.error('Failed to load analytics:', e);
            }
        };
        loadAnalytics();
    }, []);

    const stats = [
        { label: 'Total Monitors', value: analytics ? String(analytics.total_monitors) : String(monitoringData.length), change: '', trend: 'up' as const },
        { label: 'Uptime', value: analytics ? `${analytics.uptime_percent.toFixed(1)}%` : '—', change: '', trend: 'up' as const },
        { label: 'Avg Response', value: analytics ? `${analytics.avg_response_time.toFixed(0)}ms` : '—', change: '', trend: 'up' as const },
        { label: 'Alerts Today', value: analytics ? String(analytics.alerts_today) : String(alertsCount), change: '', trend: (analytics?.alerts_today || alertsCount) > 0 ? 'down' as const : 'up' as const }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="ml-64">
                {/* Header */}
                <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Dashboard</h1>
                            <p className="text-slate-400 text-sm">Monitor your services in real-time</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search monitors..."
                                    className="bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <NewMonitorButton />

                            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`flex items-center space-x-1 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="w-4 h-4" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Uptime Trend</h3>
                            </div>
                            <div className="h-64">
                                {chartLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                                    </div>
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                labelStyle={{ color: '#94a3b8' }}
                                                formatter={(value) => [`${value ?? 0}%`, 'Uptime']}
                                            />
                                            <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="url(#uptimeGradient)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        <div className="text-center">
                                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No monitoring data yet</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Response Time</h3>
                            </div>
                            <div className="h-64">
                                {chartLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                                    </div>
                                ) : chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}ms`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                labelStyle={{ color: '#94a3b8' }}
                                                formatter={(value) => [`${Number(value ?? 0).toFixed(0)}ms`, 'Response Time']}
                                            />
                                            <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        <div className="text-center">
                                            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No response time data yet</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Monitors List */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg">
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Monitors</h3>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="up">Up</option>
                                        <option value="down">Down</option>
                                    </select>
                                    <button
                                        onClick={downloadMonitorsCSV}
                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Download CSV"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-700">
                            {monitorsLoading ? (
                                <div className="p-6 text-slate-400 text-center">Loading monitors...</div>
                            ) : filteredMonitors.length === 0 ? (
                                <div className="p-6 text-slate-400 text-center">No monitors match the filter.</div>
                            ) : (
                                filteredMonitors.map((monitor) => (
                                    <div key={monitor.id} className="p-6 hover:bg-slate-750 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-3 h-3 rounded-full ${monitor.status === 'up' ? 'bg-green-400' : monitor.status === 'down' ? 'bg-red-400' : 'bg-slate-500'
                                                    }`}></div>
                                                <div>
                                                    <h4 className="font-medium text-white">{monitor.name}</h4>
                                                    <p className="text-slate-400 text-sm">{monitor.url}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-6">
                                                <div className="text-center">
                                                    <p className="text-sm text-slate-400">Uptime</p>
                                                    <p className="font-medium">{monitor.uptime}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-slate-400">Response</p>
                                                    <p className="font-medium">{monitor.responseTime}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-slate-400">Location</p>
                                                    <p className="font-medium">{monitor.location}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-slate-400">Last Check</p>
                                                    <p className="font-medium">{monitor.lastCheck}</p>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                        </div>

                        <div className="divide-y divide-slate-700">
                            {recentAlerts.map((alert) => (
                                <div key={alert.id} className="p-6 hover:bg-slate-750 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-400' :
                                            alert.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                            }`}></div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-white">{alert.monitor}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.type === 'down' ? 'bg-red-900 text-red-300' :
                                                    alert.type === 'slow' ? 'bg-yellow-900 text-yellow-300' :
                                                        'bg-green-900 text-green-300'
                                                    }`}>
                                                    {alert.type.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm mt-1">{alert.message}</p>
                                        </div>
                                        <div className="text-slate-400 text-sm">{alert.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
