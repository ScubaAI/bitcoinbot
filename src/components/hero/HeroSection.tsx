'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Locale } from '@/types';
import { NetworkNodes } from './NetworkNodes';
import { ProtocolLayers } from '../protocol-layers/ProtocolLayers';
import { HiddenMenu } from '../navigation/HiddenMenu';
import {
  ArrowRight,
  Terminal,
  Sparkles,
  ChevronDown,
  Bitcoin
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  lang: Locale;
  dict: {
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta?: string;
  };
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  // Efecto sutil de parallax, NO fade out
  const y = useTransform(scrollY, [0, 500], [0, 100]);

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
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-black">
      {/* HiddenMenu - acceso admin */}
      <HiddenMenu lang={lang as 'en' | 'es'} />

      {/* Background limpio sin fade effects */}
      <div className="absolute inset-0">
        {/* Grid sutil */}
        <motion.div
          animate={{
            backgroundPosition: ['0px 0px', '68px 68px'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
            backgroundSize: '68px 68px'
          }}
        />

        {/* Un solo spotlight centrado, sin fade agresivo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(247,147,26,0.15)_0%,transparent_70%)]" />

        <NetworkNodes />

        {/* Línea de horizonte sutil */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7931a]/30 to-transparent" />
      </div>

      <motion.div
        style={{ y }}
        className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 lg:px-8 py-32"
      >
        {/* Terminal Header - SIN backdrop-blur que causa fade */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-16"
        >
          <div className="group px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl font-mono text-sm flex items-center gap-4 shadow-xl">
            {/* Terminal dots */}
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            {/* Typing effect */}
            <code className="text-slate-400">
              <span className="text-green-400">bitcoin@agent</span>:<span className="text-blue-400">~</span>$
              <span className="ml-2 text-[#f7931a]">{displayText}</span>
              <span className="animate-pulse ml-1 text-[#f7931a]">▊</span>
            </code>
          </div>
        </motion.div>

        {/* Title - MÁS IMPACTO, menos elementos distractores */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold leading-[0.95] tracking-[-4px] mb-8">
            <span className="bg-gradient-to-br from-[#f7931a] via-amber-300 to-white bg-clip-text text-transparent">
              Bitcoin
            </span>
          </h1>

          <p className="text-3xl md:text-4xl text-white font-light tracking-tight mb-8">
            {dict.subtitle}
          </p>

          {/* Descripción limpia, SIN glow effect que causa fade */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {lang === 'en'
              ? 'A decentralized infrastructure for transferring value across the internet. Open, permissionless, and always running—like email, but for money.'
              : 'Una infraestructura descentralizada para transferir valor a través de internet. Abierta, sin permisos y siempre funcionando—como el email, pero para dinero.'}
          </motion.p>
        </motion.div>

        {/* CTAs - MÁS ESPACIO, sin stats de por medio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToChat}
            className="group px-10 py-5 bg-[#f7931a] hover:bg-[#f7931a]/90 text-black font-bold text-xl rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-[#f7931a]/20"
          >
            <span>{dict.cta}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToMarkets}
            className="group px-10 py-5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-mono text-lg rounded-2xl transition-all hover:bg-slate-800 hover:text-white flex items-center gap-3"
          >
            <Terminal className="w-5 h-5" />
            <span>{dict.secondaryCta || (lang === 'en' ? './view-market-data' : './ver-datos-mercado')}</span>
          </motion.button>
        </motion.div>

        {/* Protocol Layers - SIN gradiente overlay que causa fade */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ProtocolLayers lang={lang} />
        </motion.div>
      </motion.div>

      {/* Scroll indicator minimalista */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs font-mono text-slate-600 tracking-widest uppercase">
            {lang === 'en' ? 'Scroll' : 'Desplazar'}
          </span>
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </motion.div>
      </motion.div>

      {/* Badge de versión minimalista */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 right-8 z-20 hidden lg:block"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          <Bitcoin className="w-4 h-4 text-[#f7931a]" />
          <span className="text-slate-500">v2.0.1</span>
        </div>
      </motion.div>
    </section>
  );
}