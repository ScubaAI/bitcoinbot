'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';

// Tipos de coinbin (definidos localmente para TypeScript)
interface UTXO {
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
}

interface BeaconTransaction {
    rawTx: string;
    txid: string;
    fee: number;
    opReturn: string;
}

interface BeaconWallet {
    wif: string;
    address: string;
    publicKey: string;
}

interface CoinbinModule {
    loadCoinbin: () => Promise<void>;
    generateBeaconWallet: () => BeaconWallet;
    fetchUtxos: (address: string) => Promise<UTXO[]>;
    broadcastTransaction: (rawTx: string) => Promise<string>;
    buildAndSignBeacon: (wif: string, utxos: UTXO[], message: string, feeRate: number) => BeaconTransaction;
}

export default function NativeBeaconPage() {
    const [loaded, setLoaded] = useState(false);
    const [coinbin, setCoinbin] = useState<CoinbinModule | null>(null);
    const [wallet, setWallet] = useState<BeaconWallet | null>(null);
    const [utxos, setUtxos] = useState<UTXO[]>([]);
    const [balance, setBalance] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [message, setMessage] = useState('');
    const [tx, setTx] = useState<{ rawTx: string; details: BeaconTransaction } | null>(null);
    const [broadcasting, setBroadcasting] = useState(false);
    const [txid, setTxid] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar coinbin dinámicamente
    useEffect(() => {
        import('@/lib/coinbin/beacon').then((mod) => {
            mod.loadCoinbin().then(() => {
                setCoinbin(mod as CoinbinModule);
                setLoaded(true);
            });
        });
    }, []);

    // Restaurar wallet desde sessionStorage
    useEffect(() => {
        if (!coinbin) return;

        const savedWif = sessionStorage.getItem('temp_beacon_wif');
        const savedAddr = sessionStorage.getItem('temp_beacon_addr');
        if (savedWif && savedAddr) {
            setWallet({ wif: savedWif, address: savedAddr, publicKey: '' });
            checkBalance(savedAddr);
        }
    }, [coinbin]);

    // Generar wallet
    const createWallet = async () => {
        if (!coinbin) return;
        try {
            const w = coinbin.generateBeaconWallet();
            setWallet(w);
            sessionStorage.setItem('temp_beacon_wif', w.wif);
            sessionStorage.setItem('temp_beacon_addr', w.address);
            checkBalance(w.address);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    // Check balance
    const checkBalance = useCallback(async (address: string) => {
        if (!coinbin) return;
        try {
            const fetchedUtxos = await coinbin.fetchUtxos(address);
            setUtxos(fetchedUtxos);
            const bal = fetchedUtxos.reduce((sum, u) => sum + u.value, 0);
            setBalance(bal);

            const res = await fetch('https://mempool.space/api/blocks/tip/height');
            const height = await res.json();
            setBlockHeight(height);
        } catch (e) {
            setError((e as Error).message);
        }
    }, [coinbin]);

    // Crear transacción
    const createTx = async () => {
        if (!coinbin || !wallet || utxos.length === 0) return;
        setError(null);
        setTxid(null);

        try {
            const beaconTx = coinbin.buildAndSignBeacon(
                wallet.wif,
                utxos,
                message,
                10
            );

            setTx({
                rawTx: beaconTx.rawTx,
                details: beaconTx
            });
        } catch (e) {
            setError((e as Error).message);
        }
    };

    // Broadcast
    const broadcast = async () => {
        if (!coinbin || !tx) return;
        setBroadcasting(true);

        try {
            const id = await coinbin.broadcastTransaction(tx.rawTx);
            setTxid(id);
            setTx(null);
            if (wallet) {
                await checkBalance(wallet.address);
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBroadcasting(false);
        }
    };

    if (!loaded || !coinbin) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#F7931A] border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6 text-gray-300 font-mono">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-[#F7931A] mb-2">
                    ⛓️ Native Coinbin Beacon
                </h1>
                <p className="text-gray-500 mb-8">
                    Pure client-side Bitcoin OP_RETURN. Keys never leave your browser.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TerminalWindow title="beacon-wallet.dat">
                        {!wallet ? (
                            <div className="text-center py-12">
                                <button
                                    onClick={createWallet}
                                    className="bg-[#F7931A] text-black font-bold px-8 py-3 rounded-md hover:bg-[#ff9f2a]"
                                >
                                    🔐 Generate Wallet
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-yellow-900/20 border border-yellow-600/50 p-3 rounded text-xs text-yellow-400">
                                    ⚠️ Wallet stored in session (survives F5, clears on tab close).
                                    <strong> Back up your WIF key!</strong>
                                </div>

                                <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                    <div className="text-xs text-gray-500 uppercase">Address</div>
                                    <div className="text-[#00ff41] break-all text-sm font-bold">{wallet.address}</div>
                                </div>

                                <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                    <div className="text-xs text-gray-500 uppercase">Private Key (WIF)</div>
                                    <div className="text-red-400 break-all text-xs font-mono mt-1">{wallet.wif}</div>
                                    <p className="text-[10px] text-gray-600 mt-1">⚠️ Guarda esto en un lugar seguro</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                        <div className="text-xs text-gray-500 uppercase">Balance</div>
                                        <div className="text-xl font-bold text-[#F7931A]">{balance.toLocaleString()} SATS</div>
                                    </div>
                                    <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                        <div className="text-xs text-gray-500 uppercase">Height</div>
                                        <div className="text-xl font-bold text-gray-300">#{blockHeight || '---'}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => checkBalance(wallet.address)}
                                    className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] py-3 rounded font-bold"
                                >
                                    🔄 Refresh
                                </button>
                            </div>
                        )}
                    </TerminalWindow>

                    <TerminalWindow title="builder-agent.sh">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase text-[#F7931A] mb-3">Eternal Message</label>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter message..."
                                    maxLength={40}
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded p-4 text-[#00ff41]"
                                />
                                <p className="text-xs text-gray-600 mt-2">{message.length}/40 characters</p>
                            </div>

                            {!wallet && (
                                <div className="bg-blue-900/20 border border-blue-600/50 p-4 rounded text-sm text-blue-400">
                                    💡 <strong>Paso 1:</strong> Genera una wallet primero
                                </div>
                            )}

                            {wallet && balance < 1000 && (
                                <div className="bg-yellow-900/20 border border-yellow-600/50 p-4 rounded text-sm text-yellow-400">
                                    ⚡ <strong>Paso 2:</strong> Recarga con testnet BTC desde un{' '}
                                    <a href="https://bitcoinfaucet.uo1.net/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
                                        faucet
                                    </a>
                                </div>
                            )}

                            <button
                                onClick={createTx}
                                disabled={!wallet || balance < 1000 || !message.trim()}
                                className="w-full bg-[#00ff41] text-black font-bold py-4 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {!wallet ? 'GENERATE WALLET FIRST' : balance < 1000 ? 'NEEDS 1000+ SATS' : 'PREPARE ON-CHAIN BEACON'}
                            </button>
                        </div>
                    </TerminalWindow>

                    <AnimatePresence>
                        {tx && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:col-span-2">
                                <TerminalWindow title="signed-tx.hex">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#0a0a0a] p-4 rounded border border-[#2a2a2a]">
                                                <div className="text-xs text-gray-500 mb-2">OP_RETURN Message</div>
                                                <div className="text-[#00ff41] text-sm break-all">{tx.details.opReturn}</div>
                                            </div>
                                            <div className="bg-[#0a0a0a] p-4 rounded border border-[#2a2a2a]">
                                                <div className="text-xs text-gray-500 mb-2">Network Fee</div>
                                                <div className="text-[#F7931A] text-sm font-bold">{tx.details.fee} sats</div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0a0a0a] p-4 rounded border border-[#2a2a2a]">
                                            <div className="text-xs text-gray-500 mb-2">Raw Transaction (Hex)</div>
                                            <div className="text-gray-400 text-xs break-all font-mono max-h-32 overflow-y-auto">
                                                {tx.rawTx}
                                            </div>
                                        </div>

                                        <button
                                            onClick={broadcast}
                                            disabled={broadcasting}
                                            className="w-full bg-[#F7931A] text-black font-black py-5 rounded hover:bg-[#ff9f2a] transition-colors"
                                        >
                                            {broadcasting ? '📡 BROADCASTING...' : '🚀 BROADCAST TO NETWORK'}
                                        </button>
                                    </div>
                                </TerminalWindow>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {txid && (
                        <div className="lg:col-span-2 bg-[#00ff41]/10 border border-[#00ff41] p-8 rounded text-center">
                            <h2 className="text-2xl font-bold text-[#00ff41] mb-2">BEACON ASCENDED</h2>
                            <p className="text-gray-400 mb-2">Your message is now eternal on the Bitcoin blockchain.</p>
                            <p className="text-xs text-gray-500 mb-6 font-mono break-all">{txid}</p>
                            <a
                                href={`https://mempool.space/tx/${txid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#00ff41] text-black font-bold px-8 py-3 rounded hover:bg-[#00cc33] transition-colors inline-block"
                            >
                                View on Mempool
                            </a>
                        </div>
                    )}

                    {error && (
                        <div className="lg:col-span-2 bg-red-900/10 border border-red-500 p-4 rounded text-red-500">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}