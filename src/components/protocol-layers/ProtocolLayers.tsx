'use client';

import { motion } from 'framer-motion';
import { Database, Zap, Globe, Lock } from 'lucide-react';

interface ProtocolLayersProps {
  lang?: 'en' | 'es';
}

const layers = [
  {
    id: 'l1',
    name: 'Base Layer',
    esName: 'Capa Base',
    icon: Database,
    color: 'from-orange-600 to-orange-500',
    description: {
      en: 'Settlement & finality. Immutable ledger secured by proof-of-work.',
      es: 'Liquidación y finalidad. Libro inmutable asegurado por proof-of-work.'
    },
    features: ['Proof-of-Work', '21M cap', 'Decentralized consensus'],
  },
  {
    id: 'l2',
    name: 'Lightning Network',
    esName: 'Lightning',
    icon: Zap,
    color: 'from-blue-600 to-cyan-500',
    description: {
      en: 'Instant payments at scale. Millions of txs/sec off-chain.',
      es: 'Pagos instantáneos a escala. Millones de tx/seg fuera de la cadena.'
    },
    features: ['Payment Channels', 'Atomic Swaps', 'Micro-payments'],
  },
  {
    id: 'l3',
    name: 'Application Layer',
    esName: 'Aplicaciones',
    icon: Globe,
    color: 'from-purple-600 to-pink-500',
    description: {
      en: 'Wallets, services, and protocols built on top.',
      es: 'Wallets, servicios y protocolos construidos encima.'
    },
    features: ['Non-custodial wallets', 'DLCs', 'RGB/Taproot Assets'],
  },
];

export function ProtocolLayers({ lang = 'en' }: ProtocolLayersProps) {
  return (
    <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6 text-slate-400 text-sm font-mono">
        <Lock className="w-4 h-4" />
        <span>Open Protocol Stack</span>
      </div>

      <div className="space-y-4">
        {layers.map((layer, index) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.2 }}
            className="relative group"
          >
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${layer.color} shadow-lg`}>
                <layer.icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white font-mono">
                    {lang === 'es' ? layer.esName : layer.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">L{index + 1}</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">
                  {layer.description[lang]}
                </p>
                <div className="flex flex-wrap gap-2">
                  {layer.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-2 py-1 bg-slate-900 rounded text-slate-500 font-mono"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {index < layers.length - 1 && (
              <div className="absolute left-8 -bottom-4 w-px h-4 bg-gradient-to-b from-slate-600 to-slate-700" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
