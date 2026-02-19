'use client';

/**
 * Proof-of-Work Challenge Page
 * Bitcoin Agent Digital Immune System
 * 
 * Concept: Instead of CAPTCHA, users mine a valid hash
 * Philosophy: "Put your CPU where your mouth is"
 * 
 * Flow:
 * 1. User lands here with ?difficulty=2&returnTo=/api/chat
 * 2. Browser mines SHA-256 until finding hash with N leading zeros
 * 3. Submits nonce to /api/challenge/verify
 * 4. On success, redirected to original destination
 */

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';

interface MiningStats {
    attempts: number;
    startTime: number;
    currentHashrate: number;
    bestDifficulty: number;
}

interface MiningResult {
    nonce: number;
    hash: string;
    attempts: number;
    timeElapsed: number;
}

type BypassReason = 'human-declared' | 'accessibility' | 'mobile-limitation' | 'urgency';

function PoWChallengeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get params from URL
    const difficulty = parseInt(searchParams.get('difficulty') || '2', 10);
    const returnTo = searchParams.get('returnTo') || '/';
    const challengeId = searchParams.get('challengeId') || crypto.randomUUID();

    // Mining state
    const [isMining, setIsMining] = useState(false);
    const [result, setResult] = useState<MiningResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [showNormieOptions, setShowNormieOptions] = useState(false);
    const [bypassWarning, setBypassWarning] = useState<string | null>(null);
    const [pageLoadTime] = useState(Date.now());

    // Stats
    const [stats, setStats] = useState<MiningStats>({
        attempts: 0,
        startTime: 0,
        currentHashrate: 0,
        bestDifficulty: 0,
    });

    // Refs for mining control
    const abortRef = useRef(false);
    const workerRef = useRef<Worker | null>(null);
    const mouseMovementsRef = useRef(0);

    const targetZeros = Array(difficulty + 1).join('0');
    const targetPrefix = targetZeros.substring(0, difficulty);

    /**
     * Count leading zeros in hash for difficulty display
     */
    const countLeadingZeros = (hashArray: Uint8Array): number => {
        let zeros = 0;
        for (let i = 0; i < hashArray.length; i++) {
            const byte = hashArray[i];
            if (byte === 0) {
                zeros += 2;
            } else {
                // Check if first nibble is zero
                if (byte < 16) zeros += 1;
                break;
            }
        }
        return zeros;
    };

    /**
     * Fallback mining (main thread - blocks UI slightly)
     */
    const mineFallback = useCallback(async () => {
        let nonce = 0;
        const startTime = Date.now();
        const batchSize = 100;

        const mineBatch = async () => {
            for (let i = 0; i < batchSize; i++) {
                if (abortRef.current) return;

                const message = challengeId + nonce;
                const hashBuffer = await crypto.subtle.digest('SHA-256',
                    new TextEncoder().encode(message)
                );
                const hashHex = Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                if (hashHex.startsWith(targetPrefix)) {
                    setResult({
                        nonce,
                        hash: hashHex,
                        attempts: nonce + 1,
                        timeElapsed: Date.now() - startTime,
                    });
                    setIsMining(false);
                    return;
                }

                nonce++;
            }

            // Update stats and continue
            const elapsed = Date.now() - startTime;

            const currentHashBuffer = await crypto.subtle.digest('SHA-256',
                new TextEncoder().encode(challengeId + (nonce - 1))
            );

            setStats({
                attempts: nonce,
                startTime,
                currentHashrate: Math.floor(nonce / (elapsed / 1000)),
                bestDifficulty: countLeadingZeros(new Uint8Array(currentHashBuffer)),
            });

            // Schedule next batch
            setTimeout(mineBatch, 0);
        };

        mineBatch();
    }, [challengeId, targetPrefix]);

    /**
     * SHA-256 mining worker
     * Runs in background to prevent UI freezing
     */
    const startMining = useCallback(() => {
        if (isMining || result) return;

        setIsMining(true);
        setError(null);
        abortRef.current = false;

        const startTime = Date.now();
        setStats(prev => ({ ...prev, startTime, attempts: 0 }));

        // Use Web Worker for non-blocking mining
        if (typeof window !== 'undefined' && window.Worker) {
            const workerCode = `
        self.onmessage = async function(e) {
          const { challengeId, targetPrefix, difficulty } = e.data;
          let nonce = 0;
          const startTime = Date.now();
          
          while (true) {
            // Check for abort signal every 1000 iterations
            if (nonce % 1000 === 0) {
              self.postMessage({ type: 'progress', nonce, elapsed: Date.now() - startTime });
            }
            
            const message = challengeId + nonce;
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Check if hash meets difficulty target
            if (hashHex.startsWith(targetPrefix)) {
              self.postMessage({ 
                type: 'success', 
                nonce, 
                hash: hashHex,
                attempts: nonce + 1,
                timeElapsed: Date.now() - startTime
              });
              return;
            }
            
            nonce++;
          }
        };
      `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            workerRef.current = new Worker(URL.createObjectURL(blob));

            workerRef.current.onmessage = (e) => {
                const { type } = e.data;

                if (type === 'progress') {
                    const { nonce, elapsed } = e.data;
                    const hashrate = nonce / (elapsed / 1000);
                    setStats(prev => ({
                        ...prev,
                        attempts: nonce,
                        currentHashrate: Math.floor(hashrate),
                    }));
                }

                if (type === 'success') {
                    const { nonce, hash, attempts, timeElapsed } = e.data;
                    setResult({ nonce, hash, attempts, timeElapsed });
                    setIsMining(false);
                    workerRef.current?.terminate();
                }
            };

            workerRef.current.postMessage({ challengeId, targetPrefix, difficulty });
        } else {
            // Fallback for browsers without Worker support
            mineFallback();
        }
    }, [challengeId, difficulty, targetPrefix, isMining, result, mineFallback]);

    /**
     * Verify solution with backend
     */
    const verifySolution = async () => {
        if (!result) return;

        setVerifying(true);
        setError(null);

        try {
            const response = await fetch('/api/challenge/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    nonce: result.nonce,
                    hash: result.hash,
                    difficulty,
                }),
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                // Success! Redirect to original destination
                router.push(returnTo);
            } else {
                setError(data.message || 'Verification failed. Try again.');
                setResult(null);
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    /**
     * Cancel mining and go back
     */
    const handleCancel = () => {
        abortRef.current = true;
        workerRef.current?.terminate();
        setIsMining(false);
        router.back();
    };

    /**
     * Human bypass (with interaction scoring)
     */
    const handleNormieBypass = async (reason: BypassReason) => {
        setVerifying(true);
        setError(null);

        // Collect interaction data for trust scoring
        const interactionData = {
            timeOnPage: Date.now() - pageLoadTime,
            mouseMovements: mouseMovementsRef.current,
        };

        try {
            const response = await fetch('/api/challenge/bypass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    reason,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    interactionData,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Show success with warning if low trust
                if (data.warning) {
                    setBypassWarning(data.warning);
                    setTimeout(() => router.push(returnTo), 2000);
                } else {
                    router.push(returnTo);
                }
            } else {
                setError(data.message || 'Bypass failed. Please try mining.');
                setVerifying(false);
            }
        } catch (err) {
            setError('Network error. Please try mining instead.');
            setVerifying(false);
        }
    };

    // Track interactions for trust scoring
    useEffect(() => {
        const handleMouseMove = () => {
            mouseMovementsRef.current += 1;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            abortRef.current = true;
            workerRef.current?.terminate();
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const timeElapsed = stats.startTime
        ? Math.floor((Date.now() - stats.startTime) / 1000)
        : 0;

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-mono">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <TerminalWindow
                    title="bitcoin-agent-immune :: proof-of-work-challenge"
                    className="border-[#F7931A]"
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <motion.h1
                            className="text-2xl md:text-3xl font-bold text-[#F7931A] mb-2"
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ⚡ PROOF OF WORK REQUIRED
                        </motion.h1>
                        <p className="text-[#00ff41] text-sm">
                            Byzantine behavior detected. Demonstrate commitment to proceed.
                        </p>
                    </div>

                    {/* Challenge Info */}
                    <div className="bg-[#1a1a1a] rounded p-4 mb-6 border border-[#2a2a2a]">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Target:</span>
                                <span className="text-[#00ff41] ml-2 font-bold">
                                    {targetPrefix}...
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Difficulty:</span>
                                <span className="text-[#F7931A] ml-2">{difficulty}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Challenge ID:</span>
                                <span className="text-gray-400 ml-2 text-xs truncate">
                                    {challengeId.slice(0, 16)}...
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Algorithm:</span>
                                <span className="text-gray-400 ml-2">SHA-256</span>
                            </div>
                        </div>
                    </div>

                    {/* Mining Visualization */}
                    <div className="mb-6">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="mining"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Progress Stats */}
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-[#0a0a0a] rounded p-3 border border-[#2a2a2a]">
                                            <div className="text-2xl font-bold text-[#00ff41]">
                                                {stats.attempts.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">Attempts</div>
                                        </div>
                                        <div className="bg-[#0a0a0a] rounded p-3 border border-[#2a2a2a]">
                                            <div className="text-2xl font-bold text-[#F7931A]">
                                                {stats.currentHashrate.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">H/s</div>
                                        </div>
                                        <div className="bg-[#0a0a0a] rounded p-3 border border-[#2a2a2a]">
                                            <div className="text-2xl font-bold text-[#ffb000]">
                                                {timeElapsed}s
                                            </div>
                                            <div className="text-xs text-gray-500">Elapsed</div>
                                        </div>
                                    </div>

                                    {/* Mining Animation */}
                                    {isMining && (
                                        <div className="bg-[#0a0a0a] rounded p-4 border border-[#2a2a2a]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-4 h-4 border-2 border-[#F7931A] border-t-transparent rounded-full"
                                                />
                                                <span className="text-[#F7931A] text-sm">Mining...</span>
                                            </div>
                                            <div className="font-mono text-xs text-gray-400 overflow-hidden">
                                                <motion.div
                                                    animate={{ x: [0, -100] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className="whitespace-nowrap"
                                                >
                                                    {Array(10).fill(0).map((_, i) => (
                                                        <span key={i} className="mr-4">
                                                            {crypto.randomUUID().slice(0, 16)}...
                                                        </span>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        {!isMining ? (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={startMining}
                                                className="flex-1 bg-[#F7931A] hover:bg-[#ff9f2a] text-black font-bold py-3 px-6 rounded transition-colors"
                                            >
                                                🚀 Start Mining
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    abortRef.current = true;
                                                    workerRef.current?.terminate();
                                                    setIsMining(false);
                                                }}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-colors"
                                            >
                                                ⏹ Stop
                                            </motion.button>
                                        )}

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleCancel}
                                            className="px-6 py-3 border border-gray-600 text-gray-400 hover:text-white rounded transition-colors"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* Success Display */}
                                    <div className="bg-[#00ff41]/10 border border-[#00ff41] rounded p-4">
                                        <div className="text-[#00ff41] font-bold mb-2">✓ Valid Solution Found</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Nonce:</span>
                                                <span className="text-[#00ff41]">{result.nonce}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Hash:</span>
                                                <span className="text-[#00ff41] font-mono text-xs truncate max-w-[200px]">
                                                    {result.hash}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Attempts:</span>
                                                <span className="text-[#00ff41]">{result.attempts.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Time:</span>
                                                <span className="text-[#00ff41]">{(result.timeElapsed / 1000).toFixed(2)}s</span>
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={verifySolution}
                                        disabled={verifying}
                                        className="w-full bg-[#F7931A] hover:bg-[#ff9f2a] disabled:bg-gray-600 text-black font-bold py-3 px-6 rounded transition-colors"
                                    >
                                        {verifying ? 'Verifying...' : 'Submit & Continue →'}
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-900/20 border border-red-600 rounded p-3 mb-4 text-red-400 text-sm"
                        >
                            ⚠ {error}
                        </motion.div>
                    )}

                    {/* Success/Warning Display */}
                    {bypassWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-yellow-900/20 border border-yellow-600 rounded p-3 mb-4 text-yellow-400 text-sm"
                        >
                            ⚠ {bypassWarning}
                        </motion.div>
                    )}

                    {/* Info Footer */}
                    <div className="border-t border-[#2a2a2a] pt-4 text-xs text-gray-500 space-y-2">
                        <p>
                            <span className="text-[#F7931A]">Why PoW?</span> Unlike CAPTCHA, this proves
                            commitment through computational work. Privacy-preserving, no tracking.
                        </p>

                        {/* Normie Bypass Section */}
                        <div className="border-t border-[#2a2a2a] pt-4 mt-4 text-center">
                            <button
                                onClick={() => setShowNormieOptions(!showNormieOptions)}
                                className="text-[#F7931A] hover:text-[#ff9f2a] text-sm font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <span>👤 I&apos;m Human / Normie</span>
                                <motion.span
                                    animate={{ rotate: showNormieOptions ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ▼
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {showNormieOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 space-y-2 overflow-hidden"
                                    >
                                        <p className="text-xs text-gray-500 mb-3 text-center">
                                            Can&apos;t mine? No problem. Select your reason:
                                        </p>

                                        {[
                                            { id: 'accessibility', label: '♿ Accessibility needs', desc: 'Screen reader, motor disability' },
                                            { id: 'mobile-limitation', label: '📱 Mobile limitation', desc: 'Low battery or old device' },
                                            { id: 'urgency', label: '⚡ Urgent access', desc: 'Time-sensitive request' },
                                            { id: 'human-declared', label: '👤 Just human', desc: 'Prefer not to mine' },
                                        ].map((option) => (
                                            <motion.button
                                                key={option.id}
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleNormieBypass(option.id as BypassReason)}
                                                disabled={verifying}
                                                className="w-full text-left p-3 rounded bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#F7931A]/50 transition-all disabled:opacity-50"
                                            >
                                                <div className="text-sm text-gray-300 font-medium">{option.label}</div>
                                                <div className="text-xs text-gray-500">{option.desc}</div>
                                            </motion.button>
                                        ))}

                                        <p className="text-xs text-gray-600 mt-2 text-center">
                                            Limited to 3 per day. PoW grants longer access.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </TerminalWindow>
            </motion.div>
        </div>
    );
}

export default function PoWChallenge() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-mono text-[#F7931A]">
                Initializing Immune System...
            </div>
        }>
            <PoWChallengeContent />
        </Suspense>
    );
}
