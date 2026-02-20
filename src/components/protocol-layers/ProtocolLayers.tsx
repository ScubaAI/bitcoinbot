'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, Globe, Layers, ArrowDown, Bitcoin, Sparkles, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ProtocolLayersProps {
  lang?: 'en' | 'es';
}

interface LayerFeature {
  name: string;
  tooltip: string;
}

interface Layer {
  id: string;
  name: string;
  esName: string;
  icon: any;
  color: string;
  bgColor: string;
  description: {
    en: string;
    es: string;
  };
  analogy: {
    en: string;
    es: string;
  };
  features: LayerFeature[];
  stats?: {
    label: string;
    value: string;
  }[];
}

const layers: Layer[] = [
  {
    id: 'l1',
    name: 'Base Layer (L1)',
    esName: 'Capa Base (L1)',
    icon: Database,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    description: {
      en: 'Settlement & finality. The foundation where all transactions are permanently recorded.',
      es: 'Liquidación y finalidad. La base donde todas las transacciones se registran permanentemente.'
    },
    analogy: {
      en: '🏛️ Like a bank vault: secure, slow, and permanent.',
      es: '🏛️ Como una caja fuerte: segura, lenta y permanente.'
    },
    features: [
      { name: 'Proof-of-Work', tooltip: 'Miners secure the network with computational power' },
      { name: '21M cap', tooltip: 'Digital scarcity - only 21 million Bitcoin will ever exist' },
      { name: 'Decentralized', tooltip: 'No single entity controls the network' }
    ],
    stats: [
      { label: 'Block time', value: '~10 min' },
      { label: 'Finality', value: '60 min' },
      { label: 'Capacity', value: '~7 tps' }
    ]
  },
  {
    id: 'l2',
    name: 'Lightning Network (L2)',
    esName: 'Lightning (L2)',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    description: {
      en: 'Instant payments at scale. A layer ON TOP of Bitcoin for fast, cheap transactions.',
      es: 'Pagos instantáneos a escala. Una capa ENCIMA de Bitcoin para transacciones rápidas y baratas.'
    },
    analogy: {
      en: '⚡ Like a tab at a bar: open a tab, transact all night, settle once.',
      es: '⚡ Como una cuenta en un bar: abres cuenta, transaccionas, pagas al cerrar.'
    },
    features: [
      { name: 'Payment Channels', tooltip: 'Private pathways for unlimited off-chain transactions' },
      { name: 'Atomic Swaps', tooltip: 'Trustless exchange between cryptocurrencies' },
      { name: 'Micro-payments', tooltip: 'Send amounts as small as 1 satoshi' }
    ],
    stats: [
      { label: 'Speed', value: 'Instant' },
      { label: 'Fee', value: '< $0.001' },
      { label: 'Capacity', value: '1M+ tps' }
    ]
  },
  {
    id: 'l3',
    name: 'Application Layer (L3)',
    esName: 'Aplicaciones (L3)',
    icon: Globe,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    description: {
      en: 'Applications built on top. Wallets, services, and protocols that make Bitcoin useful.',
      es: 'Aplicaciones construidas encima. Wallets, servicios y protocolos que hacen útil a Bitcoin.'
    },
    analogy: {
      en: '📱 Like apps on your phone: L1 is the phone, L2 the data plan, L3 the apps.',
      es: '📱 Como apps en tu teléfono: L1 es el teléfono, L2 el plan de datos, L3 las apps.'
    },
    features: [
      { name: 'Non-custodial wallets', tooltip: 'You control your private keys' },
      { name: 'DLCs', tooltip: 'Discreet Log Contracts - private smart contracts' },
      { name: 'RGB/Assets', tooltip: 'Tokens issued on Bitcoin using RGB protocol' }
    ],
    stats: [
      { label: 'Wallets', value: '100+' },
      { label: 'Protocols', value: '30+' },
      { label: 'Apps', value: '500+' }
    ]
  },
];

export function ProtocolLayers({ lang = 'en' }: ProtocolLayersProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Bitcoin Layers',
      subtitle: 'A stack of technologies working together.',
      tip: 'Lightning is to Bitcoin like HTTP is to TCP/IP. A layer, not a separate network.',
      l1Note: 'The foundation. All transactions eventually settle here.',
      l2Note: 'Built ON TOP of Bitcoin. Not a separate token!',
      l3Note: 'Applications that make Bitcoin usable day-to-day.',
    },
    es: {
      title: 'Capas de Bitcoin',
      subtitle: 'Un stack de tecnologías trabajando juntas.',
      tip: 'Lightning es a Bitcoin como HTTP es a TCP/IP. Una capa, no una red separada.',
      l1Note: 'La base. Todas las transacciones eventualmente se liquidan aquí.',
      l2Note: 'Construida SOBRE Bitcoin. ¡No es un token separado!',
      l3Note: 'Aplicaciones que hacen útil a Bitcoin en el día a día.',
    }
  }[lang];

  return (
    <section className="w-full bg-slate-950 py-12 sm:py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 rounded-2xl border border-slate-700 mb-4 sm:mb-6">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7931a]" />
            <span className="text-sm sm:text-lg font-mono tracking-wider text-slate-200">{t.title}</span>
          </div>
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Tip box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-12 p-4 sm:p-6 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex items-start gap-3 sm:gap-4"
        >
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base text-blue-200 leading-relaxed">{t.tip}</p>
        </motion.div>

        {/* Layers container */}
        <div className="relative bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 p-4 sm:p-6 lg:p-8">
          {/* Layers stack */}
          <div className="space-y-4 sm:space-y-6">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const isExpanded = expandedLayer === layer.id;
              const isLightning = layer.id === 'l2';

              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < layers.length - 1 && (
                    <div className="hidden sm:block absolute left-6 sm:left-8 top-full w-px h-4 sm:h-6 bg-gradient-to-b from-[#f7931a]/40 to-transparent" />
                  )}

                  {/* Layer card */}
                  <div
                    onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                    className={`
                      group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer
                      ${layer.bgColor} ${isLightning ? 'ring-1 sm:ring-2 ring-blue-500/30' : ''}
                      hover:border-opacity-60
                    `}
                  >
                    {/* Lightning badge */}
                    {isLightning && (
                      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-600 to-[#f7931a] text-white text-xs font-mono rounded-lg shadow-lg flex items-center gap-1">
                        <Bitcoin className="w-3 h-3" />
                        <span className="hidden sm:inline">Built on Bitcoin</span>
                        <span className="sm:hidden">L2</span>
                      </div>
                    )}

                    {/* Main content - STACK en mobile, ROW en desktop */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 p-3 sm:p-4 rounded-xl bg-slate-900 border-2 w-fit
                        ${isLightning ? 'border-blue-500/40' : 'border-slate-700'}
                      `}>
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${layer.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                          <h3 className={`text-lg sm:text-2xl font-bold font-mono ${layer.color}`}>
                            {lang === 'es' ? layer.esName : layer.name}
                          </h3>
                          <ChevronDown 
                            className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-3">
                          {layer.description[lang]}
                        </p>

                        {/* Analogy */}
                        <p className="text-xs sm:text-sm text-slate-500 italic mb-4">
                          {layer.analogy[lang]}
                        </p>

                        {/* Features - scroll horizontal en mobile */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {layer.features.map((feature) => (
                            <button
                              key={feature.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltip(activeTooltip === feature.name ? null : feature.name);
                              }}
                              className={`
                                text-xs px-3 py-1.5 rounded-full border font-mono transition-all
                                ${activeTooltip === feature.name
                                  ? 'bg-[#f7931a] border-[#f7931a] text-black'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                }
                              `}
                            >
                              {feature.name}
                            </button>
                          ))}
                        </div>

                        {/* Tooltip móvil (inline) */}
                        <AnimatePresence>
                          {activeTooltip && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-4 p-3 bg-slate-800 rounded-lg text-xs text-slate-300"
                            >
                              {layer.features.find(f => f.name === activeTooltip)?.tooltip}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 border-t border-slate-700/50">
                                {/* Stats - 3 cols en desktop, 1 en mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                  {layer.stats?.map((stat) => (
                                    <div key={stat.label} className="text-center p-3 sm:p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                                      <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{stat.label}</div>
                                      <div className="text-xl sm:text-2xl font-mono text-[#f7931a] font-semibold">{stat.value}</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Features detail */}
                                <div className="space-y-2 mb-4">
                                  {layer.features.map((feature) => (
                                    <div key={feature.name} className="flex gap-3 text-sm">
                                      <span className="text-[#f7931a] flex-shrink-0">→</span>
                                      <div>
                                        <span className="font-mono text-slate-300">{feature.name}:</span>
                                        <span className="text-slate-500 ml-2">{feature.tooltip}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Note */}
                                <div className="p-3 sm:p-4 bg-slate-900/50 border-l-4 border-[#f7931a] rounded-r-xl">
                                  <p className="text-xs sm:text-sm text-slate-400">
                                    {layer.id === 'l1' && t.l1Note}
                                    {layer.id === 'l2' && t.l2Note}
                                    {layer.id === 'l3' && t.l3Note}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer legend */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-12 pt-6 border-t border-slate-800"
          >
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>L1: Settlement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>L2: Lightning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>L3: Applications</span>
              </div>
            </div>

            <p className="text-center mt-4 sm:mt-6 text-xs text-slate-600 font-mono">
              ⚡ Lightning extends Bitcoin — it never replaces it ⚡
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}