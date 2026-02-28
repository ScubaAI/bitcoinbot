'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { InfoTooltip } from '@/components/ui/InfoTooltip'; // You'll need to create this cutie!

// Educational content components! nya~
const EducationalBubble = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-[#F7931A]/10 to-[#00ff41]/10 border-l-4 border-[#F7931A] p-4 my-4 rounded-r-lg text-sm"
    >
        <h3 className="text-[#F7931A] font-bold mb-2 flex items-center gap-2">
            <span>📚</span> {title}
        </h3>
        <div className="text-gray-300 leading-relaxed">
            {children}
        </div>
    </motion.div>
);

const StepExplainer = ({ step, title, children }: { step: number; title: string; children: React.ReactNode }) => (
    <div className="flex gap-4 items-start mb-4">
        <div className="w-8 h-8 rounded-full bg-[#F7931A] flex items-center justify-center text-black font-bold shrink-0">
            {step}
        </div>
        <div>
            <h4 className="text-[#00ff41] font-bold mb-1">{title}</h4>
            <p className="text-xs text-gray-400">{children}</p>
        </div>
    </div>
);

// Tipos (keeping your types, they're perfect!)
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

// Helper: Fee dinámico (keeping your logic!)
const getDynamicFee = async (): Promise<number> => {
    try {
        const res = await fetch('https://mempool.space/api/v1/fees/recommended');
        const fees = await res.json();
        return fees.fastestFee || 10;
    } catch {
        return 10;
    }
};

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
    const [feeRate, setFeeRate] = useState<number>(10);
    const [showEducation, setShowEducation] = useState(true); // New! Toggle for educational content

    // Cargar coinbin dinámicamente
    useEffect(() => {
        import('@/lib/coinbin/beacon').then((mod) => {
            mod.loadCoinbin().then(() => {
                setCoinbin(mod as CoinbinModule);
                setLoaded(true);
            });
        });
    }, []);

    // Cargar fee dinámico al inicio
    useEffect(() => {
        getDynamicFee().then(setFeeRate);
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

    // Crear transacción con fee dinámico
    const createTx = async () => {
        if (!coinbin || !wallet || utxos.length === 0) return;
        setError(null);
        setTxid(null);

        try {
            const currentFeeRate = await getDynamicFee();
            setFeeRate(currentFeeRate);

            const beaconTx = coinbin.buildAndSignBeacon(
                wallet.wif,
                utxos,
                message,
                currentFeeRate
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
                {/* Header with educational toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#F7931A] mb-2 flex items-center gap-2">
                            ⛓️ Bitcoin Time Capsule
                            <span className="text-xs bg-[#2a2a2a] px-2 py-1 rounded text-gray-400">v0.1 - OP_RETURN</span>
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Pure client-side. Keys never leave your browser. {feeRate} sat/vB
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowEducation(!showEducation)}
                        className="px-4 py-2 bg-[#2a2a2a] rounded text-sm hover:bg-[#3a3a3a] transition-colors"
                    >
                        {showEducation ? '📖 Hide Guide' : '📚 Show Guide'}
                    </button>
                </div>

                {/* Educational Section - Movable! */}
                <AnimatePresence>
                    {showEducation && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-8"
                        >
                            <TerminalWindow title="bitcoin-whitepaper-2008.txt">
                                <div className="space-y-4">
                                    <EducationalBubble title="🔮 Bitcoin antes del 'oro digital'">
                                        <p className="mb-2">En 2008, Satoshi Nakamoto imaginó Bitcoin como un sistema de <span className="text-[#00ff41]">efectivo electrónico peer-to-peer</span>, no como reserva de valor. La red permitía:</p>
                                        <ul className="list-disc list-inside text-xs space-y-1 text-gray-400">
                                            <li>✍️ Inscribir mensajes en la blockchain (OP_RETURN)</li>
                                            <li>📅 Timestamping descentralizado y permanente</li>
                                            <li>🔐 Pruebas de existencia inmutables</li>
                                        </ul>
                                    </EducationalBubble>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                            <div className="text-[#F7931A] text-lg mb-2">①</div>
                                            <h3 className="text-[#00ff41] font-bold mb-2">UTXO Model</h3>
                                            <p className="text-xs text-gray-400">Unspent Transaction Outputs - como "monedas" que gastas para crear nuevas transacciones</p>
                                        </div>
                                        <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                            <div className="text-[#F7931A] text-lg mb-2">②</div>
                                            <h3 className="text-[#00ff41] font-bold mb-2">OP_RETURN</h3>
                                            <p className="text-xs text-gray-400">Código de operación que permite guardar 80 bytes de datos arbitrarios en la blockchain</p>
                                        </div>
                                        <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                            <div className="text-[#F7931A] text-lg mb-2">③</div>
                                            <h3 className="text-[#00ff41] font-bold mb-2">Fees</h3>
                                            <p className="text-xs text-gray-400">Pagas a miners para que incluyan tu mensaje en el bloque - ¡tu mensaje vive para siempre!</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#0a0a0a] p-4 rounded border border-[#F7931A]/30">
                                        <h3 className="text-[#F7931A] font-bold mb-2">📝 Tu mensaje será:</h3>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-[#00ff41]">✓ Inmutable</span>
                                            <span className="text-gray-600">→</span>
                                            <span className="text-[#00ff41]">✓ Verificable</span>
                                            <span className="text-gray-600">→</span>
                                            <span className="text-[#00ff41]">✓ Público para siempre</span>
                                        </div>
                                    </div>
                                </div>
                            </TerminalWindow>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Your original grid layout - PERFECT! */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TerminalWindow title="wallet-utxo.dat">
                        {/* Educational mini-step inside wallet */}
                        {!wallet && showEducation && (
                            <div className="mb-4 p-3 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
                                <StepExplainer step={1} title="Generar Wallet">
                                    Cada wallet tiene una clave privada (WIF) que controla tus UTXOs. 
                                    En Bitcoin, tu "balance" es realmente la suma de todas las UTXOs que puedes gastar.
                                </StepExplainer>
                            </div>
                        )}

                        {/* Your original wallet content - untouched! */}
                        {!wallet ? (
                            <div className="text-center py-12">
                                <button
                                    onClick={createWallet}
                                    className="bg-[#F7931A] text-black font-bold px-8 py-3 rounded-md hover:bg-[#ff9f2a]"
                                >
                                    🔐 Generate Time Capsule Key
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-yellow-900/20 border border-yellow-600/50 p-3 rounded text-xs text-yellow-400">
                                    ⚠️ Wallet stored in session. <strong>Back up your WIF key!</strong>
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
                                        <div className="text-xs text-gray-500 uppercase">Balance (UTXOs)</div>
                                        <div className="text-xl font-bold text-[#F7931A]">{balance.toLocaleString()} SATS</div>
                                        <div className="text-xs text-gray-600 mt-1">{utxos.length} UTXO{utxos.length !== 1 ? 's' : ''}</div>
                                    </div>
                                    <div className="bg-[#0f0f0f] p-4 rounded border border-[#2a2a2a]">
                                        <div className="text-xs text-gray-500 uppercase">Block Height</div>
                                        <div className="text-xl font-bold text-gray-300">#{blockHeight || '---'}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => checkBalance(wallet.address)}
                                    className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] py-3 rounded font-bold"
                                >
                                    🔄 Refresh UTXOs
                                </button>
                            </div>
                        )}
                    </TerminalWindow>

                    <TerminalWindow title="op_return-builder.sh">
                        {/* Educational mini-step inside builder */}
                        {wallet && showEducation && (
                            <div className="mb-4 p-3 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
                                <StepExplainer step={2} title="Crear OP_RETURN">
                                    Tu mensaje será inscrito en la blockchain usando OP_RETURN. 
                                    Máximo 80 bytes (≈40 caracteres). El fee paga a los miners por este servicio eterno.
                                </StepExplainer>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs uppercase text-[#F7931A] mb-3">Eternal Message</label>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter your immortal message..."
                                    maxLength={40}
                                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded p-4 text-[#00ff41] font-mono"
                                />
                                <div className="flex justify-between text-xs text-gray-600 mt-2">
                                    <span>{message.length}/40 characters</span>
                                    <span>{new TextEncoder().encode(message).length}/80 bytes</span>
                                </div>
                            </div>

                            {!wallet && (
                                <div className="bg-blue-900/20 border border-blue-600/50 p-4 rounded text-sm text-blue-400">
                                    💡 <strong>Paso 1:</strong> Generate a wallet first (creates your Bitcoin identity)
                                </div>
                            )}

                            {wallet && balance < 1000 && (
                                <div className="bg-yellow-900/20 border border-yellow-600/50 p-4 rounded text-sm text-yellow-400">
                                    ⚡ <strong>Need testnet BTC:</strong> Get from{' '}
                                    <a href="https://bitcoinfaucet.uo1.net/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
                                        faucet
                                    </a>
                                    {' '}(min 1000 sats for fees + message)
                                </div>
                            )}

                            <button
                                onClick={createTx}
                                disabled={!wallet || balance < 1000 || !message.trim()}
                                className="w-full bg-[#00ff41] text-black font-bold py-4 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00dd41] transition-colors"
                            >
                                {!wallet ? '🔑 GENERATE WALLET FIRST' : 
                                 balance < 1000 ? '💰 NEEDS 1000+ SATS' : 
                                 `✍️ INSCRIBE MESSAGE (${feeRate} sat/vB)`}
                            </button>
                        </div>
                    </TerminalWindow>

                    {/* Transaction view with educational overlay */}
                    <AnimatePresence>
                        {tx && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -20 }} 
                                className="lg:col-span-2"
                            >
                                <TerminalWindow title="signed-transaction.hex">
                                    {/* Educational mini-step inside TX */}
                                    {showEducation && (
                                        <div className="mb-4 p-3 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
                                            <StepExplainer step={3} title="Broadcast Transaction">
                                                La transacción firmada contiene: Entradas (tus UTXOs), Salidas (OP_RETURN + cambio), 
                                                y Fee. Al broadcastear, los miners la incluirán en el próximo bloque.
                                            </StepExplainer>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#0a0a0a] p-4 rounded border border-[#2a2a2a]">
                                                <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                                                    OP_RETURN Message
                                                    <span className="text-[10px] bg-[#F7931A] text-black px-1 rounded">80 bytes max</span>
                                                </div>
                                                <div className="text-[#00ff41] text-sm break-all font-mono">{tx.details.opReturn}</div>
                                            </div>
                                            <div className="bg-[#0a0a0a] p-4 rounded border border-[#2a2a2a]">
                                                <div className="text-xs text-gray-500 mb-2">Network Fee (paid to miners)</div>
                                                <div className="text-[#F7931A] text-sm font-bold">{tx.details.fee} sats</div>
                                                <div className="text-xs text-gray-600 mt-1">~${(tx.details.fee * 0.00000001 * 60000).toFixed(2)} USD</div>
                                            </div>
                                        </div>

                                        <div className="bg-[#0a0a0a] p-4 rounded border border-[#2a2a2a]">
                                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                                                Raw Transaction (Hex)
                                                <span className="text-[10px] text-gray-600">This is what gets broadcasted</span>
                                            </div>
                                            <div className="text-gray-400 text-xs break-all font-mono max-h-32 overflow-y-auto">
                                                {tx.rawTx}
                                            </div>
                                        </div>

                                        <button
                                            onClick={broadcast}
                                            disabled={broadcasting}
                                            className="w-full bg-[#F7931A] text-black font-black py-5 rounded hover:bg-[#ff9f2a] transition-colors relative overflow-hidden group"
                                        >
                                            {broadcasting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                                    BROADCASTING TO MEMPOOL...
                                                </span>
                                            ) : (
                                                '🚀 SEAL MESSAGE IN BITCOIN BLOCKCHAIN'
                                            )}
                                        </button>
                                    </div>
                                </TerminalWindow>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success view with extra educational context */}
                    {txid && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="lg:col-span-2 bg-gradient-to-r from-[#00ff41]/10 to-[#F7931A]/10 border-2 border-[#00ff41] p-8 rounded text-center"
                        >
                            <h2 className="text-3xl font-bold text-[#00ff41] mb-2">✨ MESSAGE IMMORTALIZED ✨</h2>
                            <p className="text-gray-400 mb-4">Your words are now part of Bitcoin's blockchain forever.</p>
                            
                            {showEducation && (
                                <div className="max-w-md mx-auto mb-6 p-4 bg-black/50 rounded text-xs text-left">
                                    <p className="text-[#F7931A] font-bold mb-2">🔍 What just happened?</p>
                                    <ul className="space-y-1 text-gray-400">
                                        <li>• Your transaction was included in a block</li>
                                        <li>• The OP_RETURN output is now immutable history</li>
                                        <li>• Every full node on the network stores your message</li>
                                        <li>• It will exist as long as Bitcoin exists</li>
                                    </ul>
                                </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mb-6 font-mono break-all bg-black/30 p-3 rounded">{txid}</p>
                            
                            <div className="flex gap-4 justify-center">
                                <a
                                    href={`https://mempool.space/tx/${txid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#00ff41] text-black font-bold px-8 py-3 rounded hover:bg-[#00cc33] transition-colors inline-block"
                                >
                                    View on Mempool
                                </a>
                                <button
                                    onClick={() => {
                                        setTxid(null);
                                        setMessage('');
                                    }}
                                    className="bg-[#2a2a2a] text-gray-300 px-8 py-3 rounded hover:bg-[#3a3a3a] transition-colors"
                                >
                                    Create Another Message
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <div className="lg:col-span-2 bg-red-900/10 border border-red-500 p-4 rounded text-red-500">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Footer with OG Bitcoin spirit */}
                <div className="mt-8 text-center text-xs text-gray-600 border-t border-[#2a2a2a] pt-6">
                    <p className="mb-2">Bitcoin OP_RETURN - The original data storage layer. Before NFTs, before ordinals, just pure immutable messages.</p>
                    <p>✨ "A purely peer-to-peer version of electronic cash" - Satoshi Nakamoto, 2008 ✨</p>
                </div>
            </div>
        </div>
    );
}