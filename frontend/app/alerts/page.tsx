'use client';

import { useState, useEffect } from 'react';
import { alertAPI, type Alert as AlertType } from '@/lib/api';
import {
    Bell,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    Monitor,
    Settings,
    BarChart3,
    Eye,
    Archive,
    Trash2,
    Mail,
    Smartphone,
    Webhook,
    Slack,
    MessageCircle,
    Loader2
} from 'lucide-react';

type AlertDisplay = {
    id: number;
    monitor: string;
    url: string;
    type: string;
    severity: string;
    message: string;
    timestamp: string;
    duration: string;
    status: string;
    notifications: string[];
};

export default function AlertsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [alerts, setAlerts] = useState<AlertDisplay[]>([]);
    const [alertsLoading, setAlertsLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const data = await alertAPI.getRecentAlerts(50);
                setAlerts(data.map((a: AlertType) => ({
                    id: a.id,
                    monitor: a.url.replace(/^https?:\/\//, '').split('/')[0] || 'Monitor',
                    url: a.url,
                    type: a.type,
                    severity: a.type === 'down' ? 'high' : a.type === 'slow' ? 'medium' : 'low',
                    message: a.message,
                    timestamp: formatTimestamp(a.timestamp),
                    duration: '—',
                    status: a.status || 'resolved',
                    notifications: ['email'],
                })));
            } catch (e) {
                console.error('Failed to load alerts:', e);
                setAlerts([]);
            } finally {
                setAlertsLoading(false);
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

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'medium':
                return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'low':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            default:
                return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-900 text-red-300 border-red-700';
            case 'medium':
                return 'bg-yellow-900 text-yellow-300 border-yellow-700';
            case 'low':
                return 'bg-green-900 text-green-300 border-green-700';
            default:
                return 'bg-slate-900 text-slate-300 border-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-red-400';
            case 'resolved':
                return 'bg-green-400';
            default:
                return 'bg-slate-400';
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="w-4 h-4" />;
            case 'slack':
                return <Slack className="w-4 h-4" />;
            case 'webhook':
                return <Webhook className="w-4 h-4" />;
            case 'discord':
                return <MessageCircle className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.monitor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
        const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700 z-50">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-8">
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
                        <a href="/monitors" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <Monitor className="w-5 h-5" />
                            <span>Monitors</span>
                        </a>
                        <a href="/alerts" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white">
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
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64">
                {/* Header */}
                <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Alerts</h1>
                            <p className="text-slate-400 text-sm">Monitor and manage your alerts</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                <Archive className="w-4 h-4" />
                                <span>Archive All</span>
                            </button>
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
                                placeholder="Search alerts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={filterSeverity}
                            onChange={(e) => setFilterSeverity(e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Severity</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                        </select>

                        <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="p-6">
                    {alertsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                            <span className="ml-3 text-slate-400">Loading alerts...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAlerts.map((alert) => (
                                <div key={alert.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-750 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className={`w-3 h-3 rounded-full mt-2 ${getStatusColor(alert.status)}`}></div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-semibold text-white">{alert.monitor}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                                                        {alert.severity.toUpperCase()}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${alert.status === 'active' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                                                        }`}>
                                                        {alert.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <p className="text-slate-300 mb-3">{alert.message}</p>

                                                <div className="flex items-center space-x-6 text-sm text-slate-400">
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{alert.timestamp}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Monitor className="w-4 h-4" />
                                                        <span>{alert.url}</span>
                                                    </div>
                                                    {alert.duration !== '0 seconds' && (
                                                        <div className="flex items-center space-x-1">
                                                            <AlertTriangle className="w-4 h-4" />
                                                            <span>Duration: {alert.duration}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2 mt-3">
                                                    <span className="text-slate-400 text-sm">Notifications:</span>
                                                    <div className="flex items-center space-x-2">
                                                        {alert.notifications.map((notification, index) => (
                                                            <div key={index} className="flex items-center space-x-1 bg-slate-700 px-2 py-1 rounded">
                                                                {getNotificationIcon(notification)}
                                                                <span className="text-xs">{notification}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                                <Archive className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!alertsLoading && filteredAlerts.length === 0 && (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">No alerts found</h3>
                            <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
