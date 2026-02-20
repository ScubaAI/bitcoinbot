// src/components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect, FormEvent, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TerminalWindow } from '../terminal/TerminalWindow';
import { Locale, Message, TerminalLine } from '@/types';
import { Send, Zap, Bitcoin } from 'lucide-react';

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

  const streamingContentRef = useRef('');
  const [streamingContent, setStreamingContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldScrollRef = useRef(false);

  // Inicializar mensaje de bienvenida más cálido y educativo
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: dict.welcome || (lang === 'en'
          ? "Konnichiwa, I'm Bitcoin Agent — your personal guide to the Bitcoin universe. Ask me anything: How Lightning works, why 21 million matters, sats stacking strategies, privacy tips... I'm here to educate, inspire, and empower. What would you like to explore first? ⚡"
          : "¡Hola! Soy Bitcoin Agent — tu guía personal en el universo Bitcoin. Pregúntame lo que quieras: cómo funciona Lightning, por qué 21 millones importan, estrategias de stacking sats, tips de privacidad... Estoy aquí para educarte, inspirarte y empoderarte. ¿Qué quieres explorar primero? ⚡"),
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [dict.welcome, lang, messages.length]);

  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    shouldScrollRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    streamingContentRef.current = '';

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

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let lastUpdate = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        streamingContentRef.current = fullContent;

        const now = Date.now();
        if (now - lastUpdate > 50) {
          setStreamingContent(fullContent);
          lastUpdate = now;
        }
      }

      setStreamingContent(fullContent);

      shouldScrollRef.current = true;
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
      if (error instanceof Error && error.name === 'AbortError') return;

      console.error('Chat error:', error);

      shouldScrollRef.current = true;
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
      streamingContentRef.current = '';
      abortControllerRef.current = null;
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const terminalLines = useMemo(() => {
    const lines: TerminalLine[] = messages.map((msg) => ({
      id: msg.id,
      type: msg.role === 'user' ? 'input' : 'output',
      content: msg.content,
      timestamp: msg.createdAt,
    }));

    if (isLoading) {
      if (streamingContent) {
        lines.push({
          id: 'streaming',
          type: 'output',
          content: streamingContent + '▊',
          timestamp: new Date(),
        });
      } else {
        lines.push({
          id: 'thinking',
          type: 'system',
          content: dict.thinking + '...',
          timestamp: new Date(),
        });
      }
    }

    return lines;
  }, [messages, isLoading, streamingContent, dict.thinking]);

  return (
    <section
      id="chat-section"
      className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black py-24 px-4 md:px-6 overflow-hidden scroll-mt-20"
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(247,147,26,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header invitador */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#f7931a]/20 to-amber-500/10 border border-[#f7931a]/30 rounded-3xl mb-6">
            <Zap className="w-6 h-6 text-[#f7931a] animate-pulse" />
            <span className="text-lg font-mono text-[#f7931a] tracking-wider">Bitcoin Agent Online</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-white via-[#f7931a] to-amber-300 bg-clip-text text-transparent font-mono tracking-[-1px] mb-4">
            Talk to Bitcoin Agent
          </h2>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {lang === 'en'
              ? "Your direct line to Bitcoin wisdom. Ask freely — from sats math to privacy mastery, Lightning magic to monetary sovereignty. I'm here to teach, not preach. What's on your mind? ⚡"
              : "Tu línea directa a la sabiduría Bitcoin. Pregunta sin miedo — desde matemáticas de sats hasta maestría en privacidad, magia Lightning y soberanía monetaria. Estoy aquí para enseñar, no para predicar. ¿Qué tienes en mente? ⚡"}
          </p>
        </motion.div>

        {/* Terminal principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <TerminalWindow lines={terminalLines} isLoading={isLoading}>
            <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-xl border-t border-slate-800/70 pt-5">
              <span className="text-[#f7931a] font-mono text-xl font-bold">{'>'}</span>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dict.placeholder || (lang === 'en' ? "Ask anything about Bitcoin... (e.g. 'Explain halving in simple terms')" : "Pregunta lo que sea sobre Bitcoin... (ej. 'Explica el halving fácil')")}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white font-mono text-lg outline-none placeholder:text-slate-600 caret-[#f7931a] selection:bg-[#f7931a]/30"
                autoFocus
              />

              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-[#f7931a] to-amber-500 hover:from-[#f7931a]/90 hover:to-amber-400 text-black font-mono font-bold rounded-2xl shadow-lg shadow-[#f7931a]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Thinking...</span>
                ) : (
                  <>
                    Send
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </TerminalWindow>
        </motion.div>

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}