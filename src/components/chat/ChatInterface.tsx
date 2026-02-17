'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
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
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showWelcome) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: dict.welcome,
        createdAt: new Date(),
      };
      setMessages([welcomeMessage]);
      setShowWelcome(false);
    }
  }, [dict.welcome, showWelcome]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const thinkingId = 'thinking';
    const thinkingLine: TerminalLine = {
      id: thinkingId,
      type: 'system',
      content: dict.thinking,
      timestamp: new Date(),
    };

    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        role: 'assistant',
        content: dict.thinking,
        createdAt: new Date(),
      },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Remove thinking message and add actual response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== thinkingId),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== thinkingId),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'An error occurred. Please try again.',
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const terminalLines: TerminalLine[] = messages.map((msg) => ({
    id: msg.id,
    type: msg.role === 'user' ? 'input' : 'output',
    content: msg.content,
    timestamp: msg.createdAt,
  }));

  return (
    <section id="chat-section" className="min-h-screen bg-bitcoin-black py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white font-mono mb-2">
            > Bitcoin_Agent
          </h2>
          <p className="text-gray-400 text-sm">
            {lang === 'en' ? 'Interactive Terminal' : 'Terminal Interactivo'}
          </p>
        </div>

        <TerminalWindow lines={terminalLines} onSubmit={handleSubmit} isLoading={isLoading}>
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
              {lang === 'en' ? 'Send' : 'Enviar'}
            </button>
          </form>
        </TerminalWindow>

        <div ref={messagesEndRef} />
      </div>
    </section>
  );
}
