'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Check, Heart, Globe, Code, ArrowRight, Sparkles } from 'lucide-react';
import { Locale } from '@/types';

interface TipJarProps {
  lang: Locale;
  dict?: {
    title: string;
    description: string;
    button: string;
    success: string;
    error: string;
    impact?: string;
    embeds: string;
    satsRaised: string;
    nextTarget: string;
    thankYou: string;
    copy: string;
    scan: string;
    powered: string;
  };
}

// Fallback dict si no se pasa
const defaultDict = {
  en: {
    title: "Power the Mission",
    description: "Your sats help us embed this Bitcoin Agent in communities worldwide—starting with Bitcoin Beach and beyond.",
    button: "Send Sats",
    success: "Zap received! ⚡",
    error: "Failed to send. Try again.",
    impact: "Impact so far",
    embeds: "Community embeds",
    satsRaised: "Sats raised",
    nextTarget: "Next: Bitcoin Beach website",
    thankYou: "Thank you for keeping the orange flame alive!",
    copy: "Copy LN address",
    scan: "Scan with wallet",
    powered: "Powered by Lightning Network"
  },
  es: {
    title: "Impulsa la Misión",
    description: "Tus sats nos ayudan a integrar este Bitcoin Agent en comunidades del mundo—empezando por Bitcoin Beach y más allá.",
    button: "Enviar Sats",
    success: "¡Zap recibido! ⚡",
    error: "Error al enviar. Intenta de nuevo.",
    impact: "Impacto hasta ahora",
    embeds: "Comunidades con embed",
    satsRaised: "Sats recaudados",
    nextTarget: "Próximo: Sitio de Bitcoin Beach",
    thankYou: "¡Gracias por mantener viva la llama naranja!",
    copy: "Copiar dirección LN",
    scan: "Escanear con wallet",
    powered: "Powered by Lightning Network"
  }
};

// Mock data - en producción vendría de una API
const IMPACT_STATS = {
  embeds: 3,
  satsRaised: 154320,
  donors: 42,
  nextTarget: "Bitcoin Beach"
};

const PRESET_AMOUNTS = [1000, 5000, 21000, 100000]; // 1k, 5k, 21k, 100k sats

export function TipJar({ lang, dict }: TipJarProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null);

  const t = dict || defaultDict[lang];

  // Lightning Address de la organización
  const lightningAddress = 'bitcoinagent@blink.sv'; // Cambiar por tu dirección real

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateInvoice = async (amount: number) => {
    setIsProcessing(true);
    try {
      // Llamar a tu API para generar invoice
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipient: lightningAddress,
          memo: `Bitcoin Agent Embed Fund - ${amount} sats`,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate invoice');

      const data = await response.json();
      setPaymentRequest(data.paymentRequest);
      
      // Si el usuario tiene WebLN (Alby, etc), intentar pagar automáticamente
      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          await (window as any).webln.sendPayment(data.paymentRequest);
          handleSuccess();
        } catch (weblnError) {
          // WebLN falló, mostrar QR para escanear manualmente
          console.log('WebLN payment failed or cancelled, showing QR');
        }
      }
    } catch (error) {
      console.error('Tip error:', error);
      alert(t.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccess = () => {
    setShowConfetti(true);
    setShowSuccess(true);
    setPaymentRequest(null);
    setSelectedAmount(null);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    generateInvoice(amount);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (amount > 0) {
      handleAmountSelect(amount);
    }
  };

  const formatSats = (sats: number) => {
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(2)}M`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k`;
    return sats.toString();
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        
        {/* Header con impacto emocional */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
            <Heart className="w-4 h-4 text-orange-500" />
            <span className="text-orange-400 text-sm font-medium">
              {lang === 'en' ? 'Community Powered' : 'Impulsado por la Comunidad'}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
              {t.title}
            </span>
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
        </motion.div>

        {/* Stats de impacto */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
        >
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-2xl font-bold text-orange-400 font-mono">
              {IMPACT_STATS.embeds}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
              {t.embeds}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {formatSats(IMPACT_STATS.satsRaised)}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
              {t.satsRaised}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="text-2xl font-bold text-green-400 font-mono">
              {IMPACT_STATS.donors}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
              {lang === 'en' ? 'Donors' : 'Donantes'}
            </div>
          </div>
        </motion.div>

        {/* Target actual */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mb-10 text-sm text-slate-400"
        >
          <Globe className="w-4 h-4" />
          <span>{t.nextTarget}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-orange-400">bitcoinbeach.com</span>
        </motion.div>

        {/* Main interaction area */}
        <AnimatePresence mode="wait">
          {!paymentRequest ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Preset amounts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    disabled={isProcessing}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedAmount === amount
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-orange-500/50'
                    } disabled:opacity-50`}
                  >
                    <div className="text-2xl font-bold text-white font-mono">
                      {formatSats(amount)}
                    </div>
                    <div className="text-xs text-slate-500">sats</div>
                    {amount === 21000 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        21M
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <form onSubmit={handleCustomSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder={lang === 'en' ? 'Custom amount...' : 'Cantidad personalizada...'}
                    min="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">sats</span>
                </div>
                <button
                  type="submit"
                  disabled={!customAmount || isProcessing}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {t.button}
                </button>
              </form>

              {/* Lightning Address directa */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-center text-slate-500 text-sm mb-4">
                  {lang === 'en' ? 'Or send directly to:' : 'O envía directamente a:'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2">
                    <code className="text-orange-400 font-mono text-sm">{lightningAddress}</code>
                    <button
                      onClick={copyAddress}
                      className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      title={t.copy}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="bg-white p-6 rounded-2xl mb-6">
                {/* Aquí iría el QR code real */}
                <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-slate-400 text-sm text-center p-4">
                    [QR Code: {paymentRequest.slice(0, 20)}...]
                    <br />
                    <span className="text-xs">En producción: react-qr-code</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm font-medium mb-2">{t.scan}</p>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-3">
                  <code className="flex-1 text-xs text-slate-600 truncate font-mono">
                    {paymentRequest}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentRequest);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setPaymentRequest(null)}
                className="text-slate-500 hover:text-white text-sm transition-colors"
              >
                {lang === 'en' ? '← Choose different amount' : '← Elegir otra cantidad'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-green-500 text-slate-950 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-950/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold">{t.success}</div>
                  <div className="text-sm opacity-80">{t.thankYou}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti effect (simplified) */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  top: '50%', 
                  left: '50%', 
                  scale: 0 
                }}
                animate={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  scale: Math.random() * 2 + 1,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute w-2 h-2 bg-orange-500 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-slate-600 text-xs">
            <Zap className="w-3 h-3" />
            <span>{t.powered}</span>
          </div>
        </div>
      </div>
    </section>
  );
}