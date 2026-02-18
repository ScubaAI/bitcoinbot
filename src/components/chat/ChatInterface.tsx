// src/components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect, FormEvent, useCallback, useMemo } from 'react';
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
  
  // Usar ref para streaming en lugar de state para evitar re-renders intermedios
  const streamingContentRef = useRef('');
  const [streamingContent, setStreamingContent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track si debemos scrollear (solo en nuevos mensajes, no en cada chunk)
  const shouldScrollRef = useRef(false);

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
  }, [dict.welcome, messages.length]);

  // Scroll solo cuando cambian los mensajes completos (no en streaming)
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

    // Marcar para scroll al agregar mensaje de usuario
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Procesar stream con throttling para UI
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

        // Throttle: actualizar UI máximo cada 50ms para evitar lag
        const now = Date.now();
        if (now - lastUpdate > 50) {
          setStreamingContent(fullContent);
          lastUpdate = now;
        }
      }

      // Asegurar último contenido
      setStreamingContent(fullContent);

      // Agregar mensaje completo y marcar para scroll
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
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }

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

  // Construir líneas del terminal con useMemo para evitar recreación en cada render
  const terminalLines = useMemo(() => {
    const lines: TerminalLine[] = messages.map((msg) => ({
      id: msg.id,
      type: msg.role === 'user' ? 'input' : 'output',
      content: msg.content,
      timestamp: msg.createdAt,
    }));

    // Agregar línea de streaming si está activo
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
    <section id="chat-section" className="min-h-screen bg-slate-950 py-16 px-4 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white font-mono mb-2">
            {'>'} Bitcoin_Agent
          </h2>
          <p className="text-gray-400 text-sm">
            {lang === 'en' ? 'Interactive Terminal' : 'Terminal Interactivo'}
          </p>
        </div>

        <div ref={containerRef}>
          <TerminalWindow lines={terminalLines} isLoading={isLoading}>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <span className="text-orange-500 font-mono">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={dict.placeholder}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white font-mono outline-none placeholder:text-gray-600"
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-1 bg-orange-500 text-slate-950 font-mono text-sm font-bold rounded hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  lang === 'en' ? 'Send' : 'Enviar'
                )}
              </button>
            </form>
          </TerminalWindow>
        </div>

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}