/**
 * Native Coinbin Beacon Page
 * Pure client-side Bitcoin signing and broadcasting
 * 
 * Philosophy: Total Sovereignty. Keys stay in the browser.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    loadCoinbin,
    generateBeaconWallet,
    fetchUtxos,
    broadcastTransaction,
    buildAndSignBeacon,
    type UTXO
} from '@/lib/coinbin/beacon';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { QRCodeSVG } from 'qrcode.react';

export default function NativeBeaconPage() {
    const [loaded, setLoaded] = useState(false);
    const [wallet, setWallet] = useState<any>(null);
    const [utxos, setUtxos] = useState<UTXO[]>([]);
    const [balance, setBalance] = useState(0);
    const [blockHeight, setBlockHeight] = useState(0);
    const [message, setMessage] = useState('');
    const [tx, setTx] = useState<any>(null);
    const [broadcasting, setBroadcasting] = useState(false);
    const [txid, setTxid] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar Coinbin y restaurar wallet desde sessionStorage
    useEffect(() => {
        const savedWif = sessionStorage.getItem('temp_beacon_wif');
        const savedAddr = sessionStorage.getItem('temp_beacon_addr');
        if (savedWif && savedAddr) {
            setWallet({ wif: savedWif, address: savedAddr });
            checkBalance(savedAddr);
        }
        loadCoinbin().then(() => setLoaded(true));
    }, []);

    // Generar wallet
    const createWallet = async () => {
        try {
            const w = await generateBeaconWallet();
            setWallet(w);

            // ADVERTENCIA: Guardar en sessionStorage para resistir F5
            // Nota: Esto es seguro para beacons pequeños, pero riesgoso para grandes fondos.
            sessionStorage.setItem('temp_beacon_wif', w.wif);
            sessionStorage.setItem('temp_beacon_addr', w.address);

            checkBalance(w.address);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    // Check balance
    const checkBalance = async (address: string) => {
        try {
            const fetchedUtxos = await fetchUtxos(address);
            setUtxos(fetchedUtxos);
            const bal = fetchedUtxos.reduce((sum: number, u: any) => sum + u.value, 0);
            setBalance(bal);

            // Get block height
            const res = await fetch('https://mempool.space/api/blocks/tip/height');
            const height = await res.json();
            setBlockHeight(height);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    // Crear transacción - 100% CLIENTE (sin API)
    const createTx = async () => {
        if (!wallet || utxos.length === 0) return;
        setError(null);
        setTxid(null);

        try {
            // Construir y firmar localmente en el navegador
            const beaconTx = buildAndSignBeacon(
                wallet.wif,
                utxos,
                message,
                10 // fee rate (10 sats/vbyte)
            );

            setTx({
                rawTx: beaconTx.rawTx,
                details: {
                    opReturn: beaconTx.opReturn,
                    txid: beaconTx.txid,
                    fee: beaconTx.fee
                }
            });
        } catch (e) {
            setError((e as Error).message);
        }
    };

    // Broadcast
    const broadcast = async () => {
        if (!tx) return;
        setBroadcasting(true);

        try {
            const id = await broadcastTransaction(tx.rawTx);
            setTxid(id);
            setTx(null); // Clear preview after success
            // Refresh balance after broadcast
            if (wallet) {
                await checkBalance(wallet.address);
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBroadcasting(false);
        }
    };

    if (!loaded) {
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
                                {/* ADVERTENCIA: Session storage warning */}
                                <div className="bg-yellow-900/20 border border-yellow-600/50 p-3 rounded text-xs text-yellow-400">
                                    ⚠️ Wallet stored in session (survives F5, clears on tab close).
                                    <strong> Back up your WIF key if storing significant funds!</strong>
                                </div>
                                <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                    <div className="text-xs text-gray-500 uppercase">Address</div>
                                    <div className="text-[#00ff41] break-all text-sm font-bold">{wallet.address}</div>
                                    <div className="mt-4 flex justify-center">
                                        <div className="bg-white p-2 rounded">
                                            <QRCodeSVG value={wallet.address} size={150} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                    <div className="text-xs text-gray-500 uppercase">Private Key (WIF)</div>
                                    <div className="text-red-400 break-all text-xs font-mono mt-1">{wallet.wif}</div>
                                    <p className="text-[10px] text-gray-600 mt-1">⚠️ Guarda esto en un lugar seguro. Nunca lo compartas.</p>
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
                                <p className="text-xs text-gray-600 mt-2">
                                    {message.length}/40 characters
                                </p>
                            </div>

                            {!wallet && (
                                <div className="bg-blue-900/20 border border-blue-600/50 p-4 rounded text-sm text-blue-400">
                                    💡 <strong>Paso 1:</strong> Genera una wallet primero
                                </div>
                            )}

                            {wallet && balance < 1000 && (
                                <div className="bg-yellow-900/20 border border-yellow-600/50 p-4 rounded text-sm text-yellow-400">
                                    ⚡ <strong>Paso 2:</strong> Recarga esta dirección con testnet BTC desde un <a href="https://bitcoinfaucet.uo1.net/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">faucet</a>
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
                                            <div className="text-xs text-gray-500 mb-2">Expected TXID</div>
                                            <div className="text-gray-400 text-xs break-all font-mono">{tx.details.txid}</div>
                                        </div>
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <button
                                                onClick={broadcast}
                                                disabled={broadcasting}
                                                className="flex-1 bg-[#F7931A] text-black font-black py-5 rounded hover:bg-[#ff9f2a] transition-colors"
                                            >
                                                {broadcasting ? '📡 BROADCASTING...' : '🚀 BROADCAST TO NETWORK'}
                                            </button>
                                            <div className="bg-white p-3 rounded flex-shrink-0">
                                                <QRCodeSVG value={tx.rawTx} size={160} />
                                            </div>
                                        </div>
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