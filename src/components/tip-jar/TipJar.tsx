'use client';

import { useState } from 'react';
import { Locale } from '@/types';
import { Zap, Copy, Check } from 'lucide-react';

interface TipJarProps {
  lang: Locale;
  dict: {
    title: string;
    description: string;
    button: string;
    success: string;
    error: string;
  };
}

export function TipJar({ lang, dict }: TipJarProps) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Example Lightning address (replace with your own)
  const lightningAddress = 'your@lightning.address';

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTip = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 100, // 100 sats
          recipient: lightningAddress,
        }),
      });

      if (response.ok) {
        alert(dict.success);
      } else {
        alert(dict.error);
      }
    } catch (error) {
      console.error('Tip error:', error);
      alert(dict.error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="py-16 bg-bitcoin-black/50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bitcoin-orange/20 border-2 border-bitcoin-orange mb-6">
          <Zap className="w-8 h-8 text-bitcoin-orange" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4 font-mono">
          {dict.title}
        </h2>

        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          {dict.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Lightning Address Display */}
          <div className="flex items-center gap-2 bg-bitcoin-dark border border-bitcoin-orange/30 rounded-lg px-4 py-2">
            <span className="text-bitcoin-orange font-mono text-sm">
              {lightningAddress}
            </span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-bitcoin-orange/10 rounded transition-colors"
              title={lang === 'en' ? 'Copy address' : 'Copiar dirección'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Tip Button */}
          <button
            onClick={handleTip}
            disabled={isProcessing}
            className="px-6 py-2 bg-bitcoin-orange text-bitcoin-black font-bold rounded-lg hover:bg-bitcoin-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isProcessing
              ? lang === 'en'
                ? 'Processing...'
                : 'Procesando...'
              : dict.button}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          {lang === 'en'
            ? 'Powered by Blink (formerly Cashu)'
            : 'Impulsado por Blink (antes Cashu)'}
        </p>
      </div>
    </section>
  );
}
