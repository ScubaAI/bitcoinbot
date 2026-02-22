'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Shield,
  Coins,
  Sparkles,
  Bitcoin,
  TreePine,
  Loader2,
  Maximize2,
  Minimize2
} from 'lucide-react';

type ItemType = 'economy' | 'sponsor' | 'widget';

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

interface WidgetSponsor extends BaseItem {
  type: 'widget';
  category: 'Swap';
  commission: string;
  feature: string;
  audience: string;
  icon: React.ElementType;
  widgetUrl: string;
  defaultAmount: number;
  defaultFrom: string;
  defaultTo: string;
  height: number;
}

type Item = Economy | Sponsor | WidgetSponsor;

// ============================================================================
// COMPONENTE: Widget Card
// ============================================================================

function WidgetCard({ 
  item, 
  isExpanded, 
  onToggleExpand, 
  isActive 
}: { 
  item: WidgetSponsor; 
  isExpanded: boolean;
  onToggleExpand: () => void;
  isActive: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isActive]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#f7931a]/10 border border-[#f7931a]/20">
          <item.icon className="w-5 h-5 text-[#f7931a]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.audience}
          </p>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title={isExpanded ? "Minimizar" : "Expandir"}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
          Instant Swap
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-[#f7931a]">
          {item.commission}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed mb-3">
        {item.description}
      </p>

      {/* Feature box */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Destacado</span>
        <p className="text-sm font-mono text-slate-200 mt-1">
          {item.feature}
        </p>
      </div>

      {/* Widget Container - Tamaño corregido */}
      <div className={`
        relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950
        transition-all duration-500 ease-out flex-1
        ${isExpanded ? 'min-h-[450px]' : 'min-h-[350px]'}
      `}>
        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10"
            >
              <Loader2 className="w-8 h-8 text-[#f7931a] animate-spin mb-2" />
              <span className="text-xs text-slate-500 font-mono">Cargando widget...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10">
            <p className="text-sm text-slate-400 mb-3">No se pudo cargar el widget</p>
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f7931a] hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors"
            >
              Visitar Sitio
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={item.widgetUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="camera"
          onLoad={() => setIsLoading(false)}
          onError={() => { setIsLoading(false); setHasError(true); }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className={`
            absolute inset-0 w-full h-full transition-opacity duration-300
            ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}
          `}
          title={`${item.name} Exchange Widget`}
        />
      </div>

      {/* Footer hint */}
      <p className="text-[10px] text-slate-600 mt-2 text-center font-mono">
        {isExpanded ? 'Presiona minimizar para vista compacta' : 'Presiona expandir para trading completo'}
      </p>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Sponsor Card Estándar
// ============================================================================

function SponsorCard({ item }: { item: Sponsor }) {
  const Icon = item.icon;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[#f7931a]/10 border border-[#f7931a]/20">
          <Icon className="w-5 h-5 text-[#f7931a]" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.audience}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`
          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
          ${item.category === 'CEX' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
          ${item.category === 'P2P' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
          ${item.category === 'Swap' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : ''}
        `}>
          {item.category}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-[#f7931a]">
          {item.commission}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-3 flex-1">
        {item.description}
      </p>

      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 mb-4">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Destacado</span>
        <p className="text-sm font-mono text-slate-200 mt-1">
          {item.feature}
        </p>
      </div>

      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f7931a] hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors w-fit"
      >
        Operar
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ============================================================================
// COMPONENTE: Economy Card
// ============================================================================

function EconomyCard({ item, t }: { item: Economy; t: any }) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    coming: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    planned: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[item.status]}`}>
          {item.status === 'active' ? '●' : '○'}
          <span className="ml-1.5">{t[item.status]}</span>
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-600 bg-slate-800 text-slate-300">
          <MapPin className="w-3 h-3 mr-1" />
          {item.location}
        </span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-xl flex-shrink-0 bg-green-500/10 border border-green-500/20">
          <TreePine className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {item.ecosystem}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4 flex-1">
        {item.description}
      </p>

      <a
        href={item.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-colors w-fit"
      >
        {t.visit}
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ============================================================================
// DATA (CORREGIDO: Comisiones Activas)
// ============================================================================

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
    id: 'changelly',
    type: 'widget',
    name: 'Changelly',
    category: 'Swap',
    description: 'Intercambio instantáneo de cripto a cripto. 500+ pares disponibles. Sin registro.',
    website: 'https://changelly.com',
    commission: '0.25%', // Comisión estimada activa
    feature: '⚡ Swap instantáneo',
    audience: 'Usuarios rápidos',
    icon: Sparkles,
    // URL LIMPIA: Parámetros optimizados para rev-share y tema oscuro
    widgetUrl: 'https://widget.changelly.com?from=mxn%2Cusd&to=btc&amount=700&address=&fromDefault=mxn&toDefault=btc&merchant_id=eD8DX5SsvWty_llz&payment_id=&v=3&color=f9861b&headerId=1&logo=visible&buyButtonTextId=2',
    defaultAmount: 700,
    defaultFrom: 'mxn',
    defaultTo: 'btc',
    height: 450,
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
    icon: Coins,
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CircularEconomiesCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [filter, setFilter] = useState<'all' | 'economy' | 'sponsor' | 'widget'>('all');
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'sponsor') return item.type === 'sponsor' || item.type === 'widget';
    return item.type === filter;
  });

  const currentItem = filteredItems[current % filteredItems.length];
  const isEconomy = currentItem?.type === 'economy';
  const isWidget = currentItem?.type === 'widget';

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
      filterSponsors: 'Partners',
      filterWidgets: 'Instant',
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
      filterSponsors: 'Partners',
      filterWidgets: 'Instantáneo',
      mission: 'Misión',
      support: 'Apoyo',
    },
  }[lang];

  useEffect(() => {
    setExpandedWidget(null);
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % filteredItems.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [filteredItems.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
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

  const toggleWidgetExpand = (id: string) => {
    setExpandedWidget(expandedWidget === id ? null : id);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-950 border-y border-slate-800/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f7931a]/10 border border-[#f7931a]/20 rounded-full text-[#f7931a] text-xs font-mono mb-3">
            <Bitcoin className="w-3 h-3" />
            <span>mission · support · trade</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono mb-2">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            {t.subtitle}
          </p>

          {/* Filter tabs */}
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {[
              { value: 'all', label: t.filterAll },
              { value: 'economy', label: t.filterEconomies },
              { value: 'sponsor', label: t.filterSponsors },
              { value: 'widget', label: t.filterWidgets },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilter(tab.value as any);
                  setCurrent(0);
                  setExpandedWidget(null);
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

        {/* Card Container - Altura dinámica */}
        <div 
          className={`
            relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden
            transition-all duration-500 ease-out flex flex-col
            ${expandedWidget ? 'min-h-[650px]' : 'min-h-[420px]'}
          `}
        >
          {/* Header minimal */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {isEconomy ? t.mission : isWidget ? 'Instant Swap' : t.support}
              </span>
            </div>
            <span className="text-xs text-slate-600 font-mono">
              {current + 1}/{filteredItems.length}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6">
            <AnimatePresence mode="wait" custom={direction}>
              {currentItem && (
                <motion.div
                  key={`${currentItem.id}-${filter}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full"
                >
                  {isEconomy ? (
                    <EconomyCard item={currentItem as Economy} t={t} />
                  ) : isWidget ? (
                    <WidgetCard 
                      item={currentItem as WidgetSponsor}
                      isExpanded={expandedWidget === currentItem.id}
                      onToggleExpand={() => toggleWidgetExpand(currentItem.id)}
                      isActive={true}
                    />
                  ) : (
                    <SponsorCard item={currentItem as Sponsor} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-slate-800 mt-auto">
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
        <div className="mt-4 flex justify-center gap-6 text-xs text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <TreePine className="w-3 h-3" /> 
            {items.filter(i => i.type === 'economy').length} Comunidades
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" /> 
            {items.filter(i => i.type === 'sponsor').length} Partners
          </span>
          <span className="flex items-center gap-1 text-[#f7931a]">
            <Sparkles className="w-3 h-3" /> 
            {items.filter(i => i.type === 'widget').length} Instant
          </span>
        </div>
      </div>
    </section>
  );
}