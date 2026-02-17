'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Bitcoin } from 'lucide-react';

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
    <section id="markets-section" className="py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8 text-slate-500">
          <Activity className="w-5 h-5" />
          <span className="font-mono text-sm uppercase tracking-wider">{t.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800"
          >
            <div className="text-sm text-slate-500 mb-2">{t.price}</div>
            <div className="text-3xl font-bold text-white font-mono">
              ${data?.price.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${data && data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data && data.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {data?.change24h.toFixed(2)}%
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800"
          >
            <div className="text-sm text-slate-500 mb-2">{t.marketCap}</div>
            <div className="text-3xl font-bold text-white font-mono">
              ${data && (data.marketCap / 1e12).toFixed(2)}T
            </div>
            <div className="text-xs text-slate-600 mt-2">Global network value</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800"
          >
            <div className="text-sm text-slate-500 mb-2">{t.hashRate}</div>
            <div className="text-3xl font-bold text-orange-500 font-mono">500+</div>
            <div className="text-xs text-slate-600 mt-2">EH/s (Exahashes/second)</div>
          </motion.div>
        </div>

        <p className="mt-6 text-sm text-slate-600 text-center max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        <p className="mt-2 text-xs text-slate-700 text-center">{t.source}</p>
      </div>
    </section>
  );
}
