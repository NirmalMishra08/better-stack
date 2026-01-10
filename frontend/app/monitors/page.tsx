'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    Download
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import LogoutModal from "@/app/dashboard/_component/logout-modal"
import Spinner from '../components/spinner';
import { monitorAPI } from '@/lib/api';


type User = {
    photoURL: string
}

export default function MonitorsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setModalOpen] = useState(false);

    const { data: user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="bg-slate-900 text-white flex h-screen w-full items-center justify-center">
                <Spinner />
            </div>
        );
    }

    console.log(user)

    const monitors = [
        {
            id: 1,
            name: 'Main Website',
            url: 'https://example.com',
            status: 'up',
            is_active: "true",
            uptime: '99.9%',
            responseTime: '245ms',
            lastCheck: '2 minutes ago',
            location: 'US East',
            type: 'HTTP',
            frequency: '1 minute',
            notifications: true
        },
        {
            id: 2,
            name: 'API Endpoint',
            url: 'https://api.example.com/health',
            status: 'down',
            is_active: "true",
            uptime: '98.2%',
            responseTime: '1.2s',
            lastCheck: '5 minutes ago',
            location: 'EU West',
            type: 'HTTP',
            frequency: '30 seconds',
            notifications: true
        },
        {
            id: 3,
            name: 'Database Connection',
            url: 'https://db.example.com',
            status: 'up',
            is_active: "true",
            uptime: '99.8%',
            responseTime: '89ms',
            lastCheck: '1 minute ago',
            location: 'Asia Pacific',
            type: 'TCP',
            frequency: '1 minute',
            notifications: false
        },
        {
            id: 4,
            name: 'CDN Status',
            url: 'https://cdn.example.com',
            status: 'up',
            is_active: "true",
            uptime: '99.7%',
            responseTime: '156ms',
            lastCheck: '3 minutes ago',
            location: 'Global',
            type: 'HTTP',
            frequency: '2 minutes',
            notifications: true
        },
        {
            id: 5,
            name: 'SSL Certificate',
            url: 'https://secure.example.com',
            status: 'warning',
            uptime: '99.5%',
            responseTime: '320ms',
            lastCheck: '4 minutes ago',
            location: 'US West',
            type: 'SSL',
            frequency: '5 minutes',
            notifications: true
        }
    ];

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

    const handleLogout = () => {
        console.log("Logging out...");
        setModalOpen(false);
    }

    const handleChangeActive = (id: number, currentStatus: boolean) => {
        monitorAPI.toggleMonitor(Number(id), !currentStatus)
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
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Add Monitor</span>
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

                        <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>

                        <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Monitors Grid */}
                <div className="p-6">
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
                                            onClick={() => handleChangeActive(monitor.id, monitor?.is_active === "true")}
                                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                                            <Play className="w-4 h-4" />
                                            <span>Pause</span>
                                        </button>
                                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2">
                                            <ExternalLink className="w-4 h-4" />
                                            <span>View Details</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredMonitors.length === 0 && (
                        <div className="text-center py-12">
                            <Monitor className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">No monitors found</h3>
                            <p className="text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto">
                                <Plus className="w-4 h-4" />
                                <span>Add Your First Monitor</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
