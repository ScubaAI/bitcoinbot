'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { TerminalLine } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';

interface TerminalWindowProps {
  lines: TerminalLine[];
  isLoading?: boolean;
  children?: ReactNode;
  className?: string;
}

export function TerminalWindow({ 
  lines, 
  isLoading, 
  children,
  className = '' 
}: TerminalWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll inteligente: solo si el usuario está cerca del bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatContent = (content: string) => {
    // Detectar bloques de código markdown ```code```
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        const firstLine = code.split('\n')[0];
        const language = firstLine && !firstLine.includes(' ') ? firstLine : 'text';
        const actualCode = firstLine && !firstLine.includes(' ') 
          ? code.slice(firstLine.length).trim() 
          : code;

        return (
          <div key={index} className="my-3 rounded bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800">
              <span className="text-xs text-slate-500 font-mono">{language}</span>
              <button 
                onClick={() => copyToClipboard(actualCode, `code-${index}`)}
                className="text-xs text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                {copiedId === `code-${index}` ? (
                  <><Check className="w-3 h-3" /> Copied</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy</>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto text-xs text-slate-300">
              <code>{actualCode}</code>
            </pre>
          </div>
        );
      }
      
      // Texto normal con links clickeables
      return (
        <span key={index}>
          {part.split(/(https?:\/\/[^\s]+)/g).map((segment, i) => 
            segment.match(/^https?:\/\//) ? (
              <a 
                key={i} 
                href={segment} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline break-all"
              >
                {segment}
              </a>
            ) : (
              segment
            )
          )}
        </span>
      );
    });
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 flex items-center gap-3 border-b border-slate-800">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-500 font-mono tracking-wider">
            bitcoin-agent@mainnet:~
          </span>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          {lines.length} msgs
        </div>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="p-4 h-[50vh] min-h-[300px] max-h-[600px] overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        aria-live="polite"
        aria-atomic="false"
      >
        {lines.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-slate-600">
            <span className="text-xs">Type a message to start...</span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {lines.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: index === lines.length - 1 ? 0 : 0 }}
              className="group relative mb-4"
            >
              {/* Timestamp (visible en hover) */}
              <span className="absolute -left-16 top-0 text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                {line.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Message content */}
              <div className={`${
                line.type === 'input'
                  ? 'text-orange-400'
                  : line.type === 'error'
                  ? 'text-red-400'
                  : line.type === 'system'
                  ? 'text-yellow-500/60 italic'
                  : 'text-slate-300'
              }`}>
                {/* Prompt */}
                {line.type === 'input' && (
                  <span className="text-orange-500/50 mr-2 select-none">{'➜'}</span>
                )}
                {line.type === 'output' && (
                  <span className="text-slate-600 mr-2 select-none">{'◆'}</span>
                )}

                {/* Text */}
                <div className="inline-block align-top max-w-full">
                  {formatContent(line.content)}
                </div>

                {/* Copy button para respuestas del bot */}
                {line.type === 'output' && (
                  <button
                    onClick={() => copyToClipboard(line.content, line.id)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-orange-400"
                    title="Copy response"
                  >
                    {copiedId === line.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-yellow-500/60"
          >
            <span className="text-slate-600">{'◆'}</span>
            <span className="flex gap-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >●</motion.span>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              >●</motion.span>
            </span>
            <span className="text-xs italic">querying the timechain...</span>
          </motion.div>
        )}

        {/* Input area */}
        {children && (
          <div className="mt-6 pt-4 border-t border-slate-800/50 sticky bottom-0 bg-slate-900/95 backdrop-blur">
            {children}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}