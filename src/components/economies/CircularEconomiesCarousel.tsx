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

  // Status colors for economies
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/40 ring-1 ring-green-500/30',
    coming: 'bg-amber-500/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30',
    planned: 'bg-slate-500/20 text-slate-400 border-slate-500/40 ring-1 ring-slate-500/30',
  };

  // Category colors for sponsors
  const categoryColors = {
    CEX: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    P2P: 'bg-green-500/20 text-green-400 border-green-500/40',
    Swap: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  };

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden border-y border-slate-800/70">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(247,147,26,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(247,147,26,0.03)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full text-orange-500 text-sm font-mono mb-6">
            <Bitcoin className="w-4 h-4" />
            <span className="animate-pulse">⚡</span>
            <span>mission-driven · sponsor-supported</span>
            <span className="animate-pulse">⚡</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent font-mono tracking-tighter mb-3">
            {t.title}
          </h2>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* Filter Tabs */}
          <div className="flex justify-center gap-3 mt-8">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-mono transition-all border ${filter === tab.value
                    ? 'bg-orange-500 text-black border-orange-400 shadow-lg shadow-orange-500/30'
                    : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Card */}
        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-black/50">

          {/* Glow effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3" />

          {/* Terminal header */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-black/30 border-b border-slate-800/60 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-xs text-slate-600 font-mono ml-2">
              {filter === 'all' ? 'bitcoin@ecosystem:~$' :
                filter === 'economy' ? 'communities@circular:~$' :
                  'sponsors@partners:~$'}
            </span>

            {/* Type indicator */}
            {currentItem && (
              <span className="ml-auto text-xs font-mono">
                {isEconomy ? (
                  <span className="text-green-500/70 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {t.mission}
                  </span>
                ) : (
                  <span className="text-orange-500/70 flex items-center gap-1">
                    <Award className="w-3 h-3" /> {t.support}
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
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative min-h-[320px] flex flex-col mt-6"
              >
                {/* Header badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {isEconomy ? (
                    // Economy badges
                    <>
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium border ${statusColors[(currentItem as Economy).status]}`}>
                        <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                        {t[(currentItem as Economy).status]}
                      </div>

                      <div className="inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium border border-slate-600/40 bg-slate-800/40 text-emerald-400">
                        <MapPin className="w-3 h-3 mr-2" />
                        {(currentItem as Economy).location}
                      </div>
                    </>
                  ) : (
                    // Sponsor badges
                    <>
                      <div className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium border ${categoryColors[(currentItem as Sponsor).category]}`}>
                        <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                        {(currentItem as Sponsor).category}
                      </div>

                      <div className="inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium border border-slate-600/40 bg-slate-800/40 text-emerald-400">
                        <Shield className="w-3 h-3 mr-2" />
                        No KYC
                      </div>

                      <div className="inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400">
                        <Percent className="w-3 h-3 mr-2" />
                        {(currentItem as Sponsor).commission}
                      </div>
                    </>
                  )}
                </div>

                {/* Main content */}
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left column - Identity */}
                  <div className="md:col-span-1">
                    <div className="flex flex-col items-center md:items-start gap-4">
                      <div className={`w-24 h-24 rounded-2xl border flex items-center justify-center
                        ${isEconomy
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30'
                          : 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/30'
                        }`}
                      >
                        {isEconomy ? (
                          <TreePine className="w-12 h-12 text-green-500" />
                        ) : (
                          <currentItem.icon className="w-12 h-12 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white font-mono tracking-tight">
                          {currentItem.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 font-mono">
                          {isEconomy
                            ? (currentItem as Economy).ecosystem
                            : (currentItem as Sponsor).audience
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right column - Description */}
                  <div className="md:col-span-2 space-y-4">
                    <p className="text-slate-300 text-lg leading-relaxed">
                      {currentItem.description}
                    </p>

                    {isSponsor && (
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          <div className="text-xs text-slate-500 font-mono mb-1">{t.feature}</div>
                          <div className="text-lg font-bold text-slate-200 font-mono">
                            {(currentItem as Sponsor).feature}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-10 flex justify-end">
                  <a
                    href={currentItem.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative inline-flex items-center gap-3 px-8 py-4 font-bold rounded-2xl transition-all shadow-lg hover:scale-[1.02] overflow-hidden
                      ${isEconomy
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-600/30 hover:shadow-green-500/50'
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-600/30 hover:shadow-orange-500/50'
                      }`}
                  >
                    <span className="relative z-10 flex items-center gap-3 text-white">
                      {isEconomy ? t.visit : t.trade} {currentItem.name}
                      <ExternalLink className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    </span>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />

                    {/* Terminal cursor effect */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-white/50 w-0 group-hover:w-full transition-all duration-300
                      ${isEconomy ? 'bg-white' : 'bg-white'}`}
                    />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-800/70">
            <button
              onClick={prev}
              className="group p-3 hover:bg-slate-800/80 rounded-2xl transition-all text-slate-400 hover:text-white hover:scale-110"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-3">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > current ? 1 : -1);
                    setCurrent(idx);
                  }}
                  className={`relative transition-all duration-300 ${idx === current
                    ? 'w-8 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/70'
                    : 'w-3 h-3 bg-slate-700 rounded-full hover:bg-slate-500'
                    }`}
                  aria-label={`Go to item ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="group p-3 hover:bg-slate-800/80 rounded-2xl transition-all text-slate-400 hover:text-white hover:scale-110"
              aria-label="Next item"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600 font-mono">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {items.filter(i => i.type === 'economy').length} communities
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-green-500/50" /> mission
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> {items.filter(i => i.type === 'sponsor').length} sponsors
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3 text-orange-500/50" /> support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}