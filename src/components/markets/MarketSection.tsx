'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketData {
  price: number;
  change24h: number;
  marketCap: number;
  hashRate?: number;
}

interface MarketSectionProps {
  lang: 'en' | 'es';
}

export function MarketSection({ lang }: MarketSectionProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true')
      .then(res => res.json())
      .then(data => {
        setData({
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change,
          marketCap: data.bitcoin.usd_market_cap,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  const t = {
    en: {
      title: "Network Metrics",
      subtitle: "Market data is secondary to network utility. Prices reflect adoption, not purpose.",
      price: "BTC/USD",
      marketCap: "Market Cap",
      hashRate: "Hash Rate",
      source: "Data from CoinGecko"
    },
    es: {
      title: "Métricas de Red",
      subtitle: "Los datos de mercado son secundarios a la utilidad de la red. Los precios reflejan adopción, no propósito.",
      price: "BTC/USD",
      marketCap: "Capitalización",
      hashRate: "Hash Rate",
      source: "Datos de CoinGecko"
    }
  }[lang];

  return (
    <section id="markets-section" className="py-20 bg-slate-950 border-t border-slate-800/70 relative overflow-hidden">
      {/* Glow layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} 
      />

      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Activity className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-mono text-xl uppercase tracking-[4px] text-orange-400/90">{t.title}</span>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="group relative p-8 bg-slate-900/60 backdrop-blur-3xl border border-slate-700/60 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 shadow-2xl"
          >
            <div className="text-sm font-mono tracking-widest text-slate-500 mb-3">{t.price}</div>
            
            <div className="text-6xl md:text-7xl font-bold text-white font-mono tracking-[-2px] mb-4">
              ${data?.price.toLocaleString()}
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-sm font-medium transition-all ${
              data && data.change24h >= 0 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {data && data.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {data?.change24h.toFixed(2)}% 24h
            </div>

            {/* Subtle shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.div>

          {/* Market Cap Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative p-8 bg-slate-900/60 backdrop-blur-3xl border border-slate-700/60 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 shadow-2xl"
          >
            <div className="text-sm font-mono tracking-widest text-slate-500 mb-3">{t.marketCap}</div>
            
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-br from-white to-orange-400 bg-clip-text text-transparent font-mono tracking-[-2px]">
              ${((data?.marketCap) ?? 0 / 1e12).toFixed(2)}T
            </div>

            <div className="text-sm text-slate-400 mt-6">Valor total de la red global</div>
          </motion.div>

          {/* Hash Rate Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative p-8 bg-slate-900/60 backdrop-blur-3xl border border-slate-700/60 rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 shadow-2xl"
          >
            <div className="text-sm font-mono tracking-widest text-slate-500 mb-3">{t.hashRate}</div>
            
            <div className="text-6xl md:text-7xl font-bold text-orange-500 font-mono tracking-[-2px]">500+</div>
            <div className="text-sm text-slate-400 mt-6">EH/s (Exahashes por segundo)</div>
          </motion.div>
        </div>

        {/* Subtitle */}
        <p className="mt-12 text-lg text-slate-400 max-w-2xl mx-auto text-center leading-relaxed">
          {t.subtitle}
        </p>
        <p className="mt-3 text-xs font-mono text-slate-600 text-center tracking-widest">
          {t.source}
        </p>
      </div>
    </section>
  );
}