'use client';

import { motion } from 'framer-motion';
import { Locale } from '@/types';
import { NetworkNodes } from './NetworkNodes';
import { ProtocolLayers } from '../protocol-layers/ProtocolLayers';
import { ArrowRight, Globe, Activity, Server } from 'lucide-react';

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
  const scrollToChat = () => {
    document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMarkets = () => {
    document.getElementById('markets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper para mostrar el nombre según el idioma
  const getLayerName = (layerKey: 'layer1' | 'layer2' | 'layer3') => {
    return dict.infrastructure[layerKey].name;
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Background mejorado con spotlight */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
            backgroundSize: '68px 68px'
          }}
        />
        {/* Spotlight central naranja */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.14)_0%,transparent_65%)]" />
        
        <NetworkNodes />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-8 py-24">
        
        {/* Badge premium con pulse neon */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="group relative px-8 py-3 bg-slate-900/70 backdrop-blur-2xl border border-orange-500/40 rounded-2xl text-orange-400 text-sm font-mono tracking-[4px] uppercase flex items-center gap-3 shadow-2xl shadow-orange-500/10 hover:border-orange-500/60 hover:scale-105 transition-all duration-300">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/30 group-hover:ring-orange-500/70 transition-all" />
            {dict.infrastructure.title}
          </div>
        </motion.div>

        {/* Title ultra impactante */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl lg:text-[5.2rem] font-bold leading-[1.05] tracking-tighter mb-6">
            <span className="bg-gradient-to-br from-orange-300 via-amber-300 to-white bg-clip-text text-transparent">
              {dict.title}
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-slate-300 font-light tracking-tight mb-4">
            {dict.subtitle}
          </p>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {lang === 'en'
              ? 'A decentralized infrastructure for transferring value across the internet. Open, permissionless, and always running—like email, but for money.'
              : 'Una infraestructura descentralizada para transferir valor a través de internet. Abierta, sin permisos y siempre funcionando—como el email, pero para dinero.'}
          </p>
        </motion.div>

        {/* Stats glassmorphic premium */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-14"
        >
          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-700/80 hover:border-orange-500/40 rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Server className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-4xl font-bold text-orange-400 font-mono tracking-tighter">15K+</span>
            </div>
            <div className="text-xs uppercase tracking-[2px] text-slate-500 font-mono">
              {dict.stats.nodes}
            </div>
          </div>

          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-700/80 hover:border-green-500/40 rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-4xl font-bold text-green-400 font-mono tracking-tighter">99.98%</span>
            </div>
            <div className="text-xs uppercase tracking-[2px] text-slate-500 font-mono">
              {dict.stats.uptime}
            </div>
          </div>

          <div className="group bg-slate-900/60 backdrop-blur-xl border border-slate-700/80 hover:border-blue-500/40 rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-4xl font-bold text-blue-400 font-mono tracking-tighter">180+</span>
            </div>
            <div className="text-xs uppercase tracking-[2px] text-slate-500 font-mono">
              {dict.stats.countries}
            </div>
          </div>
        </motion.div>

        {/* Target mejorado */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mb-16 text-sm font-mono"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4" />
            <span>Live on</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <ArrowRight className="w-4 h-4" />
            <span className="text-lg tracking-wider">bitcoinbeach.com</span>
          </div>
        </motion.div>

        {/* CTAs de lujo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20"
        >
          <button
            onClick={scrollToChat}
            className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xl rounded-2xl transition-all flex items-center gap-3 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-[1.03] overflow-hidden"
          >
            <span>{dict.cta}</span>
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          </button>
          
          <button
            onClick={scrollToMarkets}
            className="px-8 py-5 bg-slate-900/70 backdrop-blur-xl border border-slate-600 hover:border-slate-400 text-slate-300 font-mono rounded-2xl transition-all hover:bg-slate-800 hover:text-white"
          >
            {dict.secondaryCta || (lang === 'en' ? 'View Market Data →' : 'Ver Datos de Mercado →')}
          </button>
        </motion.div>

        {/* Protocol Layers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-6 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <ProtocolLayers lang={lang} />
        </motion.div>
      </div>

      {/* Scroll indicator más elegante */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border border-slate-600/80 rounded-full flex justify-center pt-2 backdrop-blur-sm">
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1 h-1 bg-orange-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}