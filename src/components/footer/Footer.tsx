'use client';

import { motion } from 'framer-motion';
import { Locale } from '@/lib/i18n/types';
import { TranslationKeys } from '@/lib/i18n/types';
import fallbackDict from '@/lib/i18n/en.json';
import {
  BookOpen,
  Globe,
  Shield,
  Code,
  Zap,
  Mail,
  ExternalLink,
  Heart,
  Github,
  Twitter
} from 'lucide-react';

interface FooterProps {
  lang: Locale;
  dict?: TranslationKeys['footer'];
}

export function Footer({ lang, dict }: FooterProps) {
  const t = dict || fallbackDict.footer;

  const resources = [
    { title: t.protocol, href: 'https://bitcoin.org/bitcoin.pdf', icon: BookOpen, desc: 'Satoshi Nakamoto' },
    { title: t.lightning, href: 'https://lightning.network/lightning-network-paper.pdf', icon: Zap, desc: 'Poon & Dryja' },
    { title: t.books, href: 'https://github.com/BlockchainCommons/SecuringBitcoin', icon: Shield, desc: lang === 'en' ? 'Security best practices' : 'Mejores prácticas de seguridad' },
  ];

  const docs = [
    { title: 'Bitcoin Developer Docs', href: 'https://developer.bitcoin.org', desc: lang === 'en' ? 'Reference documentation' : 'Documentación de referencia' },
    { title: 'Lightning Engineering', href: 'https://docs.lightning.engineering', desc: 'LND, Core Lightning' },
    { title: 'Saylor Academy', href: 'https://learn.saylor.org', desc: lang === 'en' ? 'Free Bitcoin courses' : 'Cursos gratuitos de Bitcoin' },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/70">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7931a]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">

          {/* Columna 1: Identidad + Misión + Socials */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f7931a] to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-2xl">₿</span>
              </div>
              <span className="text-white font-bold font-mono text-2xl tracking-tight">Bitcoin Agent</span>
            </div>

            <p className="text-slate-400 leading-relaxed mb-8">
              {t.missionText}
            </p>

            <div className="flex gap-4">
              <a href="https://github.com/yourorg/bitcoin-agent" target="_blank" className="text-slate-500 hover:text-[#f7931a] transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/visionaryailat" target="_blank" className="text-slate-500 hover:text-[#f7931a] transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:aisynths@proton.me" className="text-slate-500 hover:text-[#f7931a] transition">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Lectura esencial */}
          <div>
            <h3 className="text-lg font-mono font-semibold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#f7931a]" />
              {t.resources}
            </h3>
            <ul className="space-y-4">
              {resources.map(r => (
                <li key={r.title}>
                  <a href={r.href} target="_blank" className="group flex items-center gap-3 text-slate-400 hover:text-white transition">
                    <r.icon className="w-4 h-4 text-slate-600 group-hover:text-[#f7931a]" />
                    <span className="group-hover:underline">{r.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Docs + Contacto */}
          <div>
            <h3 className="text-lg font-mono font-semibold text-white mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#f7931a]" />
              {t.documentation}
            </h3>
            <ul className="space-y-4 mb-10">
              {docs.map(d => (
                <li key={d.title}>
                  <a href={d.href} target="_blank" className="group flex items-center gap-3 text-slate-400 hover:text-white transition">
                    <Globe className="w-4 h-4 text-slate-600 group-hover:text-[#f7931a]" />
                    <span className="group-hover:underline">{d.title}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                {t.builtBy}
              </div>
              <a href="https://visionaryai.lat" target="_blank" className="text-[#f7931a] hover:text-amber-300 font-medium transition">
                VisionaryAI.lat
              </a>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en' ? 'AI for circular economies' : 'IA para economías circulares'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar - más minimal */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-slate-600">
              {t.copyright} • <span className="italic">{t.disclaimer}</span>
            </p>

            <div className="flex gap-6 text-slate-600">
              <a href="/privacy" className="hover:text-slate-300 transition">Privacy</a>
              <a href="/terms" className="hover:text-slate-300 transition">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}