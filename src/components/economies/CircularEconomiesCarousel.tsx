'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Shield,
  Coins,
  Zap,
  Globe,
  Percent,
  Award,
  Sparkles,
  Bitcoin,
  Heart,
  Users,
  TreePine
} from 'lucide-react';

type ItemType = 'economy' | 'sponsor';

interface BaseItem {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  website: string;
}

interface Economy extends BaseItem {
  type: 'economy';
  location: string;
  status: 'active' | 'coming' | 'planned';
  ecosystem: string;
}

interface Sponsor extends BaseItem {
  type: 'sponsor';
  category: 'CEX' | 'P2P' | 'Swap';
  commission: string;
  feature: string;
  audience: string;
  icon: React.ElementType;
}

type Item = Economy | Sponsor;

const items: Item[] = [
  // Economías circulares (misión)
  {
    id: 'bitcoin-beach',
    type: 'economy',
    name: 'Bitcoin Beach',
    location: 'El Zonte, El Salvador',
    description: 'La economía circular Bitcoin original. Donde todo comenzó.',
    website: 'https://bitcoinbeach.com',
    status: 'active',
    ecosystem: '🌊 Comunidad costera',
  },
  {
    id: 'bitcoin-jungle',
    type: 'economy',
    name: 'Bitcoin Jungle',
    location: 'Costa Rica',
    description: 'Comunidad costarricense adoptando Bitcoin para turismo y comercio local.',
    website: 'https://bitcoinjungle.app',
    status: 'active',
    ecosystem: '🌴 Turismo Bitcoin',
  },
  // Sponsors (soporte)
  {
    id: 'mexc',
    type: 'sponsor',
    name: 'MEXC',
    category: 'CEX',
    description: '40% comisión + barras de oro. 2,000+ criptos, futuros 200x.',
    website: 'https://mexc.com',
    commission: 'Hasta 40%',
    feature: '🔱 Barras de oro',
    audience: 'Traders',
    icon: Coins,
  },
  {
    id: 'godex',
    type: 'sponsor',
    name: 'Godex.io',
    category: 'Swap',
    description: '8+ años, partnerships con Trezor/Monero. Tasas fijas.',
    website: 'https://godex.io',
    commission: '0.6%',
    feature: '🛡️ 8 años',
    audience: 'Privacidad',
    icon: Shield,
  },
  {
    id: 'bitcoin-lake',
    type: 'economy',
    name: 'Bitcoin Lake',
    location: 'Guatemala',
    description: 'Iniciativa en el Lago Atitlán para educación y adopción Bitcoin.',
    website: 'https://bitcoinlake.io',
    status: 'coming',
    ecosystem: '🏞️ Lago Atitlán',
  },
  {
    id: 'hodlhodl',
    type: 'sponsor',
    name: 'HodlHodl',
    category: 'P2P',
    description: 'Multisig escrow. Cualquier moneda fiat.',
    website: 'https://hodlhodl.com',
    commission: '0.3%',
    feature: '🤝 P2P global',
    audience: 'Compradores P2P',
    icon: Globe,
  },
  {
    id: 'sideshift',
    type: 'sponsor',
    name: 'SideShift',
    category: 'Swap',
    description: 'Token XAI con 10%+ APY. Widgets embedibles.',
    website: 'https://sideshift.ai',
    commission: '0.5%',
    feature: '📈 Staking XAI',
    audience: 'Stakers',
    icon: Sparkles,
  },
  {
    id: 'bitcoin-isla',
    type: 'economy',
    name: 'Bitcoin Isla',
    location: 'Isla Mujeres, México',
    description: 'Isla Mujeres como hub de economía circular Bitcoin.',
    website: '#',
    status: 'planned',
    ecosystem: '🏝️ Caribe Mexicano',
  },
];

export function CircularEconomiesCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [filter, setFilter] = useState<'all' | 'economy' | 'sponsor'>('all');

  const filteredItems = items.filter(item =>
    filter === 'all' ? true : item.type === filter
  );

  const currentItem = filteredItems[current % filteredItems.length];
  const isEconomy = currentItem?.type === 'economy';
  const isSponsor = currentItem?.type === 'sponsor';

  const t = {
    en: {
      title: 'Ecosystem & Partners',
      subtitle: 'Communities we serve · Sponsors who support us',
      active: 'Active',
      coming: 'Coming Soon',
      planned: 'Planned',
      commission: 'Commission',
      feature: 'Feature',
      audience: 'Ideal for',
      kyc: 'No KYC',
      visit: 'Visit',
      trade: 'Trade Now',
      filterAll: 'All',
      filterEconomies: 'Communities',
      filterSponsors: 'Sponsors',
      mission: 'Mission',
      support: 'Support',
    },
    es: {
      title: 'Ecosistema & Partners',
      subtitle: 'Comunidades que servimos · Sponsors que nos apoyan',
      active: 'Activo',
      coming: 'Próximamente',
      planned: 'Planificado',
      commission: 'Comisión',
      feature: 'Destacado',
      audience: 'Ideal para',
      kyc: 'Sin KYC',
      visit: 'Visitar',
      trade: 'Operar',
      filterAll: 'Todos',
      filterEconomies: 'Comunidades',
      filterSponsors: 'Sponsors',
      mission: 'Misión',
      support: 'Apoyo',
    },
  }[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % filteredItems.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [filteredItems.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % filteredItems.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/40 ring-1 ring-green-500/30',
    coming: 'bg-amber-500/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30',
    planned: 'bg-slate-500/20 text-slate-400 border-slate-500/40 ring-1 ring-slate-500/30',
  };

  const categoryColors = {
    CEX: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    P2P: 'bg-green-500/20 text-green-400 border-green-500/40',
    Swap: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  };

  return (
    <section className="py-28 bg-slate-950 relative overflow-hidden border-y border-slate-800/70">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(247,147,26,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(247,147,26,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#f7931a]/20 to-amber-500/20 border border-[#f7931a]/30 rounded-3xl text-[#f7931a] text-sm font-mono mb-8 shadow-xl">
            <Bitcoin className="w-5 h-5" />
            <span className="animate-pulse">⚡</span>
            mission-driven · sponsor-supported
            <span className="animate-pulse">⚡</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-[#f7931a] via-amber-300 to-white bg-clip-text text-transparent font-mono tracking-[-2px] mb-4">
            {t.title}
          </h2>

          <p className="text-2xl text-slate-400 max-w-3xl mx-auto">
            {t.subtitle}
          </p>

          {/* Filter Tabs - more premium */}
          <div className="flex justify-center gap-4 mt-12">
            {[
              { value: 'all', label: t.filterAll, icon: Bitcoin },
              { value: 'economy', label: t.filterEconomies, icon: Users },
              { value: 'sponsor', label: t.filterSponsors, icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setFilter(tab.value as any);
                    setCurrent(0);
                  }}
                  className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-base font-mono transition-all border shadow-xl ${filter === tab.value
                    ? 'bg-[#f7931a] text-black border-[#f7931a] shadow-[#f7931a]/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Card - ultra luxurious */}
        <div className="relative bg-slate-900/90 backdrop-blur-3xl border border-slate-700/60 rounded-3xl p-12 md:p-16 overflow-hidden shadow-2xl shadow-black/80 min-h-[520px]">

          {/* Glow effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f7931a]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl translate-y-1/3" />

          {/* Terminal header */}
          <div className="absolute top-0 left-0 right-0 h-14 bg-black/40 border-b border-slate-800/60 flex items-center px-8 gap-4 rounded-t-3xl">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-sm text-slate-500 font-mono">
              {filter === 'all' ? 'bitcoin@ecosystem:~$' :
                filter === 'economy' ? 'communities@circular:~$' :
                  'sponsors@partners:~$'}
            </span>

            {currentItem && (
              <span className="ml-auto text-sm font-mono flex items-center gap-2">
                {isEconomy ? (
                  <span className="text-green-400 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> {t.mission}
                  </span>
                ) : (
                  <span className="text-[#f7931a] flex items-center gap-2">
                    <Award className="w-4 h-4" /> {t.support}
                  </span>
                )}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            {currentItem && (
              <motion.div
                key={`${currentItem.id}-${filter}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative min-h-[380px] flex flex-col mt-10"
              >
                {/* Header badges - larger and more elegant */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  {isEconomy ? (
                    <>
                      <div className={`inline-flex items-center px-6 py-2 rounded-3xl text-sm font-medium border ${statusColors[(currentItem as Economy).status]}`}>
                        <div className="w-3 h-3 rounded-full bg-current mr-3 animate-pulse" />
                        {t[(currentItem as Economy).status]}
                      </div>

                      <div className="inline-flex items-center px-6 py-2 rounded-3xl text-sm font-medium border border-slate-600/40 bg-slate-800/40 text-emerald-400">
                        <MapPin className="w-4 h-4 mr-3" />
                        {(currentItem as Economy).location}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`inline-flex items-center px-6 py-2 rounded-3xl text-sm font-medium border ${categoryColors[(currentItem as Sponsor).category]}`}>
                        <div className="w-3 h-3 rounded-full bg-current mr-3 animate-pulse" />
                        {(currentItem as Sponsor).category}
                      </div>

                      <div className="inline-flex items-center px-6 py-2 rounded-3xl text-sm font-medium border border-slate-600/40 bg-slate-800/40 text-emerald-400">
                        <Shield className="w-4 h-4 mr-3" />
                        No KYC
                      </div>

                      <div className="inline-flex items-center px-6 py-2 rounded-3xl text-sm font-medium border border-[#f7931a]/40 bg-[#f7931a]/10 text-[#f7931a]">
                        <Percent className="w-4 h-4 mr-3" />
                        {(currentItem as Sponsor).commission}
                      </div>
                    </>
                  )}
                </div>

                {/* Main content - more spacious */}
                <div className="grid md:grid-cols-3 gap-12">
                  {/* Left column - Identity (larger) */}
                  <div className="md:col-span-1">
                    <div className="flex flex-col items-center md:items-start gap-8">
                      <div className={`w-32 h-32 rounded-3xl border-4 flex items-center justify-center transition-all
                        ${isEconomy
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/40'
                          : 'bg-gradient-to-br from-[#f7931a]/20 to-amber-500/20 border-[#f7931a]/40'
                        }`}
                      >
                        {isEconomy ? (
                          <TreePine className="w-16 h-16 text-green-400" />
                        ) : (
                          <currentItem.icon className="w-16 h-16 text-[#f7931a]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-4xl font-bold text-white font-mono tracking-tighter">
                          {currentItem.name}
                        </h3>
                        <p className="text-base text-slate-500 mt-2 font-mono">
                          {isEconomy
                            ? (currentItem as Economy).ecosystem
                            : (currentItem as Sponsor).audience
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right column - Description */}
                  <div className="md:col-span-2 space-y-6">
                    <p className="text-slate-200 text-xl leading-relaxed">
                      {currentItem.description}
                    </p>

                    {isSponsor && (
                      <div className="bg-slate-800/60 rounded-3xl p-8 border border-slate-700/50">
                        <div className="text-xs uppercase tracking-[2px] text-slate-500 font-mono mb-3">{t.feature}</div>
                        <div className="text-2xl font-bold text-slate-100 font-mono">
                          {(currentItem as Sponsor).feature}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA - more luxurious */}
                <div className="mt-16 flex justify-end">
                  <a
                    href={currentItem.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative inline-flex items-center gap-4 px-12 py-6 font-bold text-xl rounded-3xl transition-all shadow-2xl hover:scale-[1.03] overflow-hidden
                      ${isEconomy
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-600/40'
                        : 'bg-gradient-to-r from-[#f7931a] to-amber-500 hover:from-[#f7931a]/90 hover:to-amber-400 shadow-[#f7931a]/50 text-black'
                      }`}
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      {isEconomy ? t.visit : t.trade} {currentItem.name}
                      <ExternalLink className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </span>

                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-[220%] transition-transform duration-700" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-20 pt-8 border-t border-slate-800/70">
            <button
              onClick={prev}
              className="group p-4 hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            <div className="flex gap-4">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > current ? 1 : -1);
                    setCurrent(idx);
                  }}
                  className={`transition-all duration-300 rounded-full ${idx === current
                    ? 'w-12 h-3 bg-[#f7931a] shadow-lg shadow-[#f7931a]/60'
                    : 'w-3 h-3 bg-slate-700 hover:bg-slate-500'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="group p-4 hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-10 text-sm text-slate-600 font-mono">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" /> {items.filter(i => i.type === 'economy').length} communities
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-400" /> mission
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> {items.filter(i => i.type === 'sponsor').length} sponsors
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#f7931a]" /> support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}