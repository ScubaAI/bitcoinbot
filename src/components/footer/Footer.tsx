'use client';

import { motion } from 'framer-motion';
import { Locale } from '@/lib/i18n/types';
import { TranslationKeys } from '@/lib/i18n/types';
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
  Twitter,
  Terminal,
  Lock
} from 'lucide-react';

interface FooterProps {
  lang: Locale;
  dict?: TranslationKeys['footer'];
}

// Fallback dict
const defaultDict = {
  en: {
    resources: "Essential Reading",
    documentation: "Developer Docs",
    protocol: "Bitcoin Whitepaper",
    lightning: "Lightning Paper",
    books: "Security Guide",
    disclaimer: "This is educational software. Not financial advice.",
    copyright: "© 2024 Bitcoin Agent. Open source under MIT license.",
    builtBy: "Built by",
    contact: "Contact",
    mission: "Mission",
    missionText: "Democratizing Bitcoin education through AI, one community at a time.",
    system: "System",
    dashboard: "Immune Dashboard",
    beacon: "Native Beacon",
    challenge: "Challenge Zone"
  },
  es: {
    resources: "Lectura Esencial",
    documentation: "Docs para Desarrolladores",
    protocol: "Whitepaper de Bitcoin",
    lightning: "Paper de Lightning",
    books: "Guía de Seguridad",
    disclaimer: "Este es software educativo. No es consejo financiero.",
    copyright: "© 2024 Bitcoin Agent. Código abierto bajo licencia MIT.",
    builtBy: "Construido por",
    contact: "Contacto",
    mission: "Misión",
    missionText: "Democratizando la educación Bitcoin mediante IA, una comunidad a la vez.",
    system: "Sistema",
    dashboard: "Panel Inmune",
    beacon: "Beacon Nativo",
    challenge: "Zona de Desafíos"
  }
};

export function Footer({ lang, dict }: FooterProps) {
  const t = dict || defaultDict[lang];

  const resources = [
    {
      title: t.protocol,
      href: 'https://bitcoin.org/bitcoin.pdf',
      icon: BookOpen,
      desc: lang === 'en' ? 'Satoshi Nakamoto' : 'Satoshi Nakamoto'
    },
    {
      title: t.lightning,
      href: 'https://lightning.network/lightning-network-paper.pdf',
      icon: Zap,
      desc: 'Poon & Dryja'
    },
    {
      title: t.books,
      href: 'https://github.com/BlockchainCommons/SecuringBitcoin',
      icon: Shield,
      desc: lang === 'en' ? 'Security best practices' : 'Mejores prácticas de seguridad'
    },
  ];

  const docs = [
    {
      title: 'Bitcoin Developer Docs',
      href: 'https://developer.bitcoin.org',
      desc: lang === 'en' ? 'Reference documentation' : 'Documentación de referencia'
    },
    {
      title: 'Lightning Engineering',
      href: 'https://docs.lightning.engineering',
      desc: 'LND, Core Lightning'
    },
    {
      title: 'Saylor Academy',
      href: 'https://learn.saylor.org',
      desc: lang === 'en' ? 'Free Bitcoin courses' : 'Cursos gratuitos de Bitcoin'
    },
  ];

  const systemLinks = [
    {
      title: t.dashboard,
      href: `/${lang}/satoshi/immune-dashboard`,
      icon: Shield,
      desc: lang === 'en' ? 'Security monitoring' : 'Monitoreo de seguridad',
    },
    {
      title: t.beacon,
      href: `/${lang}/satoshi/beacon/native`,
      icon: Zap,
      desc: lang === 'en' ? 'On-chain signaling' : 'Señalización on-chain',
    },
    {
      title: t.challenge,
      href: `/${lang}/challenge/pow`,
      icon: Terminal,
      desc: lang === 'en' ? 'Proof of Work' : 'Prueba de Trabajo',
    },
  ];

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Main grid - 5 columnas en desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand & Mission */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <span className="text-slate-950 font-bold text-lg">₿</span>
              </div>
              <span className="text-white font-bold font-mono text-lg">Bitcoin Agent</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {t.missionText}
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://github.com/yourorg/bitcoin-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Github className="w-4 h-4" />
                </div>
              </a>
              <a
                href="https://twitter.com/visionaryailat"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Twitter className="w-4 h-4" />
                </div>
              </a>
              <a
                href="mailto:aisynths@proton.me"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-orange-500/50 transition-all"
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Mail className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>

          {/* Essential Reading */}
          <div>
            <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-500" />
              {t.resources}
            </h3>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.title}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 text-sm hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <resource.icon className="w-4 h-4 text-slate-500 group-hover:text-orange-400 mt-0.5 transition-colors" />
                    <div>
                      <div className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-1">
                        {resource.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-slate-500">{resource.desc}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Docs */}
          <div>
            <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-500" />
              {t.documentation}
            </h3>
            <ul className="space-y-3">
              {docs.map((doc) => (
                <li key={doc.title}>
                  <a
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 text-sm hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-500 group-hover:text-orange-400 mt-0.5 transition-colors" />
                    <div>
                      <div className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-1">
                        {doc.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-slate-500">{doc.desc}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* System Navigation - NUEVO */}
          <div>
            <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" />
              {t.system}
            </h3>
            <ul className="space-y-3">
              {systemLinks.map((link) => (
                <li key={link.title}>
                  <a
                    href={link.href}
                    className="group flex items-start gap-3 text-sm hover:bg-slate-900/50 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <link.icon className="w-4 h-4 text-slate-500 group-hover:text-orange-400 mt-0.5 transition-colors" />
                    <div>
                      <div className="text-slate-300 group-hover:text-white transition-colors flex items-center gap-1">
                        {link.title}
                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30 font-mono">
                          APP
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">{link.desc}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Powered by */}
          <div>
            <h3 className="text-white font-mono font-bold mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-orange-500" />
              {t.contact}
            </h3>

            <div className="space-y-4">
              {/* Powered by VisionaryAI */}
              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  {t.builtBy}
                </div>
                <a
                  href="https://visionaryai.lat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-lg font-bold text-white hover:text-orange-400 transition-colors"
                >
                  VisionaryAI.lat
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                <p className="text-xs text-slate-400 mt-2">
                  {lang === 'en'
                    ? 'AI solutions for the circular economy'
                    : 'Soluciones IA para la economía circular'}
                </p>
              </div>

              {/* Email contact */}
              <a
                href="mailto:aisynths@proton.me"
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-orange-500/30 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white group-hover:text-orange-400 transition-colors truncate">
                    aisynths@proton.me
                  </div>
                  <div className="text-xs text-slate-500">
                    {lang === 'en' ? 'Email us' : 'Escríbenos'}
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs text-center md:text-left">
              {t.copyright}
            </p>

            <div className="flex items-center gap-6 text-xs text-slate-600">
              <span className="italic">{t.disclaimer}</span>
              <span className="hidden md:inline">•</span>
              <a href="/privacy" className="hover:text-slate-400 transition-colors">
                {lang === 'en' ? 'Privacy' : 'Privacidad'}
              </a>
              <a href="/terms" className="hover:text-slate-400 transition-colors">
                {lang === 'en' ? 'Terms' : 'Términos'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}