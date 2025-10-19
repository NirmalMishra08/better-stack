'use client';

import { useState } from 'react';
import {
    Monitor,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Globe,
    Settings,
    Bell,
    Search,
    Plus,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Zap,
    Shield,
    Users,
    Calendar,
    Filter,
    Download,
    MoreHorizontal,
    Play,
    Pause,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    ExternalLink
} from 'lucide-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const monitoringData = [
        {
            id: 1,
            name: 'Main Website',
            url: 'https://example.com',
            status: 'up',
            uptime: '99.9%',
            responseTime: '245ms',
            lastCheck: '2 minutes ago',
            location: 'US East'
        },
        {
            id: 2,
            name: 'API Endpoint',
            url: 'https://api.example.com',
            status: 'down',
            uptime: '98.2%',
            responseTime: '1.2s',
            lastCheck: '5 minutes ago',
            location: 'EU West'
        },
        {
            id: 3,
            name: 'Database',
            url: 'https://db.example.com',
            status: 'up',
            uptime: '99.8%',
            responseTime: '89ms',
            lastCheck: '1 minute ago',
            location: 'Asia Pacific'
        },
        {
            id: 4,
            name: 'CDN Status',
            url: 'https://cdn.example.com',
            status: 'up',
            uptime: '99.7%',
            responseTime: '156ms',
            lastCheck: '3 minutes ago',
            location: 'Global'
        }
    ];

    const recentAlerts = [
        {
            id: 1,
            type: 'down',
            monitor: 'API Endpoint',
            message: 'Service is down - HTTP 500 error',
            time: '5 minutes ago',
            severity: 'high'
        },
        {
            id: 2,
            type: 'slow',
            monitor: 'Main Website',
            message: 'Response time exceeded 2 seconds',
            time: '12 minutes ago',
            severity: 'medium'
        },
        {
            id: 3,
            type: 'up',
            monitor: 'Database',
            message: 'Service is back online',
            time: '1 hour ago',
            severity: 'low'
        }
    ];

    const stats = [
        { label: 'Total Monitors', value: '12', change: '+2', trend: 'up' },
        { label: 'Uptime', value: '99.8%', change: '+0.1%', trend: 'up' },
        { label: 'Avg Response', value: '245ms', change: '-12ms', trend: 'up' },
        { label: 'Alerts Today', value: '3', change: '-1', trend: 'down' }
    ];

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
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span>Overview</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('monitors')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'monitors' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <Monitor className="w-5 h-5" />
                            <span>Monitors</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <Bell className="w-5 h-5" />
                            <span>Alerts</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <PieChart className="w-5 h-5" />
                            <span>Analytics</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </button>
                    </nav>
                </div>
            </div>

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

                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Add Monitor</span>
                            </button>

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
                                <div className="flex items-center space-x-2">
                                    <button className="p-1 hover:bg-slate-700 rounded">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-slate-700 rounded">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                                    <p className="text-slate-400">Chart will be rendered here</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Response Time</h3>
                                <div className="flex items-center space-x-2">
                                    <button className="p-1 hover:bg-slate-700 rounded">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 hover:bg-slate-700 rounded">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                                    <p className="text-slate-400">Response time chart</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Monitors List */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg">
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Monitors</h3>
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                        <Filter className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-700">
                            {monitoringData.map((monitor) => (
                                <div key={monitor.id} className="p-6 hover:bg-slate-750 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${monitor.status === 'up' ? 'bg-green-400' : 'bg-red-400'
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
                            ))}
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
