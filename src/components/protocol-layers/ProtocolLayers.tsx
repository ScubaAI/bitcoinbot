'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, Globe, Lock, Layers, ArrowDown, Bitcoin, Network, Sparkles, HelpCircle } from 'lucide-react';
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
    bgColor: 'bg-orange-500/10 border-orange-500/20 group-hover:border-orange-500/40',
    description: {
      en: 'Settlement & finality. The foundation where all transactions are permanently recorded.',
      es: 'Liquidación y finalidad. La base donde todas las transacciones se registran permanentemente.'
    },
    analogy: {
      en: '🏛️ Like a bank vault: secure, slow, and permanent. Where the final records live.',
      es: '🏛️ Como una caja fuerte: segura, lenta y permanente. Donde viven los registros finales.'
    },
    features: [
      { name: 'Proof-of-Work', tooltip: 'Miners compete to secure the network using computational power' },
      { name: '21M cap', tooltip: 'Only 21 million Bitcoin will ever exist - digital scarcity' },
      { name: 'Decentralized consensus', tooltip: 'No single entity controls the network - everyone verifies' }
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
    bgColor: 'bg-blue-500/10 border-blue-500/20 group-hover:border-orange-500/40',
    description: {
      en: 'Instant payments at scale. A layer ON TOP of Bitcoin for fast, cheap transactions.',
      es: 'Pagos instantáneos a escala. Una capa ENCIMA de Bitcoin para transacciones rápidas y baratas.'
    },
    analogy: {
      en: '⚡ Like a tab at a bar: open a tab (channel), drink all night (transactions), settle once at close.',
      es: '⚡ Como una cuenta en un bar: abres una cuenta (canal), bebes toda la noche (transacciones), pagas al cerrar.'
    },
    features: [
      { name: 'Payment Channels', tooltip: 'Private pathways between users for unlimited off-chain transactions' },
      { name: 'Atomic Swaps', tooltip: 'Trustless exchange between different cryptocurrencies' },
      { name: 'Micro-payments', tooltip: 'Send amounts as small as 1 satoshi (fractions of a cent)' }
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
    bgColor: 'bg-purple-500/10 border-purple-500/20 group-hover:border-orange-500/40',
    description: {
      en: 'Applications built on top. Wallets, services, and protocols that make Bitcoin useful.',
      es: 'Aplicaciones construidas encima. Wallets, servicios y protocolos que hacen útil a Bitcoin.'
    },
    analogy: {
      en: '📱 Like apps on your phone: the phone (L1) and data plan (L2) enable Instagram (L3).',
      es: '📱 Como apps en tu teléfono: el teléfono (L1) y el plan de datos (L2) permiten Instagram (L3).'
    },
    features: [
      { name: 'Non-custodial wallets', tooltip: 'You control your private keys - not your keys, not your coins' },
      { name: 'DLCs', tooltip: 'Discreet Log Contracts - smart contracts that keep data private' },
      { name: 'RGB/Taproot Assets', tooltip: 'Tokens and assets issued on Bitcoin using RGB protocol' }
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
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Understanding Bitcoin\'s Layers',
      subtitle: 'Bitcoin is more than one thing. It\'s a stack of technologies working together.',
      analogy: 'Analogy',
      features: 'Key Features',
      stats: 'Network Stats',
      learnMore: 'Click each layer to learn more',
      l1Note: 'The foundation. All transactions eventually settle here.',
      l2Note: 'Built ON TOP of Bitcoin. Not a separate token!',
      l3Note: 'Applications that make Bitcoin usable day-to-day.',
      tip: 'Lightning is to Bitcoin like... HTTP is to TCP/IP. A layer, not a separate network.'
    },
    es: {
      title: 'Entendiendo las Capas de Bitcoin',
      subtitle: 'Bitcoin es más que una cosa. Es un stack de tecnologías trabajando juntas.',
      analogy: 'Analogía',
      features: 'Características',
      stats: 'Estadísticas',
      learnMore: 'Haz clic en cada capa para aprender más',
      l1Note: 'La base. Todas las transacciones eventualmente se liquidan aquí.',
      l2Note: 'Construida SOBRE Bitcoin. ¡No es un token separado!',
      l3Note: 'Aplicaciones que hacen útil a Bitcoin en el día a día.',
      tip: 'Lightning es a Bitcoin como... HTTP es a TCP/IP. Una capa, no una red separada.'
    }
  }[lang];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-20">
      {/* Header educativo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-700 mb-6">
          <Layers className="w-5 h-5 text-[#f7931a]" />
          <span className="text-lg font-mono tracking-widest text-slate-200">{t.title}</span>
        </div>
        <p className="text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">{t.subtitle}</p>
      </motion.div>

      {/* Mensaje educativo destacado sobre Lightning */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12 p-8 bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-500/30 rounded-3xl flex items-start gap-5 backdrop-blur-xl"
      >
        <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
        <p className="text-lg text-blue-200 leading-relaxed">{t.tip}</p>
      </motion.div>

      {/* Visualización de capas como edificio elegante */}
      <div className="relative bg-slate-950/70 backdrop-blur-3xl rounded-3xl border border-slate-800 p-12 overflow-hidden">
        {/* Fondo de rejilla sutil */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f7931a 1px, transparent 0)`,
            backgroundSize: '44px 44px'
          }} />
        </div>

        {/* Capas visuales tipo torre */}
        <div className="relative z-10 space-y-10">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            const isExpanded = expandedLayer === layer.id;
            const isLightning = layer.id === 'l2';

            return (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.12 }}
                className="relative"
              >
                {/* Línea conectora elegante */}
                {index < layers.length - 1 && (
                  <div className="absolute left-[52px] -bottom-6 w-px h-10 bg-gradient-to-b from-[#f7931a]/40 via-[#f7931a]/20 to-transparent" />
                )}

                {/* Tarjeta de capa */}
                <motion.div
                  whileHover={{ scale: 1.015, y: -4 }}
                  onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                  className={`
                    group relative p-10 rounded-3xl border-2 transition-all cursor-pointer shadow-2xl
                    ${layer.bgColor} ${isLightning ? 'ring-2 ring-offset-4 ring-offset-slate-950 ring-blue-500/40 shadow-blue-500/10' : ''}
                  `}
                >
                  {isLightning && (
                    <div className="absolute -top-4 -right-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-[#f7931a] text-white text-sm font-mono rounded-2xl shadow-xl flex items-center gap-2 z-20">
                      <Bitcoin className="w-4 h-4" />
                      Built on Bitcoin
                    </div>
                  )}

                  <div className="flex items-start gap-8">
                    {/* Icono grande */}
                    <div className={`
                      p-6 rounded-2xl bg-slate-900 border-2 transition-all flex-shrink-0
                      ${isLightning ? 'border-blue-500/60' : 'border-slate-700 group-hover:border-[#f7931a]/40'}
                    `}>
                      <Icon className={`w-10 h-10 ${layer.color}`} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className={`text-3xl font-bold font-mono tracking-tight flex items-center gap-3 ${layer.color}`}>
                          {lang === 'es' ? layer.esName : layer.name}
                          {isLightning && <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full tracking-widest">L2</span>}
                        </h3>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.4 }}
                          className="text-slate-400 group-hover:text-[#f7931a]"
                        >
                          <ArrowDown className="w-6 h-6" />
                        </motion.div>
                      </div>

                      <p className="text-xl text-slate-300 leading-relaxed mb-6">
                        {layer.description[lang]}
                      </p>

                      <div className="text-base text-slate-400 italic flex items-start gap-4 mb-8">
                        <span className="text-2xl opacity-60">💡</span>
                        <span>{layer.analogy[lang]}</span>
                      </div>

                      {/* Features chips */}
                      <div className="flex flex-wrap gap-3">
                        {layer.features.map((feature) => (
                          <div
                            key={feature.name}
                            className="relative"
                            onMouseEnter={() => setHoveredFeature(feature.name)}
                            onMouseLeave={() => setHoveredFeature(null)}
                          >
                            <span className={`
                              text-sm px-5 py-2.5 rounded-2xl border font-mono transition-all cursor-help
                              ${hoveredFeature === feature.name
                                ? 'bg-slate-700 border-[#f7931a] text-white shadow-lg shadow-[#f7931a]/20'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                              }
                            `}>
                              {feature.name}
                              <HelpCircle className="inline w-3.5 h-3.5 ml-2 opacity-60" />
                            </span>

                            <AnimatePresence>
                              {hoveredFeature === feature.name && (
                                <motion.div
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 12 }}
                                  className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-5 bg-slate-900 border border-slate-600 rounded-2xl text-sm text-slate-300 shadow-2xl"
                                >
                                  {feature.tooltip}
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-slate-600 rotate-45" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-10 pt-10 border-t border-slate-700">
                              {/* Stats grid */}
                              <div className="grid grid-cols-3 gap-6 mb-10">
                                {layer.stats?.map((stat) => (
                                  <div key={stat.label} className="text-center p-6 bg-slate-900/60 rounded-2xl border border-slate-700">
                                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">{stat.label}</div>
                                    <div className="text-3xl font-mono text-[#f7931a] font-semibold">{stat.value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* All features */}
                              <div className="space-y-4">
                                <h4 className="text-sm font-mono text-slate-400 mb-4 tracking-widest">ALL FEATURES</h4>
                                {layer.features.map((feature) => (
                                  <div key={feature.name} className="text-sm text-slate-400 flex items-start gap-4">
                                    <span className="text-[#f7931a] mt-1">→</span>
                                    <span className="font-mono text-slate-300">{feature.name}:</span>
                                    <span className="text-slate-500">{feature.tooltip}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Nota educativa */}
                              <div className="mt-10 p-6 bg-slate-900/50 border-l-4 border-[#f7931a] rounded-r-2xl">
                                <p className="text-sm text-slate-400">
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
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer elegante */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pt-8 border-t border-slate-800 flex items-center justify-center gap-12 text-sm text-slate-500 font-mono"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            BASE LAYER
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            LIGHTNING NETWORK
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            APPLICATIONS
          </div>
        </motion.div>

        {/* Mensaje clave final */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center mt-8 text-sm text-slate-600 font-mono tracking-widest"
        >
          ⚡ All layers work together. Lightning extends Bitcoin — it never replaces it. ⚡
        </motion.p>
      </div>
    </div>
  );
}