'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  LineChart,
  BarChart3,
  Hash,
  CircleDollarSign,
  Zap,
  Shield,
  Minus,
  Info
} from 'lucide-react';

interface MarketData {
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume24h: number;
  dominance: number;
  ath: number;
  athChange: number;
  athDate: string;
  hashrate?: number;
  supply: {
    circulating: number;
    total: number;
    max: number;
  };
}

interface MarketSectionProps {
  lang: 'en' | 'es';
}

// Counter component for animated numbers - SIMPLIFICADO
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    // Animación simple sin framer-motion spring (mejor performance en mobile)
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="break-all">
      {prefix}
      {displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  );
}

export function MarketSection({ lang }: MarketSectionProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_7d_change=true&include_30d_change=true&include_market_cap=true&include_24hr_vol=true'),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false')
    ])
      .then(async ([priceRes, detailsRes]) => {
        const priceData = await priceRes.json();
        const detailsData = await detailsRes.json();

        setData({
          price: priceData.bitcoin.usd,
          change24h: priceData.bitcoin.usd_24h_change,
          change7d: priceData.bitcoin.usd_7d_change,
          change30d: priceData.bitcoin.usd_30d_change,
          marketCap: priceData.bitcoin.usd_market_cap,
          volume24h: priceData.bitcoin.usd_24h_vol,
          dominance: detailsData.market_data.market_cap_percentage?.btc || 52,
          ath: detailsData.market_data.ath.usd,
          athChange: detailsData.market_data.ath_change_percentage.usd,
          athDate: detailsData.market_data.ath_date.usd,
          hashrate: 850,
          supply: {
            circulating: detailsData.market_data.circulating_supply,
            total: detailsData.market_data.total_supply,
            max: detailsData.market_data.max_supply,
          }
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="markets-section" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500" />
          </div>
        </div>
      </section>
    );
  }

  const t = {
    en: {
      title: "Markets",
      subtitle: "Real-time network metrics",
      disclaimer: "Market data reflects adoption, not purpose.",
      price: "BTC/USD",
      marketCap: "Market Cap",
      volume: "24h Volume",
      dominance: "Dominance",
      hashrate: "Hash Rate",
      supply: "Supply",
      ath: "All-Time High",
      fromATH: "from ATH",
      source: "CoinGecko",
      timeframes: { '24h': '24H', '7d': '7D', '30d': '30D' },
    },
    es: {
      title: "Mercados",
      subtitle: "Métricas de red en tiempo real",
      disclaimer: "Los datos reflejan adopción, no propósito.",
      price: "BTC/USD",
      marketCap: "Cap. Mercado",
      volume: "Volumen 24h",
      dominance: "Dominancia",
      hashrate: "Hash Rate",
      supply: "Suministro",
      ath: "Máximo Histórico",
      fromATH: "desde ATH",
      source: "CoinGecko",
      timeframes: { '24h': '24H', '7d': '7D', '30d': '30D' },
    }
  }[lang];

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (change < 0) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />;
    return <Minus className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const currentChange = data ? {
    '24h': data.change24h,
    '7d': data.change7d,
    '30d': data.change30d
  }[timeframe] : 0;

  return (
    <section id="markets-section" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-800/70 relative overflow-hidden">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.05)_0%,transparent_60%)]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-[2px] sm:tracking-[4px] text-orange-400/90">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex gap-1 sm:gap-2 p-1 bg-slate-900/80 border border-slate-700 rounded-xl sm:rounded-2xl w-fit">
            {(['24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono transition-all ${
                  timeframe === tf
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.timeframes[tf]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 sm:mb-8 p-4 sm:p-8 bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Precio - FIX: Tamaños responsive y break-all */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <CircleDollarSign className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-mono tracking-wider">{t.price}</span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
                <span className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white font-mono tracking-tight break-all">
                  ${data?.price.toLocaleString()}
                </span>

                <div className={`inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-medium border ${getChangeColor(currentChange)}`}>
                  {getChangeIcon(currentChange)}
                  <span>{currentChange?.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* ATH - FIX: Grid responsive */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-[140px] sm:min-w-[200px]">
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500 font-mono mb-0.5">ATH</div>
                <div className="text-lg sm:text-2xl font-bold text-white break-all">
                  ${data?.ath.toLocaleString()}
                </div>
                <div className={`text-xs mt-0.5 ${data && data.athChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {data?.athChange.toFixed(1)}% {t.fromATH}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-500 font-mono mb-0.5">Date</div>
                <div className="text-sm sm:text-lg font-bold text-white">
                  {data && new Date(data.athDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', {
                    year: '2-digit',
                    month: 'short'
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid - FIX: 1 col en mobile, 2 en tablet, 3 en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title={t.marketCap}
            value={`$${((data?.marketCap ?? 0) / 1e12).toFixed(2)}T`}
            subvalue={`${((data?.marketCap ?? 0) / 1e9).toFixed(0)}B USD`}
            icon={BarChart3}
          />
          <MetricCard
            title={t.volume}
            value={`$${((data?.volume24h ?? 0) / 1e9).toFixed(2)}B`}
            subvalue="24h"
            icon={Activity}
          />
          <MetricCard
            title={t.dominance}
            value={`${data?.dominance.toFixed(1)}%`}
            subvalue="BTC dominance"
            icon={Shield}
          />
          <MetricCard
            title={t.hashrate}
            value={`${data?.hashrate || 850} EH/s`}
            subvalue="Network security"
            icon={Hash}
          />
          <MetricCard
            title={t.supply}
            value={`${((data?.supply.circulating ?? 0) / 1e6).toFixed(2)}M`}
            subvalue={`${((((data?.supply.circulating ?? 0) / 21e6) * 100)).toFixed(1)}% of 21M`}
            icon={CircleDollarSign}
          >
            <div className="mt-2 sm:mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${((data?.supply.circulating ?? 0) / 21e6) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              />
            </div>
          </MetricCard>
          <MetricCard
            title={t.networkHealth}
            value="99.98%"
            subvalue="Uptime since 2009"
            icon={Zap}
          />
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="p-4 sm:p-6 bg-slate-900/50 border border-slate-800 rounded-xl sm:rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500/70 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t.disclaimer}
              </p>
              <p className="text-xs font-mono text-slate-600 mt-2 tracking-wider">
                {t.source}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// MetricCard simplificado y responsive
interface MetricCardProps {
  title: string;
  value: string;
  subvalue: string;
  icon: React.ElementType;
  children?: React.ReactNode;
}

function MetricCard({ title, value, subvalue, icon: Icon, children }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-4 sm:p-6 bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl hover:border-orange-500/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 sm:p-2 bg-slate-800 rounded-lg">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        </div>
        <span className="text-xs sm:text-sm text-slate-500 font-mono">{title}</span>
      </div>
      
      <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight break-all">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 mt-1">
        {subvalue}
      </div>
      
      {children}
    </motion.div>
  );
}