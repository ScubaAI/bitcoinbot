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
    bgColor: 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
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
    bgColor: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
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
    <div className="w-full max-w-4xl mx-auto">
      {/* Header educativo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 mb-4">
          <Layers className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-mono text-slate-300">{t.title}</span>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
      </motion.div>

      {/* Mensaje educativo destacado sobre Lightning */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3"
      >
        <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          {t.tip}
        </p>
      </motion.div>

      {/* Visualización de capas como edificio */}
      <div className="relative bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-6 md:p-8 overflow-hidden">

        {/* Fondo de rejilla */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f7931a 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Capas visuales tipo edificio */}
        <div className="relative z-10 space-y-4">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            const isExpanded = expandedLayer === layer.id;
            const isLightning = layer.id === 'l2'; // Especial atención a Lightning

            return (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Línea conectora */}
                {index < layers.length - 1 && (
                  <div className="absolute left-8 -bottom-4 w-px h-4 bg-gradient-to-b from-orange-500/30 to-transparent" />
                )}

                {/* Tarjeta de capa */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                  className={`
                    group relative p-5 rounded-xl border-2 transition-all cursor-pointer
                    ${layer.bgColor}
                    ${isLightning ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' : ''}
                  `}
                >
                  {/* Badge "Built on Bitcoin" para Lightning */}
                  {isLightning && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-blue-500 text-white text-xs font-mono rounded-full shadow-lg flex items-center gap-1 z-20">
                      <Bitcoin className="w-3 h-3" />
                      <span>Built on Bitcoin</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`
                      p-3 rounded-xl bg-slate-800 border-2 transition-all
                      ${isLightning ? 'border-blue-500/50' : 'border-slate-700 group-hover:border-orange-500/30'}
                    `}>
                      <Icon className={`w-6 h-6 ${layer.color}`} />
                    </div>

                    {/* Contenido principal */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xl font-bold font-mono flex items-center gap-2 ${layer.color}`}>
                          {lang === 'es' ? layer.esName : layer.name}
                          {isLightning && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                              L2
                            </span>
                          )}
                        </h3>

                        {/* Indicador de expansión */}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="text-slate-500"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </motion.div>
                      </div>

                      {/* Descripción */}
                      <p className="text-slate-300 text-sm mb-3">
                        {layer.description[lang]}
                      </p>

                      {/* Analogía (siempre visible) */}
                      <div className="text-xs text-slate-500 italic flex items-start gap-2 mb-2">
                        <span className="text-slate-600">💡</span>
                        <span>{layer.analogy[lang]}</span>
                      </div>

                      {/* Features (visibles siempre en versión simplificada) */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {layer.features.slice(0, 3).map((feature) => (
                          <div
                            key={feature.name}
                            className="relative"
                            onMouseEnter={() => setHoveredFeature(feature.name)}
                            onMouseLeave={() => setHoveredFeature(null)}
                          >
                            <span className={`
                              text-xs px-2 py-1 rounded-full border font-mono transition-all cursor-help
                              ${hoveredFeature === feature.name
                                ? 'bg-slate-700 border-slate-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                              }
                            `}>
                              {feature.name}
                              <HelpCircle className="inline w-3 h-3 ml-1 opacity-50" />
                            </span>

                            {/* Tooltip */}
                            <AnimatePresence>
                              {hoveredFeature === feature.name && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-30 bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300 shadow-xl"
                                >
                                  {feature.tooltip}
                                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-800 border-r border-b border-slate-600 rotate-45" />
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
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              {/* Stats grid */}
                              <div className="grid grid-cols-3 gap-3 mb-4">
                                {layer.stats?.map((stat) => (
                                  <div key={stat.label} className="text-center p-2 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                                    <div className="text-sm font-mono text-orange-400">{stat.value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Todas las features con tooltips */}
                              <div className="space-y-2">
                                <h4 className="text-xs font-mono text-slate-500 mb-2">All Features:</h4>
                                {layer.features.map((feature) => (
                                  <div key={feature.name} className="text-xs text-slate-400 flex items-start gap-2">
                                    <span className="text-orange-500">→</span>
                                    <span className="font-mono">{feature.name}:</span>
                                    <span className="text-slate-500">{feature.tooltip}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Nota educativa específica */}
                              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-xs text-slate-400">
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

        {/* Footer educativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-600"
        >
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3" />
            <span>Base Layer</span>
          </div>
          <div className="w-6 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-blue-500" />
            <span className="text-blue-400/70">Lightning Network</span>
          </div>
          <div className="w-6 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3" />
            <span>Applications</span>
          </div>
        </motion.div>

        {/* Mensaje clave final */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs text-slate-700 mt-4 font-mono"
        >
          ⚡ All layers work together. Lightning doesn't replace Bitcoin — it extends it. ⚡
        </motion.p>
      </div>
    </div>
  );
}