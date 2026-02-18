'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

interface QRCodeProps {
  value: string;
  size?: number;
  amount?: number;
  isInvoiceMode?: boolean;
  expiresAt?: Date | null;
  onBack?: () => void;
}

export function QRCode({ value, size = 280, amount, isInvoiceMode, expiresAt, onBack }: QRCodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const remainingMinutes = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 60000) : null;

  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow y glass card igual... */}

      {/* Amount o etiqueta decorativa */}
      {isInvoiceMode && amount ? (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-slate-900/90 border border-orange-500/40 rounded-2xl px-10 py-4">
            <span className="text-5xl font-bold text-white font-mono">{amount.toLocaleString()}</span>
            <div className="text-left">
              <span className="text-orange-400 text-2xl">sats</span>
              <div className="text-xs text-orange-400/70">TO POWER THE MISSION</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center mb-6">
          <div className="inline-block bg-slate-900/80 border border-orange-500/30 rounded-2xl px-8 py-3">
            <span className="text-xl text-orange-400 font-mono">SCAN TO TIP ANYTIME ₿</span>
          </div>
        </div>
      )}

      {/* El QR mismo (igual que antes) */}

      {/* Timer en modo factura */}
      {isInvoiceMode && remainingMinutes && (
        <div className="flex items-center justify-center gap-2 text-orange-400 text-sm mt-4">
          <Clock className="w-4 h-4" /> Expira en {remainingMinutes} min
        </div>
      )}

      {/* Botón Volver en modo factura */}
      {isInvoiceMode && onBack && (
        <button
          onClick={onBack}
          className="mt-6 mx-auto flex items-center gap-2 text-slate-400 hover:text-white text-sm"
        >
          ← Elegir otra cantidad
        </button>
      )}

      {/* Label inferior */}
      <p className="text-center mt-8 text-orange-400/70 text-xs font-mono tracking-[2px]">
        {isInvoiceMode ? 'SCAN WITH ANY LIGHTNING WALLET' : 'LIGHTNING ADDRESS PERMANENTE'}
      </p>
    </motion.div>
  );
}