'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRCodeProps {
  value: string;
  size?: number;
  amount?: number;           // ← Cantidad abierta y protagonista
}

export function QRCode({ value, size = 280, amount }: QRCodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Massive background glow */}
      <div className={`absolute -inset-12 bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-transparent rounded-[4rem] blur-3xl transition-all duration-700 ${isHovered ? 'opacity-100 scale-110' : 'opacity-60'}`} />

      {/* Holographic glass card */}
      <div className="relative bg-slate-950/90 backdrop-blur-3xl border border-orange-500/40 rounded-3xl p-8 shadow-2xl shadow-orange-500/20 overflow-hidden">
        
        {/* Animated neon border */}
        <div className="absolute inset-0 border border-orange-500/60 rounded-3xl pointer-events-none" 
             style={{ 
               boxShadow: isHovered 
                 ? '0 0 60px 8px rgba(249, 115, 22, 0.6)' 
                 : '0 0 40px 4px rgba(249, 115, 22, 0.3)' 
             }} 
        />

        {/* Scanning laser beam */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ top: '-20%' }}
              animate={{ top: '120%' }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent z-20"
            />
          )}
        </AnimatePresence>

        {/* Amount display - LA ESTRELLA (cantidad abierta) */}
        {amount && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-slate-900/80 border border-orange-500/30 rounded-2xl px-8 py-3">
              <span className="text-4xl font-bold text-white font-mono tracking-[-1px]">
                {amount.toLocaleString()}
              </span>
              <div>
                <span className="text-orange-400 text-xl font-mono">sats</span>
                <div className="text-[10px] text-orange-400/70 -mt-1 tracking-widest">TO POWER THE MISSION</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* QR Container */}
        <div className="relative mx-auto w-fit">
          <div className="relative bg-white p-5 rounded-2xl shadow-inner">
            {/* Bitcoin corner accents */}
            <div className="absolute top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />

            <QRCodeSVG
              value={value}
              size={size}
              level="H"
              includeMargin={false}
              imageSettings={{
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23f7931a'/%3E%3Ctext x='16' y='21' text-anchor='middle' fill='white' font-size='14' font-weight='bold'%3E₿%3C/text%3E%3C/svg%3E",
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>

          {/* Pulsing central Bitcoin logo */}
          <motion.div 
            animate={{ scale: isHovered ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 bg-slate-950 border-4 border-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-black text-orange-500 drop-shadow-[0_0_12px_#f97316]">₿</span>
            </div>
          </motion.div>
        </div>

        {/* Subtle floating sats */}
        <div className="absolute -top-3 -right-3 text-[10px] font-mono text-orange-400/60 bg-slate-950/80 px-3 py-1 rounded-full border border-orange-500/20">
          {amount ? `${amount} sats` : 'Lightning'}
        </div>
      </div>

      {/* Label */}
      <p className="text-center mt-6 text-orange-400/80 text-sm font-mono tracking-[2px]">
        SCAN WITH ANY LIGHTNING WALLET
      </p>
    </motion.div>
  );
}