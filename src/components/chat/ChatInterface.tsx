'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '../terminal/TerminalWindow';
import { Locale, Message, TerminalLine } from '@/types';

interface ChatInterfaceProps {
  lang: Locale;
  dict: {
    placeholder: string;
    thinking: string;
    welcome: string;
  };
}

export function ChatInterface({ lang, dict }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Inicializar mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: dict.welcome,
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [dict.welcome]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    const apiMessages = [...messages, userMessage]
      .filter((m) => m.id !== 'welcome')
      .map(({ role, content }) => ({ role, content }));

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          lang,
          useRAG: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setStreamingContent(fullContent);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullContent,
          createdAt: new Date(),
        },
      ]);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

      console.error('Chat error:', error);
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: lang === 'en' 
            ? '⚠️ Error: Could not connect to Bitcoin Agent. Please try again.' 
            : '⚠️ Error: No pude conectar con Bitcoin Agent. Intenta de nuevo.',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const terminalLines: TerminalLine[] = messages.map((msg) => ({
    id: msg.id,
    type: msg.role === 'user' ? 'input' : 'output',
    content: msg.content,
    timestamp: msg.createdAt,
  }));

  if (isLoading && streamingContent) {
    terminalLines.push({
      id: 'streaming',
      type: 'output',
      content: streamingContent + '▊',
      timestamp: new Date(),
    });
  } else if (isLoading && !streamingContent) {
    terminalLines.push({
      id: 'thinking',
      type: 'system',
      content: dict.thinking + '...',
      timestamp: new Date(),
    });
  }

  return (
    <section id="chat-section" className="min-h-screen bg-slate-950 relative overflow-hidden py-20 px-4">
      {/* Background masterpiece */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.12)_0%,transparent_70%)]" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#f7931a 1px, transparent 1px), linear-gradient(90deg, #f7931a 1px, transparent 1px)`,
          backgroundSize: '72px 72px'
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header arte digital */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-4 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-xl shadow-orange-500/50">
              ₿
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-white via-orange-300 to-amber-300 bg-clip-text text-transparent font-mono tracking-[-2px]">
              Bitcoin_Agent
            </h2>
          </div>
          <p className="text-slate-400 text-lg font-light tracking-wide">
            {lang === 'en' ? 'Interactive Terminal' : 'Terminal Interactivo'}
          </p>
        </motion.div>

        {/* Terminal premium glass */}
        <div className="relative group">
          <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 rounded-[2.75rem] blur-3xl opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <div className="relative bg-slate-950/90 backdrop-blur-3xl border border-orange-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden">
            <TerminalWindow lines={terminalLines} isLoading={isLoading}>
              <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-t border-orange-500/20 bg-slate-950/80">
                <span className="text-orange-500 font-mono text-xl select-none">›</span>
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={dict.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white font-mono text-lg outline-none placeholder:text-slate-600 focus:placeholder:text-slate-500"
                  autoFocus
                />
                
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="group relative px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold font-mono rounded-2xl transition-all shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/60 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                >
                  {isLoading ? (
                    <span className="animate-pulse">⋯</span>
                  ) : (
                    lang === 'en' ? 'SEND' : 'ENVIAR'
                  )}
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </form>
            </TerminalWindow>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}