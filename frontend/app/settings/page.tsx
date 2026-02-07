'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Monitor,
    BarChart3,
    Bell,
    Settings,
    User,
    Shield,
    Mail,
    Moon,
    Globe,
    Key,
    Save,
    AlertCircle,
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import LogoutModal from "@/app/dashboard/_component/logout-modal";
import Spinner from '../components/spinner';

type UserType = {
    photoURL: string;
    email?: string;
    displayName?: string;
}

export default function SettingsPage() {
    const [isModalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [saved, setSaved] = useState(false);

    const { data: user, isLoading } = useUser();

    const handleLogout = () => {
        console.log("Logging out...");
        setModalOpen(false);
    }

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Spinner />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Settings },
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
                        <Link href="/analytics" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
                            <BarChart3 className="w-5 h-5" />
                            <span>Analytics</span>
                        </Link>
                        <Link href="/settings" className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white">
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
                                src={(user as UserType)?.photoURL || "/default-avatar.png"}
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
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Settings</h1>
                        <p className="text-slate-400">Manage your account and preferences</p>
                    </div>

                    {/* Saved Notification */}
                    {saved && (
                        <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                            <Save className="w-5 h-5" />
                            <span>Settings saved successfully!</span>
                        </div>
                    )}

                    {/* Settings Tabs */}
                    <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                            <div className="flex items-center space-x-6 mb-8">
                                <Image
                                    src={(user as UserType)?.photoURL || "/default-avatar.png"}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="rounded-full"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">{(user as UserType)?.displayName || 'User'}</h3>
                                    <p className="text-slate-400">{(user as UserType)?.email || 'No email'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        defaultValue={(user as UserType)?.displayName || ''}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue={(user as UserType)?.email || ''}
                                        disabled
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                                    />
                                    <p className="text-slate-500 text-sm mt-1">Email is managed by your authentication provider</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4   h-4" />
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <h3 className="font-medium">Email Notifications</h3>
                                            <p className="text-slate-400 text-sm">Receive alerts via email</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <h3 className="font-medium">Critical Alerts Only</h3>
                                            <p className="text-slate-400 text-sm">Only notify for downtime events</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Bell className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <h3 className="font-medium">Weekly Reports</h3>
                                            <p className="text-slate-400 text-sm">Receive weekly uptime summary</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save Preferences</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6">Security Settings</h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-slate-700/50 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Key className="w-5 h-5 text-slate-400" />
                                        <h3 className="font-medium">Authentication</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">You are signed in with your Google account. Password management is handled by Google.</p>
                                    <button className="text-blue-400 hover:text-blue-300 text-sm">Manage Google Account →</button>
                                </div>

                                <div className="p-4 bg-slate-700/50 rounded-lg">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Shield className="w-5 h-5 text-slate-400" />
                                        <h3 className="font-medium">Two-Factor Authentication</h3>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4">Add an extra layer of security to your account</p>
                                    <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                        Enable 2FA
                                    </button>
                                </div>

                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
                                    <p className="text-slate-400 text-sm mb-4">Permanently delete your account and all associated data</p>
                                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-6">App Preferences</h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Moon className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <h3 className="font-medium">Dark Mode</h3>
                                            <p className="text-slate-400 text-sm">Currently active</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                    </label>
                                </div>

                                <div>
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Globe className="w-5 h-5 text-slate-400" />
                                        <h3 className="font-medium">Timezone</h3>
                                    </div>
                                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                                        <option>Asia/Kolkata (IST)</option>
                                        <option>UTC</option>
                                        <option>America/New_York (EST)</option>
                                        <option>Europe/London (GMT)</option>
                                    </select>
                                </div>

                                <div>
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Settings className="w-5 h-5 text-slate-400" />
                                        <h3 className="font-medium">Default Monitor Interval</h3>
                                    </div>
                                    <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                                        <option>1 minute</option>
                                        <option>5 minutes</option>
                                        <option>10 minutes</option>
                                        <option>30 minutes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Save Preferences</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && <LogoutModal isOpen={isModalOpen} onLogout={handleLogout} onClose={() => setModalOpen(false)} />}
        </div>
    );
}
