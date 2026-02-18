'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Check, Heart, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Locale } from '@/types';
import { QRCode } from './QRCode';

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

const IMPACT_STATS = {
  embeds: 3,
  satsRaised: 154320,
  donors: 42,
  nextTarget: "Bitcoin Beach"
};

const PRESET_AMOUNTS = [1000, 5000, 21000, 100000];

export function TipJar({ lang, dict }: TipJarProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null);

  const t = dict || defaultDict[lang];

  const lightningAddress = 'bitcoinagent@blink.sv';

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
      
      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          await (window as any).webln.sendPayment(data.paymentRequest);
          handleSuccess();
        } catch (weblnError) {
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
    <section className="relative py-24 bg-slate-950 overflow-hidden border-t border-slate-800">
      {/* Background masterpiece */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.12)_0%,transparent_65%)]" />
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
          backgroundSize: '68px 68px'
        }} 
      />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-900/70 backdrop-blur-2xl border border-orange-500/30 rounded-3xl mb-8">
            <Heart className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-mono tracking-[3px] text-sm uppercase">Community Powered</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-orange-300 via-white to-amber-200 bg-clip-text text-transparent font-mono tracking-tighter mb-6">
            {t.title}
          </h2>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.description}
          </p>
        </motion.div>

        {/* Impact Stats - glass luxury */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-16"
        >
          {[
            { value: IMPACT_STATS.embeds, label: t.embeds, color: 'text-orange-400' },
            { value: formatSats(IMPACT_STATS.satsRaised), label: t.satsRaised, color: 'text-yellow-400' },
            { value: IMPACT_STATS.donors, label: lang === 'en' ? 'Donors' : 'Donantes', color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="group bg-slate-900/60 backdrop-blur-3xl border border-slate-700/70 hover:border-orange-500/40 rounded-3xl p-8 text-center transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10">
              <div className={`text-5xl font-bold font-mono tracking-tighter ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-[2px] text-slate-500 mt-3 group-hover:text-orange-400/70 transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Next Target */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mb-14 text-sm font-light text-slate-400"
        >
          <Globe className="w-5 h-5 text-orange-500" />
          <span>{t.nextTarget}</span>
          <ArrowRight className="w-5 h-5 text-orange-500" />
          <span className="text-orange-400 font-medium">bitcoinbeach.com</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {!paymentRequest ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {/* Preset amounts - premium buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    disabled={isProcessing}
                    className={`group relative p-7 rounded-3xl border-2 bg-slate-900/70 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] ${
                      selectedAmount === amount
                        ? 'border-orange-500 shadow-2xl shadow-orange-500/30 bg-orange-500/10'
                        : 'border-slate-700 hover:border-orange-500/50'
                    }`}
                  >
                    <div className="text-4xl font-bold text-white font-mono tracking-tight group-hover:text-orange-400 transition-colors">
                      {formatSats(amount)}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">sats</div>
                    {amount === 21000 && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-orange-500 to-amber-500 text-black text-[10px] font-bold px-4 py-1 rounded-2xl shadow-lg">21M</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <form onSubmit={handleCustomSubmit} className="flex gap-4 mb-10">
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
                    className="w-full px-7 py-5 bg-slate-900 border border-slate-700 rounded-3xl text-white font-mono text-2xl placeholder:text-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                  <span className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-500">sats</span>
                </div>
                <button
                  type="submit"
                  disabled={!customAmount || isProcessing}
                  className="px-12 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold rounded-3xl flex items-center gap-3 transition-all disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  {t.button}
                </button>
              </form>

              {/* Direct LN */}
              <div className="pt-8 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-sm mb-5">Or send directly to</p>
                <div className="inline-flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-3xl px-7 py-4">
                  <code className="text-orange-400 font-mono text-sm tracking-wider">{lightningAddress}</code>
                  <button
                    onClick={copyAddress}
                    className="p-3 hover:bg-slate-800 rounded-2xl transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="max-w-md mx-auto"
            >
              <div className="relative bg-slate-900/80 backdrop-blur-3xl border border-orange-500/30 rounded-3xl p-8 shadow-2xl">
                <QRCode value={paymentRequest} amount={selectedAmount || parseInt(customAmount) || undefined} />
              </div>

              <div className="mt-6 p-5 bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-3xl">
                <p className="uppercase text-xs tracking-[2px] text-slate-500 mb-2">{t.scan}</p>
                <div className="flex items-center gap-3 bg-slate-950 rounded-2xl p-4">
                  <code className="flex-1 text-xs text-slate-400 font-mono break-all">
                    {paymentRequest.slice(0, 26)}...{paymentRequest.slice(-26)}
                  </code>
                  <button onClick={() => {
                    navigator.clipboard.writeText(paymentRequest!);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}>
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setPaymentRequest(null)}
                className="mt-6 text-slate-400 hover:text-white flex items-center gap-2 mx-auto text-sm"
              >
                ← {lang === 'en' ? 'Choose different amount' : 'Elegir otra cantidad'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast - luxury */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.9 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-green-500 to-emerald-500 text-slate-950 px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <div className="font-bold text-xl">{t.success}</div>
                <div className="text-sm opacity-90">{t.thankYou}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[90] overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ top: '-10%', left: `${Math.random() * 100}%`, scale: 0 }}
                animate={{ 
                  top: '110%', 
                  left: `${Math.random() * 100}%`,
                  rotate: Math.random() * 720 - 360,
                  scale: Math.random() * 1.5 + 0.8
                }}
                transition={{ duration: 2.2 + Math.random(), ease: "easeOut" }}
                className="absolute w-3 h-3 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Powered footer */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-600">
            <Zap className="w-4 h-4" /> {t.powered}
          </div>
        </div>
      </div>
    </section>
  );
}