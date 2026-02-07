"use client"
import { BarChart3, Bell, Monitor, PieChart, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const Sidebar = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState('overview');
    return (
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
                        onClick={() => {
                            setActiveTab("overview");
                            router.prefetch('/dashboard');
                            router.push("/dashboard");
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        <span>Overview</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("monitors");
                            router.push("/monitors");
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'monitors' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <Monitor className="w-5 h-5" />
                        <span>Monitors</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("alerts");
                            router.push('/alerts');
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <Bell className="w-5 h-5" />
                        <span>Alerts</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("analytics");
                            router.push('/analytics');
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <PieChart className="w-5 h-5" />
                        <span>Analytics</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("settings");
                            router.push("/settings");
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </button>
                </nav>
            </div>
        </div>
    )
}

export default Sidebar