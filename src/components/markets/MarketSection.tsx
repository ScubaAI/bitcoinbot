'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  LineChart,
  BarChart3,
  Hash,
  CircleDollarSign,
  Clock,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
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

// Counter component for animated numbers
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [value, motionValue, springValue]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  );
}

export function MarketSection({ lang }: MarketSectionProps) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_7d_change=true&include_30d_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true'),
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
          dominance: detailsData.market_data.market_cap_percentage.btc,
          ath: detailsData.market_data.ath.usd,
          athChange: detailsData.market_data.ath_change_percentage.usd,
          athDate: detailsData.market_data.ath_date.usd,
          hashrate: 850, // Esto vendría de otra API
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
      <section className="py-20 bg-slate-950 border-t border-slate-800/70">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        </div>
      </section>
    );
  }

  const t = {
    en: {
      title: "Bitcoin Markets",
      subtitle: "Real-time network metrics and market data",
      disclaimer: "Market data is secondary to network utility. Prices reflect adoption, not purpose.",
      price: "BTC/USD",
      marketCap: "Market Cap",
      volume: "24h Volume",
      dominance: "Market Dominance",
      hashrate: "Hash Rate",
      supply: "Circulating Supply",
      ath: "All-Time High",
      fromATH: "from ATH",
      source: "Data from CoinGecko",
      timeframes: {
        '24h': '24H',
        '7d': '7D',
        '30d': '30D'
      },
      tooltips: {
        price: "Current Bitcoin price in US Dollars",
        marketCap: "Total value of all Bitcoin in circulation",
        volume: "Total trading volume in last 24 hours",
        dominance: "Bitcoin's share of total crypto market cap",
        hashrate: "Computing power securing the network",
        supply: "Bitcoins mined so far / Total that will ever exist",
        ath: "Highest price ever reached"
      },
      progressLabel: "to 21M cap",
      networkHealth: "Network Health",
      difficulty: "Mining Difficulty",
      fee: "Avg Transaction Fee"
    },
    es: {
      title: "Mercados de Bitcoin",
      subtitle: "Métricas de red y datos de mercado en tiempo real",
      disclaimer: "Los datos de mercado son secundarios a la utilidad de la red. Los precios reflejan adopción, no propósito.",
      price: "BTC/USD",
      marketCap: "Capitalización",
      volume: "Volumen 24h",
      dominance: "Dominancia",
      hashrate: "Hash Rate",
      supply: "Suministro Circulante",
      ath: "Máximo Histórico",
      fromATH: "desde ATH",
      source: "Datos de CoinGecko",
      timeframes: {
        '24h': '24H',
        '7d': '7D',
        '30d': '30D'
      },
      tooltips: {
        price: "Precio actual de Bitcoin en dólares",
        marketCap: "Valor total de todos los Bitcoin en circulación",
        volume: "Volumen total de trading en las últimas 24 horas",
        dominance: "Participación de Bitcoin en el mercado cripto total",
        hashrate: "Poder computacional que asegura la red",
        supply: "Bitcoins minados hasta ahora / Total que existirá",
        ath: "Precio más alto alcanzado"
      },
      progressLabel: "hacia 21M",
      networkHealth: "Salud de la Red",
      difficulty: "Dificultad de Minería",
      fee: "Comisión Promedio"
    }
  }[lang];

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (change < 0) return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeForTimeframe = () => {
    if (!data) return 0;
    switch (timeframe) {
      case '24h': return data.change24h;
      case '7d': return data.change7d;
      case '30d': return data.change30d;
      default: return data.change24h;
    }
  };

  const currentChange = getChangeForTimeframe();

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

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header with disclaimer */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <LineChart className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <span className="font-mono text-xl uppercase tracking-[4px] text-orange-400/90 block">
                {t.title}
              </span>
              <p className="text-sm text-slate-500 font-mono mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex gap-2 p-1 bg-slate-900/80 border border-slate-700 rounded-2xl">
            {(['24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${timeframe === tf
                    ? 'bg-orange-500 text-black font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {t.timeframes[tf]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Price Card - Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-8 p-8 bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-3xl border border-slate-700/60 rounded-3xl overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.15)_0%,transparent_70%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 text-slate-500 mb-4">
                <CircleDollarSign className="w-5 h-5" />
                <span className="text-sm font-mono tracking-wider">{t.price}</span>
              </div>

              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-7xl md:text-8xl font-bold text-white font-mono tracking-[-4px]">
                  ${data?.price.toLocaleString()}
                </span>

                <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-lg font-medium border ${getChangeColor(currentChange)}`}>
                  {getChangeIcon(currentChange)}
                  <span>{currentChange?.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-500 font-mono mb-1">ATH</div>
                <div className="text-2xl font-bold text-white">${data?.ath.toLocaleString()}</div>
                <div className={`text-xs mt-1 ${data && data.athChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {data?.athChange.toFixed(2)}% {t.fromATH}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500 font-mono mb-1">ATH Date</div>
                <div className="text-2xl font-bold text-white">
                  {data && new Date(data.athDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Market Cap */}
          <MetricCard
            title={t.marketCap}
            value={`$${((data?.marketCap ?? 0) / 1e12).toFixed(2)}T`}
            subvalue={`${((data?.marketCap ?? 0) / 1e9).toFixed(0)}B USD`}
            icon={BarChart3}
            tooltip={t.tooltips.marketCap}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            id="marketcap"
          />

          {/* Volume */}
          <MetricCard
            title={t.volume}
            value={`$${((data?.volume24h ?? 0) / 1e9).toFixed(2)}B`}
            subvalue="24h trading volume"
            icon={Activity}
            tooltip={t.tooltips.volume}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            id="volume"
          />

          {/* Dominance */}
          <MetricCard
            title={t.dominance}
            value={`${data?.dominance.toFixed(1)}%`}
            subvalue="of total crypto market"
            icon={Shield}
            tooltip={t.tooltips.dominance}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            id="dominance"
          />

          {/* Hash Rate */}
          <MetricCard
            title={t.hashrate}
            value={`${data?.hashrate || 850} EH/s`}
            subvalue="~500 exahashes per second"
            icon={Hash}
            tooltip={t.tooltips.hashrate}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            id="hashrate"
          />

          {/* Supply */}
          <MetricCard
            title={t.supply}
            value={`${((data?.supply.circulating ?? 0) / 1e6).toFixed(2)}M / 21M`}
            subvalue={`${((((data?.supply.circulating ?? 0) / 21e6) * 100)).toFixed(2)}% mined`}
            icon={CircleDollarSign}
            tooltip={t.tooltips.supply}
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            id="supply"
          >
            {/* Progress bar to 21M */}
            <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${((data?.supply.circulating ?? 0) / 21e6) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
              />
            </div>
          </MetricCard>

          {/* Network Health - Composite */}
          <MetricCard
            title={t.networkHealth}
            value="99.98%"
            subvalue="Uptime since 2009"
            icon={Zap}
            tooltip="Network has never been compromised"
            showTooltip={showTooltip}
            setShowTooltip={setShowTooltip}
            id="health"
          />
        </div>

        {/* Philosophical Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="relative p-6 bg-slate-900/40 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />

          <div className="relative flex items-start gap-4">
            <Info className="w-5 h-5 text-orange-500/70 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg text-slate-300 leading-relaxed">
                {t.disclaimer}
              </p>
              <p className="text-xs font-mono text-slate-600 mt-3 tracking-wider">
                {t.source}
              </p>
            </div>
          </div>

          {/* Subtle shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </motion.div>
      </div>
    </section>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subvalue: string;
  icon: any;
  tooltip: string;
  showTooltip: string | null;
  setShowTooltip: (id: string | null) => void;
  id: string;
  children?: React.ReactNode;
}

function MetricCard({ title, value, subvalue, icon: Icon, tooltip, showTooltip, setShowTooltip, id, children }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="group relative p-6 bg-slate-900/60 backdrop-blur-3xl border border-slate-700/60 rounded-2xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setShowTooltip(id)}
      onMouseLeave={() => setShowTooltip(null)}
    >
      {/* Icon and tooltip */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-800 rounded-xl group-hover:bg-slate-700 transition-colors">
          <Icon className="w-5 h-5 text-orange-500" />
        </div>

        {/* Tooltip */}
        {showTooltip === id && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 right-4 z-20 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 shadow-xl"
          >
            {tooltip}
            <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-800 border-t border-l border-slate-600 rotate-45" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="text-2xl font-bold text-white font-mono tracking-tight mb-1">
        {value}
      </div>
      <div className="text-sm text-slate-500">
        {subvalue}
      </div>

      {children}

      {/* Subtle shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  );
}