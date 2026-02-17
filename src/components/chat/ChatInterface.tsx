'use client';

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
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

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    // Actualizar UI: agregar mensaje usuario + estado "pensando"
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Preparar mensajes para API (solo user/assistant, sin system)
    const apiMessages = [...messages, userMessage]
      .filter((m) => m.id !== 'welcome') // Excluir welcome de la conversación
      .map(({ role, content }) => ({ role, content }));

    // Crear nuevo abort controller
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

      // Procesar stream
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

      // Agregar mensaje completo a la lista
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

  // Construir líneas del terminal
  const terminalLines: TerminalLine[] = messages.map((msg) => ({
    id: msg.id,
    type: msg.role === 'user' ? 'input' : 'output',
    content: msg.content,
    timestamp: msg.createdAt,
  }));

  // Agregar línea de streaming si está activo
  if (isLoading && streamingContent) {
    terminalLines.push({
      id: 'streaming',
      type: 'output',
      content: streamingContent + '▊', // Cursor block
      timestamp: new Date(),
    });
  } else if (isLoading && !streamingContent) {
    // Estado "pensando" inicial
    terminalLines.push({
      id: 'thinking',
      type: 'system',
      content: dict.thinking + '...',
      timestamp: new Date(),
    });
  }

  return (
    <section id="chat-section" className="min-h-screen bg-bitcoin-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white font-mono mb-2">
            {'>'} Bitcoin_Agent
          </h2>
          <p className="text-gray-400 text-sm">
            {lang === 'en' ? 'Interactive Terminal' : 'Terminal Interactivo'}
          </p>
        </div>

        <TerminalWindow lines={terminalLines} isLoading={isLoading}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <span className="text-bitcoin-orange font-mono">{'>'}</span>
            <input
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
              className="px-4 py-1 bg-bitcoin-orange text-bitcoin-black font-mono text-sm font-bold rounded hover:bg-bitcoin-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                lang === 'en' ? 'Send' : 'Enviar'
              )}
            </button>
          </form>
        </TerminalWindow>

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}