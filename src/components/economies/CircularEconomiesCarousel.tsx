'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, ExternalLink } from 'lucide-react';

interface Economy {
  id: string;
  name: string;
  location: string;
  description: string;
  website: string;
  status: 'active' | 'coming' | 'planned';
}

const economies: Economy[] = [
  {
    id: 'bitcoin-beach',
    name: 'Bitcoin Beach',
    location: 'El Zonte, El Salvador',
    description: 'La economía circular Bitcoin original. Donde todo comenzó.',
    website: 'https://bitcoinbeach.com',
    status: 'active',
  },
  {
    id: 'bitcoin-jungle',
    name: 'Bitcoin Jungle',
    location: 'Costa Rica',
    description: 'Comunidad costarricense adoptando Bitcoin para turismo y comercio local.',
    website: 'https://bitcoinjungle.app',
    status: 'active',
  },
  {
    id: 'bitcoin-lake',
    name: 'Bitcoin Lake',
    location: 'Guatemala',
    description: 'Iniciativa en el Lago Atitlán para educación y adopción Bitcoin.',
    website: 'https://bitcoinlake.io',
    status: 'coming',
  },
  {
    id: 'bitcoin-isla',
    name: 'Bitcoin Isla',
    location: 'México',
    description: 'Isla Mujeres como hub de economía circular Bitcoin.',
    website: '#',
    status: 'planned',
  },
];

export function CircularEconomiesCarousel({ lang = 'en' }: { lang?: 'en' | 'es' }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const t = {
    en: {
      title: 'Circular Economies',
      subtitle: 'We\'re bringing Bitcoin Agent to communities worldwide',
      active: 'Active',
      coming: 'Coming Soon',
      planned: 'Planned',
      visit: 'Visit',
    },
    es: {
      title: 'Economías Circulares',
      subtitle: 'Llevando Bitcoin Agent a comunidades del mundo',
      active: 'Activo',
      coming: 'Próximamente',
      planned: 'Planificado',
      visit: 'Visitar',
    },
  }[lang];

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % economies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
    setCurrent((prev) => (prev + 1) % economies.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + economies.length) % economies.length);
  };

  const currentEconomy = economies[current];

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/40 ring-1 ring-green-500/30',
    coming: 'bg-amber-500/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/30',
    planned: 'bg-slate-500/20 text-slate-400 border-slate-500/40 ring-1 ring-slate-500/30',
  };

  const statusLabels = {
    active: t.active,
    coming: t.coming,
    planned: t.planned,
  };

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden border-y border-slate-800/70">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-mono tracking-tighter mb-3">
            {t.title}
          </h2>
          <p className="text-xl text-slate-400 max-w-md mx-auto">{t.subtitle}</p>
        </div>

        {/* Carousel Card */}
        <div className="relative bg-slate-900/60 backdrop-blur-3xl border border-slate-700/60 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-black/50">
          
          {/* Multiple glow layers */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl translate-y-1/3" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative min-h-[260px] flex flex-col"
            >
              {/* Status + Location */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className={`inline-flex items-center px-5 py-1.5 rounded-2xl text-xs font-medium border transition-all ${statusColors[currentEconomy.status]}`}>
                  <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                  {statusLabels[currentEconomy.status]}
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-sm font-light">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  {currentEconomy.location}
                </div>
              </div>

              {/* Name */}
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight font-mono">
                {currentEconomy.name}
              </h3>

              {/* Description */}
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-10">
                {currentEconomy.description}
              </p>

              {/* CTA */}
              <a
                href={currentEconomy.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-[1.02] overflow-hidden"
              >
                {t.visit}
                <ExternalLink className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                
                {/* Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700" />
              </a>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-800/70">
            <button
              onClick={prev}
              className="group p-3 hover:bg-slate-800/80 rounded-2xl transition-all text-slate-400 hover:text-white hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-3">
              {economies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > current ? 1 : -1);
                    setCurrent(idx);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === current 
                      ? 'bg-orange-500 scale-125 shadow-lg shadow-orange-500/70' 
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="group p-3 hover:bg-slate-800/80 rounded-2xl transition-all text-slate-400 hover:text-white hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}