'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';

export default function NativeBeaconPage() {
    const [loaded, setLoaded] = useState(false);
    const [coinbin, setCoinbin] = useState<any>(null);

    useEffect(() => {
        // Dynamic import solo en cliente - evita SSR issues con bitcoinjs-lib
        import('@/lib/coinbin/beacon').then((mod) => {
            mod.loadCoinbin().then(() => {
                setCoinbin(mod);
                setLoaded(true);
            });
        });
    }, []);

    if (!loaded) return <div style={{ color: 'white' }}>Loading...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: 40, color: 'white', background: '#0a0a0a', minHeight: '100vh' }}
        >
            <h1>Native Coinbin Beacon</h1>
            <TerminalWindow title="test">
                <p>Coinbin cargado dinámicamente: {coinbin ? 'SÍ' : 'NO'}</p>
            </TerminalWindow>
        </motion.div>
    );
}