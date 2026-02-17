'use client';

import { ReactNode, useRef, useEffect } from 'react';
import { TerminalLine } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalWindowProps {
  lines: TerminalLine[];
  onSubmit?: (input: string) => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export function TerminalWindow({ lines, isLoading, children }: TerminalWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="bg-bitcoin-dark border-2 border-bitcoin-orange/30 rounded-lg overflow-hidden">
      {/* Terminal header */}
      <div className="bg-bitcoin-black/50 px-4 py-2 flex items-center gap-2 border-b border-bitcoin-orange/20">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-gray-500 font-mono">
            bitcoin-agent — zsh
          </span>
        </div>
      </div>

      {/* Terminal content */}
      <div className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto font-mono text-sm">
        <AnimatePresence>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`mb-3 ${
                line.type === 'input'
                  ? 'text-bitcoin-orange'
                  : line.type === 'error'
                  ? 'text-red-400'
                  : line.type === 'system'
                  ? 'text-yellow-400/70 italic'
                  : 'text-gray-300'
              }`}
            >
              {line.type === 'input' && (
                <span className="text-bitcoin-orange/50 mr-2">{'>'}</span>
              )}
              <span className="whitespace-pre-wrap">{line.content}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-yellow-400/70 italic"
          >
            <span className="mr-2">{'>'}</span>
            <span className="animate-pulse">Processing...</span>
          </motion.div>
        )}

        {children && (
          <div className="mt-4 pt-4 border-t border-bitcoin-orange/20">
            {children}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
