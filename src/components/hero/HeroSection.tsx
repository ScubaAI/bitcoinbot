'use client';

import { motion } from 'framer-motion';
import { Locale } from '@/types';
import { BitcoinFlow } from './BitcoinFlow';

interface HeroSectionProps {
  lang: Locale;
  dict: {
    title: string;
    subtitle: string;
    cta: string;
    terminal: {
      title: string;
      hint: string;
    };
  };
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  const scrollToChat = () => {
    const chatElement = document.getElementById('chat-section');
    chatElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-bitcoin-black to-bitcoin-dark">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #f7931a 1px, transparent 1px),
            linear-gradient(to bottom, #f7931a 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Bitcoin Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-bitcoin-orange/20 border-2 border-bitcoin-orange">
            <span className="text-4xl font-bold text-bitcoin-orange">₿</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 font-mono"
        >
          {dict.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
        >
          {dict.subtitle}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={scrollToChat}
          className="px-8 py-4 bg-bitcoin-orange text-bitcoin-black font-bold text-lg rounded-lg hover:bg-bitcoin-orange/90 transition-colors shadow-lg shadow-bitcoin-orange/25"
        >
          {dict.cta}
        </motion.button>

        {/* Bitcoin Flow Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16"
        >
          <BitcoinFlow />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-bitcoin-orange/50 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-bitcoin-orange rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
