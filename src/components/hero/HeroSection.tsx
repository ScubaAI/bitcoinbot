'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Locale } from '@/types';
import { NetworkNodes } from './NetworkNodes';
import { ProtocolLayers } from '../protocol-layers/ProtocolLayers';
import { HiddenMenu } from '../navigation/HiddenMenu';
import {
  ArrowRight,
  Globe,
  Activity,
  Server,
  Bitcoin,
  Zap,
  Cpu,
  Terminal,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  lang: Locale;
  dict: {
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta?: string;
    stats: {
      nodes: string;
      uptime: string;
      countries: string;
    };
    infrastructure: {
      title: string;
      layer1: { name: string; desc: string };
      layer2: { name: string; desc: string };
      layer3: { name: string; desc: string };
    };
  };
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToChat = () => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMarkets = () => {
    document.getElementById('markets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Terminal typing effect
  const [displayText, setDisplayText] = useState('');
  const fullText = lang === 'en'
    ? 'root@bitcoin:~# ./global-settlement-layer'
    : 'root@bitcoin:~# ./capa-de-liquidación-global';

  useEffect(() => {
    if (!mounted) return;

    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 50);

    return () => clearInterval(typing);
  }, [fullText, mounted]);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950">
      <HiddenMenu lang={lang as 'en' | 'es'} />
      {/* Background mejorado con spotlight y grid animado */}
      <div className="absolute inset-0">
        {/* Grid más sutil y elegante */}
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '68px 68px'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
            backgroundSize: '68px 68px'
          }}
        />

        {/* Múltiples spotlights con naranja Bitcoin más cálido */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(249,115,22,0.18)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.12)_0%,transparent_75%)]" />

        <NetworkNodes />

        {/* Gradientes más suaves y profundos */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/70 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

        {/* Línea de horizonte brillante en naranja */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />
      </div>

      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-8 py-32"
      >

        {/* Terminal Header - más elegante y ligero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <div className="group relative px-8 py-3.5 bg-slate-900/80 backdrop-blur-3xl border border-slate-700/50 rounded-3xl font-mono text-sm flex items-center gap-5 shadow-2xl shadow-black/80">
            {/* Terminal dots */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>

            {/* Typing effect */}
            <code className="text-slate-400">
              <span className="text-green-400">bitcoin@agent</span>:<span className="text-blue-400">~</span>$
              <span className="ml-3 text-[#f7931a]">{displayText}</span>
              <span className="animate-pulse ml-1">▊</span>
            </code>

            {/* Network status */}
            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-500">mainnet</span>
            </div>
          </div>
        </motion.div>

        {/* Title ultra impactante con más espacio */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-7xl lg:text-[6.2rem] font-bold leading-[1.02] tracking-[-3px] mb-8">
            <span className="bg-gradient-to-br from-[#f7931a] via-amber-300 to-white bg-clip-text text-transparent">
              {dict.title}
            </span>
          </h1>

          <p className="text-3xl md:text-4xl text-slate-200 font-light tracking-tight mb-6">
            {dict.subtitle}
          </p>

          {/* Descripción con glow naranja más sutil */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed"
          >
            <span className="relative inline-block">
              {lang === 'en'
                ? 'A decentralized infrastructure for transferring value across the internet. Open, permissionless, and always running—like email, but for money.'
                : 'Una infraestructura descentralizada para transferir valor a través de internet. Abierta, sin permisos y siempre funcionando—como el email, pero para dinero.'}
              <span className="absolute -inset-2 bg-[#f7931a]/5 blur-2xl rounded-3xl" />
            </span>
          </motion.p>
        </motion.div>

        {/* Stats glassmorphic premium con más espacio */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20"
        >
          {[
            { icon: Server, value: '15K+', label: dict.stats.nodes, color: 'orange', metric: 'verified nodes' },
            { icon: Activity, value: '99.98%', label: dict.stats.uptime, color: 'green', metric: 'uptime since 2009' },
            { icon: Globe, value: '180+', label: dict.stats.countries, color: 'blue', metric: 'countries reached' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const colorClasses = {
              orange: 'hover:border-[#f7931a]/50 hover:shadow-[#f7931a]/30 text-[#f7931a]',
              green: 'hover:border-green-500/40 hover:shadow-green-500/20 text-green-400',
              blue: 'hover:border-blue-500/40 hover:shadow-blue-500/20 text-blue-400',
            }[stat.color];

            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className={`group bg-slate-900/70 backdrop-blur-2xl border border-slate-700/70 hover:border-[#f7931a]/30 rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-2xl shadow-black/80 relative overflow-hidden`}
              >
                <div className="absolute top-4 right-4 text-[0.65rem] font-mono text-slate-600">
                  {stat.metric}
                </div>

                <div className={`flex items-center justify-center gap-4 mb-4`}>
                  <Icon className={`w-6 h-6 text-[#f7931a] group-hover:scale-110 transition-transform`} />
                  <span className={`text-5xl font-bold ${colorClasses} font-mono tracking-tighter`}>
                    {stat.value}
                  </span>
                </div>
                <div className="text-xs uppercase tracking-[2.5px] text-slate-500 font-mono">
                  {stat.label}
                </div>

                <div className="absolute inset-0 bg-[#f7931a]/0 group-hover:bg-[#f7931a]/5 transition-colors duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Live Network Status - más limpio y elegante */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-24"
        >
          <div className="flex items-center gap-4 px-8 py-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-mono text-slate-400">Network Status:</span>
            </div>
            <span className="text-sm font-mono text-green-400 font-medium">Healthy</span>
            <span className="text-xs text-slate-600">(block 867,530)</span>
          </div>

          <div className="flex items-center gap-4 px-8 py-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50">
            <Zap className="w-5 h-5 text-[#f7931a]" />
            <span className="text-sm font-mono text-slate-400">Hashrate:</span>
            <span className="text-sm font-mono text-[#f7931a]">850 EH/s</span>
          </div>

          <div className="flex items-center gap-4 px-8 py-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-700/50">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-mono text-slate-400">Mempool:</span>
            <span className="text-sm font-mono text-blue-400">~45k txs</span>
          </div>
        </motion.div>

        {/* CTAs de lujo con más espacio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToChat}
            className="group relative px-14 py-7 bg-gradient-to-r from-[#f7931a] to-amber-500 hover:from-[#f7931a]/90 hover:to-amber-400 text-black font-bold text-2xl rounded-3xl transition-all flex items-center gap-4 shadow-2xl shadow-[#f7931a]/60 hover:shadow-[#f7931a]/80 overflow-hidden"
          >
            <span>{dict.cta}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-[220%] transition-transform duration-1000" />
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToMarkets}
            className="group px-10 py-7 bg-slate-900/70 backdrop-blur-2xl border border-slate-600 hover:border-slate-400 text-slate-300 font-mono text-xl rounded-3xl transition-all hover:bg-slate-800 hover:text-white flex items-center gap-3"
          >
            <Terminal className="w-5 h-5" />
            <span>{dict.secondaryCta || (lang === 'en' ? './view-market-data' : './ver-datos-mercado')}</span>
          </motion.button>
        </motion.div>

        {/* Protocol Layers con nuevo wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <ProtocolLayers lang={lang} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator más elegante */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-xs font-mono text-slate-600 tracking-widest uppercase">Scroll to discover</span>
          <div className="w-6 h-10 border border-slate-600/60 rounded-full flex justify-center pt-2.5 backdrop-blur-sm">
            <div className="w-1 h-2.5 bg-[#f7931a] rounded-full" />
          </div>
          <ChevronDown className="w-5 h-5 text-slate-600 animate-bounce" />
        </motion.div>
      </motion.div>

      {/* Badge flotante de versión */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2 }}
        className="absolute bottom-16 right-12 z-20 hidden lg:block"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-700/60 text-xs font-mono shadow-xl">
          <Bitcoin className="w-4 h-4 text-[#f7931a]" />
          <span className="text-slate-400">v2.0.1</span>
          <span className="text-slate-600">|</span>
          <span className="text-green-500">mainnet</span>
        </div>
      </motion.div>
    </section>
  );
}