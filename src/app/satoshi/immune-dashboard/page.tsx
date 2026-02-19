/**
 * Satoshi Immune Dashboard
 * Bitcoin Agent Digital Immune System
 * 
 * Route: /satoshi/immune-dashboard
 * Access: Admin tier only (requires ADMIN_API_KEY)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    Ban,
    UserCheck,
    Activity,
    Globe,
    Clock,
    Cpu,
    Zap,
    Lock,
    Unlock,
    RefreshCw,
    Terminal,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DashboardStats {
    threats: {
        total: number;
        change24h: number;
        byCategory: Record<string, number>;
    };
    bans: {
        active: number;
        total24h: number;
        byzantine: number;
    };
    bypasses: {
        total24h: number;
        approved: number;
        rejected: number;
    };
    pow: {
        avgSolveTime: number;
        successRate: number;
        totalAttempts: number;
    };
    health: {
        status: 'healthy' | 'warning' | 'critical';
        lastIncident: number | null;
    };
}

interface Threat {
    id: string;
    timestamp: number;
    ip: string;
    score: number;
    signatures: string[];
    category: string;
    action: string;
}

interface ActiveBan {
    ip: string;
    reason: string;
    expires: number;
    previousBans: number;
}

interface Bypass {
    timestamp: number;
    ip: string;
    reason: string;
    trustScore: number;
    approved: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ImmuneDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [threats, setThreats] = useState<Threat[]>([]);
    const [bans, setBans] = useState<ActiveBan[]>([]);
    const [bypasses, setBypasses] = useState<Bypass[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'bans' | 'bypasses' | 'audit'>('overview');
    const [loading, setLoading] = useState(true);
    const [paranoiaMode, setParanoiaMode] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [selectedIP, setSelectedIP] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
        if (!apiKey) {
            console.error('Admin API Key missing');
            return;
        }

        try {
            const headers = { 'X-API-Key': apiKey };

            const [statsRes, threatsRes, bansRes, bypassRes, configRes] = await Promise.all([
                fetch('/api/satoshi/immune/stats', { headers }),
                fetch('/api/satoshi/immune/threats', { headers }),
                fetch('/api/satoshi/immune/bans', { headers }),
                fetch('/api/satoshi/immune/bypasses', { headers }),
                fetch('/api/satoshi/immune/config', { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (threatsRes.ok) setThreats(await threatsRes.json());
            if (bansRes.ok) setBans(await bansRes.json());
            if (bypassRes.ok) setBypasses(await bypassRes.json());
            if (configRes.ok) {
                const config = await configRes.json();
                setParanoiaMode(config.paranoiaMode);
            }

            setLastRefresh(new Date());
        } catch (error) {
            console.error('Failed to sync with Satoshi Core:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s auto-refresh
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleUnban = async (ip: string) => {
        try {
            const response = await fetch('/api/satoshi/immune/unban', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
                },
                body: JSON.stringify({ ip })
            });

            if (response.ok) {
                setBans(bans.filter(b => b.ip !== ip));
                setSelectedIP(null);
                fetchData();
            }
        } catch (error) {
            alert('Restoration failed');
        }
    };

    const toggleParanoia = async () => {
        try {
            const newValue = !paranoiaMode;
            const response = await fetch('/api/satoshi/immune/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
                },
                body: JSON.stringify({ paranoiaMode: newValue })
            });

            if (response.ok) {
                setParanoiaMode(newValue);
            }
        } catch (error) {
            alert('Config update failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#F7931A] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono p-4 md:p-6">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#F7931A] flex items-center gap-3">
                            <Shield className="w-8 h-8" />
                            SATOSHI IMMUNE DASHBOARD
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Bitcoin Agent Digital Immune System v1.0
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded bg-[#1a1a1a] border border-[#2a2a2a] ${stats?.health.status === 'critical' ? 'text-red-500' :
                                stats?.health.status === 'warning' ? 'text-[#ffb000]' : 'text-[#00ff41]'
                            }`}>
                            <Activity className="w-4 h-4" />
                            <span className="uppercase text-sm font-bold">
                                {stats?.health.status || 'UNKNOWN'}
                            </span>
                        </div>

                        <button
                            onClick={fetchData}
                            className="p-2 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                    <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>Auto-refresh: 30s</span>
                    <span>•</span>
                    <button
                        onClick={toggleParanoia}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${paranoiaMode
                                ? 'bg-red-900/30 text-red-400 border border-red-600'
                                : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                            }`}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        Paranoia Mode: {paranoiaMode ? 'ON' : 'OFF'}
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap gap-2 mb-6 border-b border-[#2a2a2a] pb-4">
                {[
                    { id: 'overview', label: 'Overview', icon: Activity },
                    { id: 'threats', label: `Threats (${threats.length})`, icon: AlertTriangle },
                    { id: 'bans', label: `Bans (${bans.length})`, icon: Ban },
                    { id: 'bypasses', label: 'Bypasses', icon: UserCheck },
                    { id: 'audit', label: 'Audit Trail', icon: Terminal },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${activeTab === tab.id
                                ? 'bg-[#F7931A] text-black font-bold'
                                : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Threats Detected"
                                value={stats?.threats.total || 0}
                                change={stats?.threats.change24h || 0}
                                icon={AlertTriangle}
                                color="#F7931A"
                            />
                            <StatCard
                                title="Active Bans"
                                value={stats?.bans.active || 0}
                                change={stats?.bans.total24h || 0}
                                icon={Ban}
                                color="#ef4444"
                            />
                            <StatCard
                                title="Normie Bypasses"
                                value={stats?.bypasses.total24h || 0}
                                change={stats?.bypasses.approved || 0}
                                icon={UserCheck}
                                color="#00ff41"
                            />
                            <StatCard
                                title="Avg PoW Time"
                                value={`${Math.floor((stats?.pow.avgSolveTime || 0) / 1000)}s`}
                                change={stats?.pow.successRate || 0}
                                icon={Cpu}
                                color="#ffb000"
                                suffix="% success"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TerminalWindow title="threats-24h.log">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={generateMockTimeData()}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                            <XAxis dataKey="time" stroke="#666" fontSize={12} />
                                            <YAxis stroke="#666" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1a1a1a',
                                                    border: '1px solid #F7931A',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                            <Line type="monotone" dataKey="threats" stroke="#F7931A" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="bans" stroke="#ef4444" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </TerminalWindow>

                            <TerminalWindow title="threat-categories.log">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={Object.entries(stats?.threats.byCategory || {}).map(([name, value]) => ({ name, value }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                            <XAxis dataKey="name" stroke="#666" fontSize={10} angle={-45} textAnchor="end" height={80} />
                                            <YAxis stroke="#666" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1a1a1a',
                                                    border: '1px solid #F7931A',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                            <Bar dataKey="value" fill="#F7931A" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </TerminalWindow>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'threats' && (
                    <motion.div
                        key="threats"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TerminalWindow title="threat-intelligence.log">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-gray-500 border-b border-[#2a2a2a]">
                                        <tr>
                                            <th className="text-left p-3">Time</th>
                                            <th className="text-left p-3">IP</th>
                                            <th className="text-left p-3">Signature</th>
                                            <th className="text-left p-3">Category</th>
                                            <th className="text-left p-3">Score</th>
                                            <th className="text-left p-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {threats.map((threat) => (
                                            <tr key={threat.id} className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a]">
                                                <td className="p-3 text-gray-400">{new Date(threat.timestamp).toLocaleTimeString()}</td>
                                                <td className="p-3 font-mono text-xs">{threat.ip}</td>
                                                <td className="p-3">{threat.signatures[0]?.slice(0, 40)}...</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 rounded bg-[#2a2a2a] text-xs">
                                                        {threat.category}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs">{(threat.score * 100).toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${threat.action === 'ban' ? 'bg-red-900/50 text-red-400' :
                                                            threat.action === 'challenge' ? 'bg-[#ffb000]/20 text-[#ffb000]' : 'bg-[#00ff41]/20 text-[#00ff41]'
                                                        }`}>
                                                        {threat.action}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </TerminalWindow>
                    </motion.div>
                )}

                {activeTab === 'bans' && (
                    <motion.div
                        key="bans"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TerminalWindow title="byzantine-nodes.log">
                            <div className="grid gap-4">
                                {bans.map((ban) => (
                                    <div key={ban.ip} className="p-4 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Ban className="w-5 h-5 text-red-500" />
                                                <div>
                                                    <div className="font-mono text-[#F7931A]">{ban.ip}</div>
                                                    <div className="text-xs text-gray-500">{ban.reason}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnban(ban.ip)}
                                                className="px-4 py-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40"
                                            >
                                                Unban
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {bans.length === 0 && (
                                    <div className="text-center text-gray-500 py-12">No nodes currently banned</div>
                                )}
                            </div>
                        </TerminalWindow>
                    </motion.div>
                )}

                {activeTab === 'bypasses' && (
                    <motion.div
                        key="bypasses"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TerminalWindow title="normie-bypasses.log">
                            <div className="space-y-4">
                                {bypasses.map((bypass, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded border border-[#2a2a2a]">
                                        <div className="flex items-center gap-4">
                                            <UserCheck className={`w-5 h-5 ${bypass.approved ? 'text-[#00ff41]' : 'text-red-500'}`} />
                                            <div>
                                                <div className="font-mono text-sm">{bypass.ip}</div>
                                                <div className="text-xs text-gray-500">Reason: {bypass.reason} • Score: {bypass.trustScore}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${bypass.approved ? 'text-[#00ff41]' : 'text-red-500'}`}>
                                            {bypass.approved ? 'APPROVED' : 'REJECTED'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </TerminalWindow>
                    </motion.div>
                )}

                {activeTab === 'audit' && (
                    <motion.div
                        key="audit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TerminalWindow title="audit-trail.log">
                            <div className="space-y-2 bg-black/30 p-4 rounded min-h-[400px]">
                                {generateMockAuditLog().map((entry, idx) => (
                                    <div key={idx} className="text-xs font-mono">
                                        <span className="text-gray-600">[{new Date(entry.timestamp).toISOString()}]</span>
                                        <span className={`ml-2 ${entry.level === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`}>
                                            {entry.level}
                                        </span>
                                        <span className="ml-2 text-gray-300">{entry.message}</span>
                                    </div>
                                ))}
                            </div>
                        </TerminalWindow>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ title, value, change, icon: Icon, color, suffix }: any) {
    return (
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color }} />
                <div className="text-xs text-gray-500">{change}{suffix || '%'}</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-gray-500">{title}</div>
        </div>
    );
}

function generateMockTimeData() {
    return Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        threats: Math.floor(Math.random() * 10),
        bans: Math.floor(Math.random() * 5),
    }));
}

function generateMockAuditLog() {
    return [
        { timestamp: Date.now() - 1000, level: 'CRITICAL', message: 'Byzantine node banned' },
        { timestamp: Date.now() - 5000, level: 'INFO', message: 'Low trust bypass approved' },
        { timestamp: Date.now() - 10000, level: 'INFO', message: 'Challenge solved' },
    ];
}
