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

  const t = {
    en: {
      title: 'Ecosystem',
      subtitle: 'Communities & Partners',
      active: 'Active',
      coming: 'Soon',
      planned: 'Planned',
      commission: 'Commission',
      feature: 'Feature',
      audience: 'For',
      visit: 'Visit',
      trade: 'Trade',
      filterAll: 'All',
      filterEconomies: 'Communities',
      filterSponsors: 'Sponsors',
      mission: 'Mission',
      support: 'Support',
    },
    es: {
      title: 'Ecosistema',
      subtitle: 'Comunidades & Partners',
      active: 'Activo',
      coming: 'Pronto',
      planned: 'Planificado',
      commission: 'Comisión',
      feature: 'Destacado',
      audience: 'Para',
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
    }, 6000);
    return () => clearInterval(timer);
  }, [filteredItems.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
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
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    coming: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    planned: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const categoryColors = {
    CEX: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    P2P: 'bg-green-500/20 text-green-400 border-green-500/30',
    Swap: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-950 border-y border-slate-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header compacto */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f7931a]/10 border border-[#f7931a]/20 rounded-full text-[#f7931a] text-xs font-mono mb-3">
            <Bitcoin className="w-3 h-3" />
            <span>mission · support</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono mb-2">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.subtitle}
          </p>

          {/* Filter tabs compactos */}
          <div className="flex justify-center gap-2 mt-4">
            {[
              { value: 'all', label: t.filterAll },
              { value: 'economy', label: t.filterEconomies },
              { value: 'sponsor', label: t.filterSponsors },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilter(tab.value as any);
                  setCurrent(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                  filter === tab.value
                    ? 'bg-[#f7931a] text-black border-[#f7931a]'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card compacta */}
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Header minimal */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {isEconomy ? t.mission : t.support}
              </span>
            </div>
            <span className="text-xs text-slate-600 font-mono">
              {current + 1}/{filteredItems.length}
            </span>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              {currentItem && (
                <motion.div
                  key={`${currentItem.id}-${filter}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {isEconomy ? (
                      <>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[(currentItem as Economy).status]}`}>
                          {(currentItem as Economy).status === 'active' ? '●' : '○'}
                          <span className="ml-1.5">{t[(currentItem as Economy).status]}</span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-slate-300">
                          <MapPin className="w-3 h-3 mr-1" />
                          {(currentItem as Economy).location}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[(currentItem as Sponsor).category]}`}>
                          {(currentItem as Sponsor).category}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-[#f7931a]">
                          {(currentItem as Sponsor).commission}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title & icon */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isEconomy 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-[#f7931a]/10 border border-[#f7931a]/20'
                    }`}>
                      {isEconomy ? (
                        <TreePine className="w-5 h-5 text-green-400" />
                      ) : (
                        <currentItem.icon className="w-5 h-5 text-[#f7931a]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
                        {currentItem.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isEconomy 
                          ? (currentItem as Economy).ecosystem 
                          : (currentItem as Sponsor).audience
                        }
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentItem.description}
                  </p>

                  {/* Feature box (sponsors only) */}
                  {!isEconomy && (
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{t.feature}</span>
                      <p className="text-sm font-mono text-slate-200 mt-1">
                        {(currentItem as Sponsor).feature}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href={currentItem.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isEconomy
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-[#f7931a] hover:bg-amber-400 text-black'
                    }`}
                  >
                    {isEconomy ? t.visit : t.trade}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800">
            <button
              onClick={prev}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-1.5">
              {filteredItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > current ? 1 : -1);
                    setCurrent(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === current
                      ? 'w-6 bg-[#f7931a]'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats footer */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> 
            {items.filter(i => i.type === 'economy').length}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" /> 
            {items.filter(i => i.type === 'sponsor').length}
          </span>
        </div>
      </div>
    </section>
  );
}