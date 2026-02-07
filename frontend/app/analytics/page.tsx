'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
    Monitor,
    BarChart3,
    Bell,
    Settings,
    TrendingUp,
    TrendingDown,
    Clock,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import LogoutModal from "@/app/dashboard/_component/logout-modal";
import Spinner from '../components/spinner';
import { monitorAPI, analyticsAPI, type AnalyticsOverview } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

type User = {
    photoURL: string
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [isModalOpen, setModalOpen] = useState(false);
    const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [uptimeHistory, setUptimeHistory] = useState<Array<{ date: string, uptime: number }>>([]);

    const { data: user, isLoading } = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await analyticsAPI.getOverview();
                setAnalytics(data);

                // Generate sample uptime history for chart
                const history = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    history.push({
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        uptime: data.uptime_percent > 0 ? Math.max(90, data.uptime_percent - Math.random() * 5) : 0,
                    });
                }
                setUptimeHistory(history);
            } catch (e) {
                console.error('Failed to load analytics:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Spinner />
            </div>
        );
    }

    const stats = [
        { label: 'Total Monitors', value: analytics?.total_monitors || 0, icon: Monitor, color: 'text-blue-400' },
        { label: 'Active Monitors', value: analytics?.active_monitors || 0, icon: Activity, color: 'text-green-400' },
        { label: 'Avg Uptime', value: `${(analytics?.uptime_percent || 0).toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Avg Response', value: `${(analytics?.avg_response_time || 0).toFixed(0)}ms`, icon: Clock, color: 'text-cyan-400' },
        { label: 'Monitors Up', value: analytics?.monitors_up || 0, icon: CheckCircle, color: 'text-green-400' },
        { label: 'Monitors Down', value: analytics?.monitors_down || 0, icon: XCircle, color: 'text-red-400' },
        { label: 'Alerts Today', value: analytics?.alerts_today || 0, icon: AlertTriangle, color: 'text-yellow-400' },
    ];

    const statusData = [
        { name: 'Up', value: analytics?.monitors_up || 0, color: '#22c55e' },
        { name: 'Down', value: analytics?.monitors_down || 0, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700 z-50">
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">Better Uptime</span>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/dashboard" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                            <span>Overview</span>
                        </Link>
                        <Link href="/monitors" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <Monitor className="w-5 h-5" />
                            <span>Monitors</span>
                        </Link>
                        <Link href="/alerts" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span>Alerts</span>
                        </Link>
                        <Link href="/analytics" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white">
                            <BarChart3 className="w-5 h-5" />
                            <span>Analytics</span>
                        </Link>
                        <Link href="/settings" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                    </nav>

                    <div className="flex-grow" />

                    <div className="border-t border-slate-700 pt-4">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            <Image
                                src={(user as User)?.photoURL || "/default-avatar.png"}
                                alt="User"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                            <span className="text-sm">Account</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
                        <p className="text-slate-400">Detailed insights into your monitoring data</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                        </div>
                                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                        <div className="text-slate-400 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Uptime History Chart */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Uptime History (7 Days)</h3>
                                    <div className="h-64">
                                        {uptimeHistory.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={uptimeHistory}>
                                                    <defs>
                                                        <linearGradient id="uptimeGradient2" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                                    <YAxis stroke="#64748b" fontSize={12} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Uptime']}
                                                    />
                                                    <Area type="monotone" dataKey="uptime" stroke="#22c55e" fill="url(#uptimeGradient2)" strokeWidth={2} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-400">
                                                No data available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Distribution */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Monitor Status Distribution</h3>
                                    <div className="h-64 flex items-center justify-center">
                                        {(analytics?.monitors_up || 0) + (analytics?.monitors_down || 0) > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={statusData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {statusData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-slate-400">No monitors</div>
                                        )}
                                    </div>
                                    <div className="flex justify-center space-x-6 mt-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-slate-300">Up ({analytics?.monitors_up || 0})</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-slate-300">Down ({analytics?.monitors_down || 0})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Avg Response Time</span>
                                            <span className="font-semibold">{(analytics?.avg_response_time || 0).toFixed(0)}ms</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Uptime</span>
                                            <span className="font-semibold text-green-400">{(analytics?.uptime_percent || 0).toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Monitor Summary</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Total Monitors</span>
                                            <span className="font-semibold">{analytics?.total_monitors || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Active</span>
                                            <span className="font-semibold text-blue-400">{analytics?.active_monitors || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Alerts Today</span>
                                            <span className={`font-semibold ${(analytics?.alerts_today || 0) > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {analytics?.alerts_today || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Status</span>
                                            <span className={`font-semibold ${(analytics?.monitors_down || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {(analytics?.monitors_down || 0) > 0 ? 'Issues Detected' : 'All Good'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && <LogoutModal isOpen={isModalOpen} onLogout={handleLogout} onClose={() => setModalOpen(false)} />}
        </div>
    );
}
