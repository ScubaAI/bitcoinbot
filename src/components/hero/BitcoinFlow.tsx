'use client';

import { motion } from 'framer-motion';

const blocks = [
  { id: 'pow', label: 'Proof of Work', x: 0, y: 0 },
  { id: 'block', label: 'Block', x: 150, y: 0 },
  { id: 'chain', label: 'Blockchain', x: 300, y: 0 },
  { id: 'lightning', label: 'Lightning', x: 150, y: 120 },
  { id: 'wallet', label: 'Wallet', x: 300, y: 120 },
];

const connections = [
  { from: 'pow', to: 'block' },
  { from: 'block', to: 'chain' },
  { from: 'chain', to: 'lightning' },
  { from: 'lightning', to: 'wallet' },
];

export function BitcoinFlow() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 500 200" className="w-full h-auto">
        {/* Connection lines */}
        {connections.map((conn, i) => {
          const from = blocks.find((b) => b.id === conn.from)!;
          const to = blocks.find((b) => b.id === conn.to)!;
          
          return (
            <motion.line
              key={i}
              x1={from.x + 60}
              y1={from.y + 25}
              x2={to.x}
              y2={to.y + 25}
              stroke="#f7931a"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: i * 0.3 }}
            />
          );
        })}

        {/* Animated data flow */}
        {connections.map((conn, i) => {
          const from = blocks.find((b) => b.id === conn.from)!;
          const to = blocks.find((b) => b.id === conn.to)!;
          
          return (
            <motion.circle
              key={`flow-${i}`}
              r="4"
              fill="#f7931a"
              initial={{ cx: from.x + 60, cy: from.y + 25 }}
              animate={{ cx: [from.x + 60, to.x], cy: [from.y + 25, to.y + 25] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'linear',
              }}
            />
          );
        })}

        {/* Blocks */}
        {blocks.map((block, i) => (
          <motion.g
            key={block.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <rect
              x={block.x}
              y={block.y}
              width="120"
              height="50"
              rx="8"
              fill="#1a1a1a"
              stroke="#f7931a"
              strokeWidth="2"
            />
            <text
              x={block.x + 60}
              y={block.y + 30}
              textAnchor="middle"
              fill="#f7931a"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {block.label}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-4 text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-bitcoin-orange/30 rounded" />
          <span>On-Chain</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-bitcoin-orange/60 rounded" />
          <span>Off-Chain</span>
        </div>
      </div>
    </div>
  );
}
