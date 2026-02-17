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
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <NetworkNodes />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <span className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-sm font-mono tracking-wider uppercase">
            {dict.infrastructure.title}
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 font-mono leading-tight">
            <span className="text-orange-500">{dict.title}</span>
            <br />
            <span className="text-slate-300 text-3xl md:text-5xl">
              {dict.subtitle}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {lang === 'en'
              ? 'A decentralized infrastructure for transferring value across the internet. Open, permissionless, and always running—like email, but for money.'
              : 'Una infraestructura descentralizada para transferir valor a través de internet. Abierta, sin permisos y siempre funcionando—como el email, pero para dinero.'}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10"
        >
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Server className="w-4 h-4 text-orange-500" />
              <span className="text-2xl md:text-3xl font-bold text-orange-500 font-mono">15K+</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">
              {dict.stats.nodes}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-2xl md:text-3xl font-bold text-green-500 font-mono">99.98%</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">
              {dict.stats.uptime}
            </div>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-2xl md:text-3xl font-bold text-blue-500 font-mono">180+</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">
              {dict.stats.countries}
            </div>
          </div>
        </motion.div>

        {/* Target */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mb-10 text-sm text-slate-400"
        >
          <Globe className="w-4 h-4" />
          <span>{lang === 'en' ? 'Next target: Bitcoin Beach' : 'Próximo objetivo: Bitcoin Beach'}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-orange-400">bitcoinbeach.com</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <button
            onClick={scrollToChat}
            className="group px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-lg rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <span>{dict.cta}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <button
            onClick={scrollToMarkets}
            className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-sm rounded-lg border border-slate-700 transition-colors"
          >
            {dict.secondaryCta || (lang === 'en' ? 'View Market Data →' : 'Ver Datos de Mercado →')}
          </button>
        </motion.div>

        {/* Protocol Layers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <ProtocolLayers lang={lang} />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-orange-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}