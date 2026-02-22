'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle } from 'lucide-react';

// ============================================================================
// SEGURIDAD: Ofuscación de sessionStorage
// ============================================================================

const STORAGE_KEY = '_btc_sess';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30000;

function storeKey(key: string) {
  const mask = Date.now().toString(36);
  const obfuscated = key.split('').map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ mask.charCodeAt(i % mask.length))
  ).join('');
  
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
    k: obfuscated,
    m: mask,
    t: Date.now()
  }));
}

function retrieveKey(): string | null {
  const data = sessionStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    const { k, m } = JSON.parse(data);
    return k.split('').map((c: string, i: number) => 
      String.fromCharCode(c.charCodeAt(0) ^ m.charCodeAt(i % m.length))
    ).join('');
  } catch { return null; }
}

function clearKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// SECURITY GATE COMPONENT
// ============================================================================

function SecurityGate({ onUnlock }: { onUnlock: (key: string) => void }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const isLocked = lockoutUntil ? Date.now() < lockoutUntil : false;
  const remainingTime = lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 1000) : 0;

  // Auto-reset lockout
  useEffect(() => {
    if (!isLocked) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockoutUntil!) {
        setLockoutUntil(null);
        setAttempts(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockoutUntil]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`System locked. Wait ${remainingTime}s.`);
      return;
    }
    
    if (!key.trim()) return;

    setChecking(true);
    setError('');

    try {
      // Timing-safe request (backend debe implementar delay constante)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch('/api/satoshi/immune/stats', {
        method: 'GET',
        headers: { 'X-API-Key': key.trim() },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        storeKey(key.trim());
        setAttempts(0);
        onUnlock(key.trim());
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_MS);
          setError(`Maximum attempts exceeded. System locked for ${LOCKOUT_MS/1000}s.`);
        } else {
          setError(`Authentication failed. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Check connection.');
      } else {
        setError('Connection failed. Verify network.');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-[#1a1a1a] border border-[#F7931A]/50 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#F7931A]/10 p-6 border-b border-[#F7931A]/20">
            <div className="flex flex-col items-center">
              <motion.div
                animate={isLocked ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Lock className={`w-12 h-12 ${isLocked ? 'text-red-500' : 'text-[#F7931A]'} mb-4`} />
              </motion.div>
              <h2 className="text-xl font-bold text-white tracking-wider">SATOSHI CORE</h2>
              <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Restricted Access</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {isLocked && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/30 rounded p-3 flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-400 text-xs">
                  Security lockout active. {remainingTime}s remaining.
                </span>
              </motion.div>
            )}

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Authentication Key
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={isLocked || checking}
                  className="w-full px-4 py-3 bg-black border border-[#2a2a2a] rounded text-white 
                           placeholder-gray-600 focus:border-[#F7931A] focus:outline-none 
                           transition-colors disabled:opacity-50 font-mono text-sm"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs text-center bg-red-500/10 py-2 rounded"
                >
                  {escapeHtml(error)}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={checking || isLocked || !key.trim()}
                className="w-full py-3 bg-[#F7931A] text-black font-bold rounded 
                         hover:bg-[#e88a00] active:scale-[0.98] transition-all 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {checking ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                    />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <span>DECRYPT ACCESS</span>
                )}
              </button>
            </form>

            <p className="text-center text-gray-600 text-[10px]">
              Session expires on tab close. No persistent storage.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function ImmuneDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    const stored = retrieveKey();
    if (stored) {
      setApiKey(stored);
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = useCallback((key: string) => {
    setApiKey(key);
    setUnlocked(true);
  }, []);

  const handleLogout = useCallback(() => {
    clearKey();
    setApiKey(null);
    setUnlocked(false);
  }, []);

  if (!unlocked || !apiKey) {
    return <SecurityGate onUnlock={handleUnlock} />;
  }

  // ... resto del dashboard con handleLogout disponible ...
  return <DashboardContent apiKey={apiKey} onLogout={handleLogout} />;
}

// Componente separado para el contenido del dashboard
function DashboardContent({ apiKey, onLogout }: { apiKey: string; onLogout: () => void }) {
  // ... tu lógica actual del dashboard ...
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono">
      {/* Header con logout */}
      <header className="border-b border-[#2a2a2a] p-4 flex justify-between items-center">
        <h1 className="text-[#F7931A] font-bold">SATOSHI IMMUNE DASHBOARD</h1>
        <button 
          onClick={onLogout}
          className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 
                   px-3 py-1 rounded hover:bg-red-500/10 transition-colors"
        >
          [PURGE SESSION]
        </button>
      </header>
      {/* ... resto del dashboard ... */}
    </div>
  );
}