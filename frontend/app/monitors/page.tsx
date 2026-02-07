'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Monitor,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Play,
    Pause,
    Edit,
    Trash2,
    Eye,
    ExternalLink,
    Globe,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Settings,
    BarChart3,
    Bell,
    Download,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    Shield
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import LogoutModal from "@/app/dashboard/_component/logout-modal"
import Spinner from '../components/spinner';
import { monitorAPI, type Monitor as MonitorType, type MonitorLog } from '@/lib/api';


type User = {
    photoURL: string
}

export type MonitorDisplay = {
    id: number;
    name: string;
    url: string;
    status: string;
    is_active: string;
    uptime: string;
    responseTime: string;
    lastCheck: string;
    location: string;
    type: string;
    frequency: string;
    notifications: boolean;
};

export default function MonitorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setModalOpen] = useState(false);
    const [monitors, setMonitors] = useState<MonitorDisplay[]>([]);
    const [monitorsLoading, setMonitorsLoading] = useState(true);

    // Logs modal state
    const [logsModalOpen, setLogsModalOpen] = useState(false);
    const [selectedMonitor, setSelectedMonitor] = useState<MonitorDisplay | null>(null);
    const [logs, setLogs] = useState<MonitorLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotal, setLogsTotal] = useState(0);

    // Stats/Details Modal State
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [monitorStats, setMonitorStats] = useState<{
        uptime: string;
        avgResponse: string;
        totalChecks: number;
        lastStatus: number | null;
        sslOk: boolean | null;
        dnsOk: boolean | null;
        lastCheck: string;
    } | null>(null);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);

    const openEditModal = (monitor: MonitorDisplay) => {
        setSelectedMonitor(monitor);
        setEditModalOpen(true);
    };


    const openStatsModal = async (monitor: MonitorDisplay) => {
        setSelectedMonitor(monitor);
        setStatsModalOpen(true);
        setStatsLoading(true);
        setMonitorStats(null); // Clear previous stats

        // Fetch logs to calculate detailed stats
        try {
            const response = await monitorAPI.getMonitorLogs(monitor.id, { limit: 100 });
            const logs = response.logs;

            if (logs.length > 0) {
                // Calculate detailed stats
                const successfulChecks = logs.filter(l => l.status_code && l.status_code >= 200 && l.status_code < 400).length;
                const uptime = ((successfulChecks / logs.length) * 100).toFixed(2);

                const responseTimes = logs.filter(l => l.response_time).map(l => l.response_time!);
                const avgResponse = responseTimes.length > 0
                    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(0)
                    : '0';

                const lastLog = logs[0];

                setMonitorStats({
                    uptime: `${uptime}%`,
                    avgResponse: `${avgResponse}ms`,
                    totalChecks: logs.length,
                    lastStatus: lastLog.status_code,
                    sslOk: lastLog.ssl_ok,
                    dnsOk: lastLog.dns_ok,
                    lastCheck: new Date(lastLog.checked_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                });
            } else {
                setMonitorStats(null);
            }
        } catch (e) {
            console.error('Failed to fetch stats:', e);
            setMonitorStats(null);
        } finally {
            setStatsLoading(false);
        }
    };
    const LOGS_PER_PAGE = 10;

    const { data: user, isLoading } = useUser();

    // Fetch logs for a monitor with pagination
    const fetchLogs = async (monitorId: number, page: number) => {
        setLogsLoading(true);
        try {
            const response = await monitorAPI.getMonitorLogs(monitorId, {
                limit: LOGS_PER_PAGE,
                offset: page * LOGS_PER_PAGE,
            });
            setLogs(response.logs || []);
            setLogsTotal(response.pageination?.total?.[0] || 0);
        } catch (e) {
            console.error('Failed to fetch logs:', e);
            setLogs([]);
        } finally {
            setLogsLoading(false);
        }
    };

    const openLogsModal = (monitor: MonitorDisplay) => {
        setSelectedMonitor(monitor);
        setLogsPage(0);
        setLogsModalOpen(true);
        fetchLogs(monitor.id, 0);
    };

    const handleLogsPageChange = (newPage: number) => {
        if (selectedMonitor) {
            setLogsPage(newPage);
            fetchLogs(selectedMonitor.id, newPage);
        }
    };

    const loadMonitors = async () => {
        try {
            const list = await monitorAPI.getAllMonitorsWithStats();

            const monitorsDisplay = list.map((m) => {
                let lastCheck = '—';
                if (m.last_check && m.last_check !== 'Never') {
                    const checkDate = new Date(m.last_check);
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

                return {
                    id: m.id,
                    name: m.url.replace(/^https?:\/\//, '').split('/')[0] || m.url,
                    url: m.url,
                    status: m.status,
                    is_active: m.is_active ? 'true' : 'false',
                    uptime: m.uptime_percentage,
                    responseTime: m.avg_response_time,
                    lastCheck,
                    location: 'Global',
                    type: m.type,
                    frequency: m.interval ? `${m.interval}s` : '—',
                    notifications: false,
                };
            });

            setMonitors(monitorsDisplay);
        } catch (e) {
            console.error('Failed to load monitors:', e);
        } finally {
            setMonitorsLoading(false);
        }
    };

    useEffect(() => {
        loadMonitors();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-slate-900 text-white flex h-screen w-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'up':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'down':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            default:
                return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'up':
                return 'bg-green-400';
            case 'down':
                return 'bg-red-400';
            case 'warning':
                return 'bg-yellow-400';
            default:
                return 'bg-slate-400';
        }
    };

    const filteredMonitors = monitors.filter(monitor => {
        const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            monitor.url.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || monitor.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // Download monitors as CSV
    const downloadMonitorsCSV = () => {
        const headers = ['Name', 'URL', 'Status', 'Type', 'Frequency', 'Uptime', 'Response Time', 'Last Check'];
        const rows = filteredMonitors.map(m => [
            m.name,
            m.url,
            m.status,
            m.type,
            m.frequency,
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

    const handleLogout = () => {
        console.log("Logging out...");
        setModalOpen(false);
    }

    const handleChangeActive = async (id: number, currentStatus: boolean) => {
        try {
            await monitorAPI.toggleMonitor(Number(id), !currentStatus);
            await loadMonitors();
        } catch (e) {
            console.error('Toggle monitor failed:', e);
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700 z-50">
                <div className="p-6 flex flex-col h-full">
                    <div className="flex  items-center space-x-3 mb-8">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">Better Uptime</span>
                    </div>

                    <nav className="space-y-2">
                        <a href="/dashboard" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                            <span>Overview</span>
                        </a>
                        <a href="/monitors" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white">
                            <Monitor className="w-5 h-5" />
                            <span>Monitors</span>
                        </a>
                        <a href="/alerts" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span>Alerts</span>
                        </a>
                        <a href="/analytics" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                            <span>Analytics</span>
                        </a>
                        <a href="/settings" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </a>
                    </nav>

                    <div className="flex-grow" />

                    <div className="pt-6 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                            <LogoutModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onLogout={handleLogout} />
                            {/* Avatar Container */}
                            <div onClick={() => setModalOpen(true)} className="relative flex h-10 w-10  shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white font-semibold">

                                {user?.photoURL ? (<>
                                    <Image
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        fill
                                        className="aspect-square object-cover"
                                    />
                                    <h3 className='text-white'> Hi {user?.email}</h3>
                                </>
                                ) : (
                                    <span>{user?.displayName}</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <h3 className="text-sm font-medium text-white truncate">
                                    Hi, {user?.displayName?.split(" ")[0] || "User"}
                                </h3>
                                <p className="text-xs text-slate-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {/* Header */}
                <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Monitors</h1>
                            <p className="text-slate-400 text-sm">Manage your monitoring endpoints</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Add Monitor</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Filters and Search */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search monitors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="up">Up</option>
                            <option value="down">Down</option>
                            <option value="warning">Warning</option>
                        </select>

                        <button
                            onClick={downloadMonitorsCSV}
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Download CSV"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Monitors Grid */}
                <div className="p-6">
                    {monitorsLoading ? (
                        <div className="text-center py-12 text-slate-400">Loading monitors...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredMonitors.map((monitor) => (
                                <div key={monitor.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-750 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(monitor.status)}`}></div>
                                            <div>
                                                <h3 className="font-semibold text-white">{monitor.name}</h3>
                                                <p className="text-slate-400 text-sm">{monitor.url}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleChangeActive(monitor.id, monitor.is_active === 'true')}
                                                className={`p-2 rounded-lg transition-colors ${monitor.is_active === 'true'
                                                    ? 'hover:bg-red-500/20 text-red-400'
                                                    : 'hover:bg-green-500/20 text-green-400'
                                                    }`}
                                                title={monitor.is_active === 'true' ? 'Pause Monitor' : 'Resume Monitor'}
                                            >
                                                {monitor.is_active === 'true' ? (
                                                    <Pause className="w-4 h-4" />
                                                ) : (
                                                    <Play className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(monitor)}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edit Monitor"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openLogsModal(monitor)}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="View Logs"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openStatsModal(monitor)}
                                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Status</span>
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(monitor.status)}
                                                <span className="capitalize font-medium">{monitor.status}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Uptime</span>
                                            <span className="font-medium">{monitor.uptime}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Response Time</span>
                                            <span className="font-medium">{monitor.responseTime}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Type</span>
                                            <span className="font-medium">{monitor.type}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Frequency</span>
                                            <span className="font-medium">{monitor.frequency}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Location</span>
                                            <div className="flex items-center space-x-1">
                                                <Globe className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">{monitor.location}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Notifications</span>
                                            <div className={`w-2 h-2 rounded-full ${monitor.notifications ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 text-sm">Last Check</span>
                                            <span className="font-medium">{monitor.lastCheck}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-700">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleChangeActive(monitor.id, monitor.is_active === 'true')}
                                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                                                {monitor.is_active === 'true' ? <><Pause className="w-4 h-4" /><span>Pause</span></> : <><Play className="w-4 h-4" /><span>Resume</span></>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!monitorsLoading && filteredMonitors.length === 0 && (
                        <div className="text-center py-12">
                            <Monitor className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">No monitors found</h3>
                            <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
                            <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto w-fit">
                                <Plus className="w-4 h-4" />
                                <span>Add Your First Monitor</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Logs Modal */}
            {logsModalOpen && selectedMonitor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col m-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Monitor Logs</h2>
                                <p className="text-slate-400 text-sm">{selectedMonitor.name} - {selectedMonitor.url}</p>
                            </div>
                            <button
                                onClick={() => setLogsModalOpen(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto p-4">
                            {logsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No logs available yet</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                                            <th className="pb-3 pr-4">Time</th>
                                            <th className="pb-3 pr-4">Status</th>
                                            <th className="pb-3 pr-4">Response Time</th>
                                            <th className="pb-3">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id} className="border-b border-slate-700/50">
                                                <td className="py-3 pr-4 text-slate-300 text-sm">
                                                    {new Date(log.checked_at.endsWith('Z') ? log.checked_at : log.checked_at + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${log.status_code && log.status_code >= 200 && log.status_code < 400
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {log.status_code || 'Err'}
                                                    </span>
                                                    {(!log.status_code || log.status_code >= 400) && (
                                                        <div className="text-xs text-red-400 mt-1">
                                                            {!log.dns_ok ? 'DNS Failed' : !log.ssl_ok ? 'SSL Error' : 'HTTP Error'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-slate-300 text-sm">
                                                    {log.response_time ? `${log.response_time.toFixed(0)}ms` : '—'}
                                                </td>
                                                <td className="py-3 text-slate-400 text-sm">
                                                    {/* This column is now empty as per the diff, but the header is still there.
                                                        If the header should also be removed, that's a separate instruction.
                                                        For now, just removing the content as per the diff. */}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Modal Footer - Pagination */}
                        <div className="flex items-center justify-between p-4 border-t border-slate-700">
                            <span className="text-slate-400 text-sm">
                                Showing {logs.length} of {logsTotal} logs
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleLogsPageChange(logsPage - 1)}
                                    disabled={logsPage === 0 || logsLoading}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-slate-300 text-sm px-2">
                                    Page {logsPage + 1}
                                </span>
                                <button
                                    onClick={() => handleLogsPageChange(logsPage + 1)}
                                    disabled={logs.length < LOGS_PER_PAGE || logsLoading}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Monitor Modal */}
            {editModalOpen && selectedMonitor && (
                <EditMonitorModal
                    monitor={selectedMonitor}
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onUpdate={() => {
                        setEditModalOpen(false);
                        loadMonitors();
                    }}
                />
            )}

            {/* Monitor Stats Modal */}
            {statsModalOpen && selectedMonitor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-2xl min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{selectedMonitor.name}</h3>
                                <p className="text-slate-400 text-sm">{selectedMonitor.url}</p>
                            </div>
                            <button
                                onClick={() => setStatsModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {statsLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : monitorStats ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-slate-700/50 p-4 rounded-lg">
                                        <div className="text-slate-400 text-xs mb-1">Uptime</div>
                                        <div className="text-2xl font-semibold text-green-400">{monitorStats.uptime}</div>
                                    </div>
                                    <div className="bg-slate-700/50 p-4 rounded-lg">
                                        <div className="text-slate-400 text-xs mb-1">Avg Response</div>
                                        <div className="text-2xl font-semibold text-blue-400">{monitorStats.avgResponse}</div>
                                    </div>
                                    <div className="bg-slate-700/50 p-4 rounded-lg">
                                        <div className="text-slate-400 text-xs mb-1">Total Checks</div>
                                        <div className="text-2xl font-semibold">{monitorStats.totalChecks}</div>
                                    </div>
                                    <div className="bg-slate-700/50 p-4 rounded-lg">
                                        <div className="text-slate-400 text-xs mb-1">Last Status</div>
                                        <div className={`text-2xl font-semibold ${monitorStats.lastStatus && monitorStats.lastStatus >= 200 && monitorStats.lastStatus < 400 ? 'text-green-400' : 'text-red-400'}`}>
                                            {monitorStats.lastStatus || '—'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Shield className={`w-5 h-5 ${monitorStats.sslOk ? 'text-green-400' : 'text-red-400'}`} />
                                            <span className="text-sm font-medium">SSL Certificate</span>
                                        </div>
                                        <span className={`text-sm ${monitorStats.sslOk ? 'text-green-400' : 'text-red-400'}`}>
                                            {monitorStats.sslOk ? 'Valid' : 'Invalid'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Globe className={`w-5 h-5 ${monitorStats.dnsOk ? 'text-green-400' : 'text-red-400'}`} />
                                            <span className="text-sm font-medium">DNS Resolution</span>
                                        </div>
                                        <span className={`text-sm ${monitorStats.dnsOk ? 'text-green-400' : 'text-red-400'}`}>
                                            {monitorStats.dnsOk ? 'Resolved' : 'Failed'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center">
                                    <span className="text-xs text-slate-500">
                                        Last checked: {monitorStats.lastCheck}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                Failed to load statistics data.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function EditMonitorModal({ monitor, isOpen, onClose, onUpdate }: { monitor: MonitorDisplay, isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        url: monitor.url,
        method: 'GET', // Default, as generic specific might not be available in MonitorDisplay
        type: monitor.type,
        interval: parseInt(monitor.frequency) || 60, // Parse "60s" or default
        is_active: monitor.is_active === 'true'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await monitorAPI.updateMonitor({
                id: monitor.id,
                url: form.url,
                method: form.method,
                type: form.type,
                interval: Number(form.interval),
                is_active: form.is_active
            });
            onUpdate();
        } catch (error) {
            console.error('Failed to update monitor:', error);
            // Optionally show toast/alert
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Edit Monitor</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
                        <input
                            type="text"
                            name="url"
                            value={form.url}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="HTTP">HTTP</option>
                                <option value="PING">Ping</option>
                                <option value="KWORD">Keyword</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Interval (sec)</label>
                            <input
                                type="number"
                                name="interval"
                                value={form.interval}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                min="10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="edit_is_active"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="edit_is_active" className="text-sm text-slate-300">Active</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
