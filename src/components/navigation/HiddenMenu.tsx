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
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    // Detectar mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Check if already admin
    useEffect(() => {
        const adminKey = localStorage.getItem('admin_access');
        if (adminKey === 'true') setIsAdmin(true);
    }, []);

    // Prevenir scroll cuando menú está abierto
    useEffect(() => {
        if (isOpen || showPasswordModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, showPasswordModal]);

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
            {/* Botón hamburguesa - FIX: z-index muy alto y posición segura */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 right-4 z-[9999] w-12 h-12 rounded-full bg-black/90 border border-[#f7931a]/40 flex items-center justify-center text-[#f7931a] hover:text-white hover:border-[#f7931a] hover:bg-[#f7931a] transition-all shadow-lg shadow-black/50"
                style={{ touchAction: 'manipulation' }}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <Menu className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Overlay backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990]"
                    />
                )}
            </AnimatePresence>

            {/* Menu panel - FIX: Ancho responsive */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-[280px] sm:w-80 bg-slate-950 border-l border-[#f7931a]/20 z-[9995] shadow-2xl"
                    >
                        <div className="p-6 pt-20 h-full overflow-y-auto">
                            {/* Header del menú */}
                            <div className="mb-8 pb-6 border-b border-slate-800">
                                <h3 className="text-lg font-bold text-[#f7931a] font-mono">
                                    Bitcoin Agent
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    v2.0.1 • {isAdmin ? 'Admin Mode' : 'Guest'}
                                </p>
                            </div>

                            {/* Links públicos */}
                            <div className="space-y-2 mb-8">
                                <Link
                                    href={`/${lang}/about`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-[#f7931a] hover:bg-slate-900 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Info className="w-5 h-5" />
                                    <span className="font-mono">About Us</span>
                                </Link>
                            </div>

                            {/* Admin Zone */}
                            <div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider mb-3 px-4">
                                    Admin Zone
                                </p>
                                <div className="space-y-2">
                                    {[
                                        { title: 'Immune Dashboard', path: '/satoshi/immune-dashboard', icon: Shield },
                                        { title: 'Native Beacon', path: '/satoshi/beacon/native', icon: Zap },
                                        { title: 'Challenge Zone', path: '/challenge/pow', icon: Terminal },
                                    ].map(item => (
                                        <button
                                            key={item.title}
                                            onClick={() => handleAdminClick(item.path)}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-[#f7931a] hover:bg-slate-900 transition text-left"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-mono text-sm">{item.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer del menú */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-slate-950">
                                <p className="text-xs text-slate-600 text-center font-mono">
                                    {isAdmin ? '🔐 Secured Connection' : '🔓 Public Access'}
                                </p>
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-[#f7931a]/30 rounded-2xl p-6 w-full max-w-sm"
                        >
                            <h3 className="text-lg font-mono text-[#f7931a] mb-2">
                                {lang === 'en' ? 'Inner Circle Access' : 'Acceso Inner Circle'}
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                {lang === 'en' 
                                    ? 'This area requires authentication.' 
                                    : 'Esta área requiere autenticación.'}
                            </p>

                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && checkPassword()}
                                placeholder={lang === 'en' ? 'Enter key...' : 'Ingresa clave...'}
                                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-3 text-white font-mono mb-4 focus:border-[#f7931a] outline-none"
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition font-mono text-sm"
                                >
                                    {lang === 'en' ? 'Cancel' : 'Cancelar'}
                                </button>
                                <button
                                    onClick={checkPassword}
                                    className="flex-1 py-3 bg-[#f7931a] text-black rounded-xl font-bold hover:bg-amber-400 transition font-mono text-sm"
                                >
                                    {lang === 'en' ? 'Unlock' : 'Desbloquear'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}