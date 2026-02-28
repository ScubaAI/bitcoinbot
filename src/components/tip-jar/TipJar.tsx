'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Zap, Copy, Check, Heart, Globe, ArrowRight, Sparkles, 
  AlertCircle, X, Clock, Bitcoin, Shield, ZapOff, 
  Wallet, Cable, Cpu
} from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeSVG), { ssr: false });
import { Locale } from '@/types';

interface TipDict {
  tip: {
    title: string;
    description: string;
    button: string;
    success: string;
    error: string;
    impact: string;
    embeds: string;
    satsRaised: string;
    nextTarget: string;
    thankYou: string;
    copy: string;
    scan: string;
    customAmount: string;
    powered: string;
    preset: {
      '1k': string;
      '5k': string;
      '21k': string;
      '100k': string;
    };
  };
}

interface TipJarProps {
  lang: Locale;
  dict?: TipDict['tip'];
}

const defaultDictByLocale: Record<Locale, TipDict['tip']> = {
  en: {
    title: 'Power the Mission',
    description: 'Your sats fund the Bitcoin Agent infrastructure—servers, APIs, and continuous improvements.',
    button: 'Send Sats',
    success: 'Zap received! ⚡',
    error: 'Payment failed. Please try again.',
    impact: 'Impact so far',
    embeds: 'Community contributors',
    satsRaised: 'Sats raised',
    nextTarget: 'Next: Enhanced AI models',
    thankYou: 'Thank you for keeping the orange flame alive!',
    copy: 'Copy LN address',
    scan: 'Scan with wallet',
    customAmount: 'Custom amount...',
    powered: 'Powered by Lightning Network',
    preset: {
      '1k': '1,000 sats',
      '5k': '5,000 sats',
      '21k': '21,000 sats',
      '100k': '100,000 sats'
    }
  },
  es: {
    title: 'Impulsa la Misión',
    description: 'Tus sats mantienen vivo el Bitcoin Agent—servidores, APIs y mejoras continuas.',
    button: 'Enviar Sats',
    success: '¡Zap recibido! ⚡',
    error: 'El pago falló. Por favor intenta de nuevo.',
    impact: 'Impacto hasta ahora',
    embeds: 'Contribuyentes activos',
    satsRaised: 'Sats recaudados',
    nextTarget: 'Próximo: Modelos de IA mejorados',
    thankYou: '¡Gracias por mantener viva la llama naranja!',
    copy: 'Copiar dirección LN',
    scan: 'Escanear con wallet',
    customAmount: 'Cantidad personalizada...',
    powered: 'Powered by Lightning Network',
    preset: {
      '1k': '1.000 sats',
      '5k': '5.000 sats',
      '21k': '21.000 sats',
      '100k': '100.000 sats'
    }
  }
};

const IMPACT_STATS = [
  { label: 'embeds', value: '12', icon: Cable },
  { label: 'satsRaised', value: '2.4M', icon: Zap }
];

const PRESET_AMOUNTS = [1000, 5000, 21000, 100000];

// 🎨 COMPONENTES DE EFECTOS VISUALES MEJORADOS
const LightningBolt = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      x: [0, 50, 100],
      y: [0, -20, 0]
    }}
    transition={{ 
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 3
    }}
    className="absolute text-orange-400/30"
  >
    <Zap className="w-8 h-8" />
  </motion.div>
);

const BitcoinParticles = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          x: Math.random() * 100 - 50 + '%',
          y: -20,
          rotate: 0,
          opacity: 0.3
        }}
        animate={{ 
          y: '120%',
          rotate: 360,
          opacity: 0
        }}
        transition={{
          duration: 8 + Math.random() * 4,
          repeat: Infinity,
          delay: i * 2,
          ease: "linear"
        }}
        className="absolute"
      >
        <Bitcoin className="w-4 h-4 text-orange-400/20" />
      </motion.div>
    ))}
  </div>
);

const BitcoinLogoSVG = () => (
  <motion.svg 
    viewBox="0 0 64 64" 
    width="48" 
    height="48" 
    className="mx-auto my-auto"
    animate={{ 
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 0.95, 1]
    }}
    transition={{ 
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <circle cx="32" cy="32" r="30" fill="#F7931A" />
    <path
      fill="#FFF"
      d="M44.5 28.5c.6-4-2.4-6.2-6.5-7.6l1.3-5.3-3.2-.8-1.3 5.2c-.8-.2-1.7-.4-2.5-.6l1.3-5.2-3.2-.8-1.3 5.3c-.7-.2-1.4-.3-2-.5l-4.4-1.1-.8 3.4s2.4.5 2.3.6c1.3.3 1.5 1.2 1.5 1.9l-1.5 6.1c.1 0 .2 0 .4.1-.1 0-.3-.1-.4-.1l-2.1 8.5c-.2.4-.6 1.1-1.5.8 0 .1-2.3-.6-2.3-.6l-1.6 3.7 4.1 1c.8.2 1.5.4 2.2.6l-1.4 5.5 3.2.8 1.4-5.4c.9.2 1.7.5 2.5.7l-1.3 5.3 3.2.8 1.4-5.5c5.7 1.1 10 .6 11.8-4.5 1.5-4.1-.1-6.5-3.1-8.1 2.2-.5 3.9-2 4.3-5zm-7.8 10.9c-1.1 4.3-8.2 2-10.5 1.4l1.9-7.5c2.3.6 9.7 1.6 8.6 6.1zm1.1-11.3c-1 3.9-6.8 1.9-8.7 1.4l1.7-6.7c1.9.5 8 1.4 7 5.3z"
    />
  </motion.svg>
);

// ✨ NUEVO: Componente de luz ambiental interactiva
const AmbientLight = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const lightX = useTransform(springX, [0, 1], ['20%', '80%']);
  const lightY = useTransform(springY, [0, 1], ['20%', '80%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at ${lightX} ${lightY}, rgba(247, 147, 26, 0.15) 0%, transparent 50%)`
      }}
    />
  );
};

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
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hoveredAmount, setHoveredAmount] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = dict || defaultDictByLocale[lang];
  const lightningAddress = 'scubapav@blink.sv';

  // 🐱 FIX #1: resetToAddress con cleanup
  const resetToAddress = useCallback(() => {
    setMode('address');
    setPaymentRequest(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setExpiresAt(null);
    setTimeLeft(null);
    setError(null);
  }, []);

  // 🐱 FIX #2: Timer mejorado con cleanup
  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const diff = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        resetToAddress();
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, resetToAddress]);

  // 🐱 FIX #3: Success handler con animación
  const handleSuccess = useCallback(() => {
    setShowConfetti(true);
    setShowSuccess(true);
    resetToAddress();
    setTimeout(() => setShowConfetti(false), 5000);
    setTimeout(() => setShowSuccess(false), 5000);
  }, [resetToAddress]);

  // 🐱 FIX #4: Generación de invoice con validación mejorada
  const generateInvoice = useCallback(async (amount: number) => {
    if (!amount || amount <= 0 || isProcessing) {
      setError(lang === 'es' ? 'Cantidad inválida' : 'Invalid amount');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSelectedAmount(amount);
    setMode('invoice');

    try {
      console.log('⚡ Generando invoice para:', amount, 'sats');

      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipient: lightningAddress,
          memo: `Bitcoin Agent Embed Fund - ${amount} sats`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.paymentRequest) {
        throw new Error(lang === 'es' ? 'Respuesta inválida' : 'Invalid response');
      }

      setPaymentRequest(data.paymentRequest);
      setExpiresAt(new Date(Date.now() + 60 * 60 * 1000));

      // WebLN con mejor manejo
      if (typeof window !== 'undefined' && (window as any).webln) {
        try {
          await (window as any).webln.enable();
          const result = await (window as any).webln.sendPayment(data.paymentRequest);
          console.log('⚡ WebLN success:', result);
          handleSuccess();
        } catch (weblnErr) {
          // Fallback silencioso a QR
          console.log('WebLN fallback to QR');
        }
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || t.error);
      resetToAddress();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, lang, lightningAddress, t.error, handleSuccess, resetToAddress]);

  // 🐱 FIX #5: Manejadores optimizados
  const handleAmountSelect = useCallback((amount: number) => {
    if (mode === 'invoice' || isProcessing) return;
    generateInvoice(amount);
  }, [mode, isProcessing, generateInvoice]);

  const handleCustomSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'invoice' || isProcessing) return;

    const amt = parseInt(customAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      setError(lang === 'es' ? 'Cantidad inválida' : 'Invalid amount');
      return;
    }
    if (amt > 10000000) { // Límite de 10M sats
      setError(lang === 'es' ? 'Máximo 10,000,000 sats' : 'Max 10,000,000 sats');
      return;
    }
    generateInvoice(amt);
  }, [customAmount, mode, isProcessing, lang, generateInvoice]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSats = (sats: number) => {
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k`;
    return sats.toString();
  };

  const getQRValue = useCallback(() => {
    if (mode === 'invoice' && paymentRequest) {
      const cleanReq = paymentRequest.replace(/^lightning:/i, '');
      return `lightning:${cleanReq.toUpperCase()}`;
    }
    return `lightning:${lightningAddress}`;
  }, [mode, paymentRequest, lightningAddress]);

  const canGenerateInvoice = mode !== 'invoice' && !isProcessing;

  return (
    <section ref={containerRef} className="relative py-24 bg-slate-950 overflow-hidden border-t border-slate-800">
      {/* 🎨 EFECTOS DE LUZ MEJORADOS */}
      <AmbientLight />
      <BitcoinParticles />
      
      {/* Fondo de rejilla animada */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Rayos de luz ocasionales */}
        <LightningBolt delay={0} />
        <LightningBolt delay={1} />
        <LightningBolt delay={2} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header con animación de entrada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-mono uppercase tracking-wider">Lightning Network</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            {t.description}
          </p>

          {/* Stats con iconos animados */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {IMPACT_STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-center group"
                >
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-orange-400 font-mono mb-1 flex items-center gap-2 justify-center"
                    animate={{ 
                      textShadow: ['0 0 0px rgba(247,147,26,0)', '0 0 10px rgba(247,147,26,0.5)', '0 0 0px rgba(247,147,26,0)']
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx }}
                  >
                    {stat.value}
                    <Icon className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider">
                    {t[stat.label as keyof typeof t] as string}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            className="inline-flex items-center gap-2 text-slate-500 text-sm"
            animate={{ 
              x: [0, 5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Globe className="w-4 h-4" />
            {t.nextTarget}
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* QR Code Section con efectos de luz */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center pt-8 md:pt-0"
          >
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Efecto de luz ambiental */}
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                {/* Amount Badge con animación */}
                {mode === 'invoice' && selectedAmount ? (
                  <motion.div 
                    className="text-center mb-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 rounded-2xl px-8 py-4">
                      <motion.span 
                        className="text-4xl font-bold text-white font-mono"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {selectedAmount.toLocaleString()}
                      </motion.span>
                      <div className="text-left">
                        <span className="text-orange-400 text-xl block">sats</span>
                        <span className="text-xs text-orange-400/70 uppercase tracking-wider">
                          {lang === 'es' ? 'Factura Activa' : 'Invoice Active'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-orange-500/30 rounded-2xl px-6 py-3">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 font-mono text-sm uppercase tracking-wider">
                        {lang === 'es' ? 'Dirección Permanente' : 'Permanent Address'}
                      </span>
                    </div>
                  </div>
                )}

                {/* QR Code con efecto de brillo */}
                <motion.div 
                  className="bg-white p-4 rounded-2xl mb-6 relative"
                  animate={{ 
                    boxShadow: mode === 'invoice' 
                      ? ['0 0 20px rgba(247,147,26,0.3)', '0 0 40px rgba(247,147,26,0.6)', '0 0 20px rgba(247,147,26,0.3)']
                      : 'none'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <QRCodeSVG
                    key={mode + (paymentRequest || 'address')}
                    value={getQRValue()}
                    size={256}
                    level="H"
                    includeMargin={false}
                  />
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="bg-white p-1 rounded-full shadow-md">
                      <BitcoinLogoSVG />
                    </div>
                  </motion.div>

                  {/* Efecto de escaneo */}
                  {mode === 'invoice' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>

                {/* Timer con animación de urgencia */}
                {mode === 'invoice' && timeLeft !== null && timeLeft > 0 && (
                  <motion.div 
                    className="flex items-center justify-center gap-2 text-orange-400 mb-4"
                    animate={timeLeft < 60 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeLeft < 60 ? Infinity : 0 }}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-mono text-sm">
                      {lang === 'es' ? 'Expira en' : 'Expires in'} {formatTime(timeLeft)}
                    </span>
                  </motion.div>
                )}

                {/* Back Button */}
                {mode === 'invoice' && (
                  <motion.button
                    onClick={resetToAddress}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm py-2 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    {lang === 'es' ? 'Elegir otra cantidad' : 'Choose different amount'}
                  </motion.button>
                )}

                <motion.p 
                  className="text-center mt-4 text-slate-500 text-xs font-mono uppercase tracking-[2px]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {mode === 'invoice' ? t.scan : t.copy}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Controls Section con efectos interactivos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto md:mx-0 space-y-6"
          >
            {/* Preset Amounts con efectos hover mejorados */}
            <div className="grid grid-cols-2 gap-4">
              {PRESET_AMOUNTS.map((amount) => (
                <motion.button
                  key={amount}
                  onClick={() => handleAmountSelect(amount)}
                  disabled={!canGenerateInvoice}
                  onHoverStart={() => setHoveredAmount(amount)}
                  onHoverEnd={() => setHoveredAmount(null)}
                  className={`
                    relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-300
                    ${selectedAmount === amount && mode === 'invoice'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-slate-900/50 border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/50 text-slate-300'
                    }
                    ${!canGenerateInvoice ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  whileHover={canGenerateInvoice ? { scale: 1.05, y: -2 } : {}}
                  whileTap={canGenerateInvoice ? { scale: 0.95 } : {}}
                >
                  {/* Efecto de luz hover */}
                  {hoveredAmount === amount && canGenerateInvoice && (
                    <motion.div
                      layoutId="hoverGlow"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="text-2xl font-bold font-mono mb-1"
                      animate={selectedAmount === amount && mode === 'invoice' ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {formatSats(amount)}
                    </motion.div>
                    <div className="text-xs opacity-70 uppercase tracking-wider">
                      sats
                    </div>
                  </div>
                  
                  {selectedAmount === amount && mode === 'invoice' && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-orange-500/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Custom Amount con validación mejorada */}
            <motion.form 
              onSubmit={handleCustomSubmit} 
              className="flex gap-3"
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex-1">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={t.customAmount}
                  disabled={!canGenerateInvoice}
                  min="1"
                  max="10000000"
                  step="1"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 font-mono"
                />
                <motion.span 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                  animate={customAmount ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  sats
                </motion.span>
              </div>
              <motion.button
                type="submit"
                disabled={!customAmount || parseInt(customAmount) <= 0 || parseInt(customAmount) > 10000000 || !canGenerateInvoice}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                whileHover={canGenerateInvoice ? { scale: 1.05 } : {}}
                whileTap={canGenerateInvoice ? { scale: 0.95 } : {}}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
              </motion.button>
            </motion.form>

            {/* Direct Address con copia animada */}
            <div className="pt-6 border-t border-slate-800">
              <p className="text-slate-500 text-sm mb-4 text-center">
                {lang === 'es' ? 'O envía directo a' : 'Or send directly to'}
              </p>
              <motion.div 
                className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4"
                whileHover={{ borderColor: 'rgba(247,147,26,0.5)' }}
              >
                <code className="text-orange-400 font-mono text-sm md:text-base">{lightningAddress}</code>
                <motion.button
                  onClick={copyAddress}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                  )}
                  
                  {/* Tooltip en hover */}
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded whitespace-nowrap"
                  >
                    {t.copy}
                  </motion.span>
                </motion.button>
              </motion.div>
            </div>

            <motion.div 
              className="flex items-center justify-center gap-2 text-slate-600 text-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-3 h-3" />
              {t.powered}
            </motion.div>
          </motion.div>
        </div>

        {/* Success Message mejorado */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-4"
                animate={{ 
                  boxShadow: ['0 20px 40px rgba(247,147,26,0.3)', '0 30px 60px rgba(247,147,26,0.5)', '0 20px 40px rgba(247,147,26,0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div 
                  className="bg-white/20 p-3 rounded-full"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-8 h-8 fill-current" />
                </motion.div>
                <div>
                  <div className="text-2xl font-bold">{t.success}</div>
                  <div className="text-orange-100">{t.thankYou}</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl z-50"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -20,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  rotate: 0
                }}
                animate={{
                  opacity: 0,
                  y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  x: `+=${(Math.random() - 0.5) * 200}`
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut"
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#f97316', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 3)]
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}