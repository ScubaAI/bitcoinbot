'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Info, Shield, Zap, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function HiddenMenu({ lang }: { lang: 'en' | 'es' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    // Check if already admin (simple localStorage for now)
    useEffect(() => {
        const adminKey = localStorage.getItem('admin_access');
        if (adminKey === 'true') setIsAdmin(true);
    }, []);

    const handleAdminClick = (path: string) => {
        if (isAdmin) {
            router.push(`/${lang}${path}`);
            setIsOpen(false);
        } else {
            setShowPasswordModal(true);
        }
    };

    const checkPassword = () => {
        if (password === 'bitcoin-agent-2026') {
            localStorage.setItem('admin_access', 'true');
            setIsAdmin(true);
            setShowPasswordModal(false);
            setPassword('');
            router.push(`/${lang}/satoshi/immune-dashboard`);
            setIsOpen(false);
        } else {
            alert(lang === 'en' ? 'Access denied… try again.' : 'Acceso denegado… inténtalo de nuevo.');
        }
    };

    return (
        <>
            {/* Hamburguesa button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/60 backdrop-blur-xl border border-[#f7931a]/30 flex items-center justify-center text-[#f7931a]/70 hover:text-[#f7931a] hover:border-[#f7931a]/60 transition-all shadow-lg"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>

            {/* Menu panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-0 right-0 bottom-0 w-80 bg-black/90 backdrop-blur-2xl border-l border-[#f7931a]/20 z-40 p-8"
                    >
                        <div className="space-y-6 mt-16">
                            <Link
                                href={`/${lang}/about`}
                                className="flex items-center gap-3 text-slate-300 hover:text-[#f7931a] transition py-3 group"
                                onClick={() => setIsOpen(false)}
                            >
                                <Info className="w-5 h-5 group-hover:scale-110 transition" />
                                About Us
                            </Link>

                            {/* Secciones admin */}
                            <div className="pt-6 border-t border-slate-800">
                                <p className="text-xs text-slate-500 uppercase mb-4">Admin Zone</p>
                                {[
                                    { title: 'Immune Dashboard', path: '/satoshi/immune-dashboard', icon: Shield },
                                    { title: 'Native Beacon', path: '/satoshi/beacon/native', icon: Zap },
                                    { title: 'Challenge Zone', path: '/challenge/pow', icon: Terminal },
                                ].map(item => (
                                    <button
                                        key={item.title}
                                        onClick={() => handleAdminClick(item.path)}
                                        className="w-full flex items-center gap-3 text-slate-400 hover:text-[#f7931a] transition py-3 group"
                                    >
                                        <item.icon className="w-5 h-5 group-hover:scale-110 transition" />
                                        {item.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border border-[#f7931a]/30 rounded-2xl p-8 max-w-md w-full"
                        >
                            <h3 className="text-xl font-mono text-[#f7931a] mb-6">Inner Circle Access</h3>

                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && checkPassword()}
                                placeholder="Enter key..."
                                className="w-full bg-black border border-slate-700 rounded-lg px-4 py-3 text-white font-mono mb-6 focus:border-[#f7931a] outline-none"
                                autoFocus
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={checkPassword}
                                    className="flex-1 py-3 bg-[#f7931a] text-black rounded-lg font-bold hover:bg-amber-400 transition"
                                >
                                    Unlock
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
