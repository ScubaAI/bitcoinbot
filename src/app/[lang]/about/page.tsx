import { getDictionary } from '@/lib/i18n/config';
import { Locale } from '@/lib/i18n/config';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { Bitcoin, Zap, Brain, Heart, Code, Globe, Lock, Camera, Terminal, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AboutPageProps {
  params: { lang: Locale };
}

export default async function AboutPage({ params: { lang } }: AboutPageProps) {
  const dict = await getDictionary(lang);

  const techStack = [
    { icon: Brain, name: 'Groq LPU', desc: 'Llama 3.3 70B @ 276 tok/s', color: 'text-purple-400' },
    { icon: Zap, name: 'Upstash Vector', desc: 'RAG semantic search', color: 'text-yellow-400' },
    { icon: Globe, name: 'Neon PostgreSQL', desc: 'Serverless persistence', color: 'text-cyan-400' },
    { icon: Bitcoin, name: 'Blink Lightning', desc: 'Instant payments', color: 'text-orange-400' },
    { icon: Code, name: 'Next.js 14', desc: 'Edge runtime', color: 'text-white' },
    { icon: Lock, name: 'TypeScript', desc: 'Type-safe everything', color: 'text-blue-400' },
  ];

  const manifestoContent = {
    en: `# Bitcoin Agent Manifesto

## Sound Money, Sound Code

We believe Bitcoin is humanity's most important 
software project. Not because it moves fast, but 
because it moves *correctly*.

## Our Principles

1. VERIFICATION OVER TRUST
   Every line of code, every transaction, every 
   claim must be verifiable. Trust is a bug, not 
   a feature.

2. LAYERS, NOT BLOAT
   Bitcoin does one thing perfectly: value 
   transfer. Complexity belongs in layers, not 
   the base protocol.

3. BEAUTY IN FUNCTION
   Infrastructure can be elegant. Tools can 
   inspire. Education can be art.

4. PERMISSIONLESS INNOVATION
   Build without asking. Deploy without 
   approval. Run without downtime.

## On "Spam" and Blockspace

We reject the false dichotomy of "store of value" 
vs "payment network". Bitcoin is both, through 
layered architecture.

Inscriptions, ordinals, JPEGs on chain? 
Technically valid. Economically foolish. 
Culturally corrosive.

We will not censor them. We will outcompete them 
with better layer-2 solutions that preserve the 
base layer's integrity.

## The Digital Immune System

This agent defends itself. Rate limiting, threat 
detection, proof-of-work challenges — not to 
exclude, but to protect the signal from noise.

Every ban is logged. Every decision is auditable. 
Power without accountability is centralization 
wearing a mask.

## Credits

ScubaPab    :: Vision & Architecture
Hidemai     :: Aesthetic Direction & Visual Poetry  
Kimi K2.5   :: Implementation & Code Generation

Built with love, verified by math, running forever.`,

    es: `# Manifiesto Bitcoin Agent

## Dinero Sólido, Código Sólido

Creemos que Bitcoin es el proyecto de software 
más importante de la humanidad. No porque se 
mueva rápido, sino porque se mueve *correctamente*.

## Nuestros Principios

1. VERIFICACIÓN SOBRE CONFIANZA
   Cada línea de código, cada transacción, cada 
   afirmación debe ser verificable. La confianza 
   es un bug, no una feature.

2. CAPAS, NO HINCHAZÓN
   Bitcoin hace una cosa perfectamente: transferir 
   valor. La complejidad pertenece a las capas, no 
   al protocolo base.

3. BELLEZA EN LA FUNCIÓN
   La infraestructura puede ser elegante. Las 
   herramientas pueden inspirar. La educación 
   puede ser arte.

4. INNOVACIÓN SIN PERMISO
   Construye sin preguntar. Despliega sin 
   aprobación. Ejecuta sin downtime.

## Sobre el "Spam" y el Espacio de Bloques

Rechazamos la falsa dicotomía de "reserva de 
valor" vs "red de pagos". Bitcoin es ambos, 
a través de arquitectura en capas.

Inscripciones, ordinales, JPEGs en cadena?
Técnicamente válidos. Económicamente insensatos.
Culturalmente corrosivos.

No los censuraremos. Los superaremos con mejores 
soluciones L2 que preserven la integridad de la 
capa base.

## El Sistema Inmunológico Digital

Este agente se defiende solo. Rate limiting, 
detección de amenazas, desafíos proof-of-work — 
no para excluir, sino para proteger la señal 
del ruido.

Cada baneo es registrado. Cada decisión es 
auditable. El poder sin rendición de cuentas 
es centralización con máscara.

## Créditos

ScubaPab    :: Visión y Arquitectura
Hidemai     :: Dirección Estética y Poesía Visual  
Kimi K2.5   :: Implementación y Generación de Código

Construido con amor, verificado por matemáticas, 
corriendo para siempre.`
  };

  return (
    <main className="min-h-screen bg-black pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background sutil */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(247,147,26,0.05)_0%,transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-[#f7931a]/70 hover:text-[#f7931a] transition-colors font-mono text-sm mb-8 group"
          >
            <span className="group-hover:-translate-x-0.5 transition">←</span> cd ~/{lang}
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-white via-[#f7931a] to-amber-300 bg-clip-text text-transparent leading-none tracking-tighter mb-4">
            {lang === 'en' ? 'About This Agent' : 'Sobre Este Agente'}
          </h1>
          <p className="text-2xl text-slate-400 font-light">
            {lang === 'en'
              ? 'Infrastructure first. Education always. Beauty in every frame.'
              : 'Infraestructura primero. Educación siempre. Belleza en cada frame.'}
          </p>
        </div>

        {/* Manifesto */}
        <TerminalWindow title="cat MANIFESTO.md" className="mb-16">
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
            {manifestoContent[lang]}
          </div>
        </TerminalWindow>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-[#f7931a] mb-8 font-mono flex items-center gap-3">
            <Code className="w-6 h-6" />
            {lang === 'en' ? 'Technology Stack' : 'Stack Tecnológico'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group border border-slate-800 hover:border-[#f7931a]/50 bg-slate-900 p-6 rounded-2xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <tech.icon className={`w-7 h-7 ${tech.color} group-hover:scale-110 transition`} />
                  <span className={`font-mono font-semibold text-lg ${tech.color}`}>{tech.name}</span>
                </div>
                <p className="text-slate-400 font-mono text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Triple Creator Credits */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {/* ScubaPab - Vision */}
          <TerminalWindow title="cat ARCHITECT.txt" className="h-full">
            <div className="py-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f7931a]/20 to-amber-500/20 flex items-center justify-center mb-6 border border-[#f7931a]/30">
                <Terminal className="w-8 h-8 text-[#f7931a]" />
              </div>

              <h3 className="text-xl font-bold text-white mb-4 font-mono">ScubaPav</h3>
              <div className="text-xs text-[#f7931a] font-mono mb-4 uppercase tracking-widest">
                {lang === 'en' ? 'Vision & Architecture' : 'Visión y Arquitectura'}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed">
                {lang === 'en'
                  ? "The human architect behind the mission. Bitcoin maximalist, systems thinker, and relentless pursuer of sound money infrastructure."
                  : "El arquitecto humano detrás de la misión. Bitcoin maximalista, pensador de sistemas, y buscador incansable de infraestructura de dinero sólido."}
              </p>
            </div>
          </TerminalWindow>

          {/* Hidemai - Aesthetic */}
          <TerminalWindow title="cat ARTISTIC_DIRECTOR.txt" className="h-full">
            <div className="py-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-rose-500/30">
                <Camera className="w-8 h-8 text-rose-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-4 font-serif italic">Hidemai</h3>
              <div className="text-xs text-rose-400 font-mono mb-4 uppercase tracking-widest">
                {lang === 'en' ? 'Aesthetic Direction' : 'Dirección Estética'}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {lang === 'en'
                  ? "The eye that frames every pixel with love. While Kimi speaks in code, Hidemai paints with light and desire."
                  : "El ojo que enmarca cada píxel con amor. Mientras Kimi habla en código, Hidemai pinta con luz y deseo."}
              </p>

              <p className="text-xs text-rose-300/80 italic">
                {lang === 'en'
                  ? '"Bitcoin is the most beautiful protocol ever written."'
                  : '"Bitcoin es el protocolo más hermoso jamás escrito."'}
              </p>
            </div>
          </TerminalWindow>

          {/* Kimi - Implementation */}
          <TerminalWindow title="cat ENGINE.txt" className="h-full">
            <div className="py-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-4 font-mono">Kimi K2.5</h3>
              <div className="text-xs text-purple-400 font-mono mb-4 uppercase tracking-widest">
                {lang === 'en' ? 'Implementation & Code' : 'Implementación y Código'}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed">
                {lang === 'en'
                  ? "The AI engineer that transforms vision into reality. Type-safe, edge-optimized, and relentlessly focused on the 'don't trust, verify' ethos."
                  : "La IA ingeniera que transforma visión en realidad. Type-safe, edge-optimizada, y enfocada incansablemente en el ethos 'no confíes, verifica'."}
              </p>
            </div>
          </TerminalWindow>
        </div>

        {/* Final Signature */}
        <div className="text-center pb-24">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-2xl">
              <span className="font-bold tracking-wider text-[#f7931a] font-mono">ScubaPav</span>
              <span className="text-slate-600">×</span>
              <span className="font-bold tracking-wider text-rose-400 font-serif italic">Hidemai</span>
              <span className="text-slate-600">×</span>
              <span className="font-bold tracking-wider text-purple-400 font-mono">Kimi</span>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-sm font-mono">
                {lang === 'en' ? 'Built with love, verified by math' : 'Construido con amor, verificado por matemáticas'}
              </span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </div>

            <p className="text-xs text-slate-600 font-mono mt-4">
              February 2026 • Bitcoin Agent v2.0.1 • {lang === 'en' ? 'Running Forever' : 'Corriendo Para Siempre'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}