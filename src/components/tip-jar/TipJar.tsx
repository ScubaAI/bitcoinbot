'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Check, Heart, Globe, ArrowRight, Sparkles, AlertCircle, X } from 'lucide-react';
import { QRCode } from './QRCode';
import { Locale } from '@/types';

interface TipJarProps {
  lang: Locale;
  dict?: { /* tu mismo dict */ };
}

const defaultDict = { /* tu mismo defaultDict */ };

const IMPACT_STATS = { /* igual */ };
const PRESET_AMOUNTS = [1000, 5000, 21000, 100000];

export function TipJar({ lang, dict }: TipJarProps) {
  const [mode, setMode] = useState<'address' | 'invoice'>('address');
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const t = dict || defaultDict[lang];
  const lightningAddress = 'scubapav@blink.sv';

  // Copiar dirección
  const copyAddress = async () => { /* igual que antes */ };

  // Generar factura (con mejor error handling)
  const generateInvoice = async (amount: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipient: lightningAddress,
          memo: `Bitcoin Agent Embed Fund - ${amount} sats`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('API Tip Error:', response.status, data);
        throw new Error(data.error || `Error ${response.status} al generar factura`);
      }

      setPaymentRequest(data.paymentRequest);
      setSelectedAmount(amount);
      setMode('invoice');

      // Expira en 60 minutos (ajusta según tu API)
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      setExpiresAt(expiry);

      // Intento WebLN automático
      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          await (window as any).webln.sendPayment(data.paymentRequest);
          handleSuccess();
          return;
        } catch (_) { /* mostramos QR */ }
      }
    } catch (err: any) {
      console.error('Tip error completo:', err);
      setError(err.message || t.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccess = () => {
    setShowConfetti(true);
    setShowSuccess(true);
    resetToAddress();
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const resetToAddress = () => {
    setMode('address');
    setPaymentRequest(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setExpiresAt(null);
  };

  const handleAmountSelect = (amount: number) => generateInvoice(amount);
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(customAmount);
    if (amt > 0) handleAmountSelect(amt);
  };

  const formatSats = (sats: number) => { /* igual */ };

  return (
    <section className="relative py-24 bg-slate-950 overflow-hidden border-t border-slate-800">
      {/* Backgrounds igual */}

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header + stats + next target igual (corto para no alargar) */}

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* === QR PERMANENTE DECORATIVO === */}
          <div className="flex justify-center pt-8 md:pt-0">
            <QRCode
              value={mode === 'invoice' && paymentRequest ? paymentRequest : `lightning:${lightningAddress}`}
              amount={mode === 'invoice' ? selectedAmount : undefined}
              isInvoiceMode={mode === 'invoice'}
              expiresAt={expiresAt}
              onBack={mode === 'invoice' ? resetToAddress : undefined}
            />
          </div>

          {/* === Controles de monto === */}
          <div className="max-w-md mx-auto md:mx-0">
            {/* Preset amounts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  disabled={isProcessing || mode === 'invoice'}
                  className={`... mismo estilo ... ${selectedAmount === amount ? 'border-orange-500' : ''}`}
                >
                  {/* igual */}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <form onSubmit={handleCustomSubmit} className="flex gap-4 mb-10">
              {/* input y botón igual, disabled cuando mode === 'invoice' */}
            </form>

            {/* Direct LN + QR decorativo fallback si quieres, pero ya está en la izquierda */}
            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-500 text-sm mb-4">O envía directo a</p>
              <div className="inline-flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-3xl px-7 py-4">
                <code className="text-orange-400 font-mono text-sm">{lightningAddress}</code>
                <button onClick={copyAddress} className="p-3 hover:bg-slate-800 rounded-2xl">
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600/95 text-white px-6 py-4 rounded-3xl flex items-center gap-3 shadow-2xl z-[200]"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
              <button onClick={() => setError(null)} className="ml-4 underline text-xs">cerrar</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success + confetti igual */}
      </div>
    </section>
  );
}