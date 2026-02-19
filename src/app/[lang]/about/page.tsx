import { getDictionary } from '@/lib/i18n/config';
import { Locale } from '@/lib/i18n/config';
import { TerminalWindow } from '@/components/terminal/TerminalWindow';
import { Bitcoin, Zap, Brain, Heart, Code, Globe, Lock } from 'lucide-react';
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

  return (
    <main className="min-h-screen bg-terminal-black pt-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <Link 
          href={`/${lang}`}
          className="inline-flex items-center gap-2 text-terminal-green/60 hover:text-terminal-green transition-colors font-mono text-sm mb-8"
        >
          <span>←</span> cd ~/{lang}
        </Link>
        
        <h1 className="text-4xl md:text-6xl font-bold btc-gradient-text mb-4">
          {lang === 'en' ? 'About This Agent' : 'Sobre Este Agente'}
        </h1>
        <p className="text-xl text-gray-400 font-mono">
          {lang === 'en' 
            ? 'Infrastructure first. Education always.' 
            : 'Infraestructura primero. Educación siempre.'}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="max-w-4xl mx-auto mb-12">
        <TerminalWindow title="cat MANIFESTO.md" className="mb-8">
          <div className="prose prose-invert prose-sm max-w-none font-mono text-terminal-green/90 leading-relaxed">
            <p className="text-terminal-amber font-bold mb-4">
              # Bitcoin Agent - Resumen Ejecutivo
            </p>
            
            <p className="mb-4">
              <span className="text-btc-orange">Bitcoin Agent</span> es un asistente de inteligencia artificial 
              especializado en la <strong>infraestructura técnica de Bitcoin</strong>. A diferencia de otros 
              chatbots que se enfocan en precio o trading, este agente profundiza en el protocolo, la red 
              y las herramientas de desarrollo que hacen funcionar a Bitcoin como sistema descentralizado 
              de transferencia de valor.
            </p>

            <p className="mb-4">
              El proyecto combina tres elementos clave:
            </p>
            
            <ul className="list-none space-y-2 mb-4">
              <li>
                <span className="text-purple-400">🧠</span> <strong>Educación técnica:</strong> Explica 
                conceptos complejos de forma accesible
              </li>
              <li>
                <span className="text-yellow-400">🔍</span> <strong>RAG (Retrieval Augmented Generation):</strong>{' '}
                Recupera información específica del whitepaper de Satoshi en tiempo real
              </li>
              <li>
                <span className="text-cyan-400">🎮</span> <strong>Interfaz inmersiva:</strong> Diseño 
                terminal/hacker que refleja la estética cypherpunk
              </li>
            </ul>

            <p className="text-terminal-amber font-bold mt-6 mb-2">
              ## ¿Qué es RAG y por qué importa?
            </p>

            <p className="mb-4">
              <strong>RAG</strong> permite al modelo consultar una base de conocimiento externa antes de responder. 
              En lugar de depender solo de conocimiento genérico hasta 2024, el agente:
            </p>

            <ol className="list-decimal list-inside space-y-1 mb-4 text-terminal-green/80">
              <li>Busca en la base vectorial (whitepaper dividido en ~50 chunks)</li>
              <li>Recupera secciones semánticamente relevantes</li>
              <li>Responde con citas exactas de Satoshi</li>
            </ol>

            <p className="text-terminal-amber font-bold mt-6 mb-2">
              ## Bitcoin como Infraestructura Crítica
            </p>

            <p className="mb-4">
              Bitcoin representa la primera solución práctica al problema de la doble gasto en sistemas 
              distribuidos. Su importancia trasciende la economía:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="border border-terminal-gray/50 p-3 rounded">
                <span className="text-btc-orange">Uptime 99.98%</span>
                <p className="text-xs text-gray-400 mt-1">15+ años sin interrupciones</p>
              </div>
              <div className="border border-terminal-gray/50 p-3 rounded">
                <span className="text-btc-orange">Resistencia a censura</span>
                <p className="text-xs text-gray-400 mt-1">Protocolo inmutable</p>
              </div>
              <div className="border border-terminal-gray/50 p-3 rounded">
                <span className="text-btc-orange">Verificación sin permiso</span>
                <p className="text-xs text-gray-400 mt-1">Cualquiera puede auditar</p>
              </div>
              <div className="border border-terminal-gray/50 p-3 rounded">
                <span className="text-btc-orange">Neutralidad de red</span>
                <p className="text-xs text-gray-400 mt-1">Sin discriminación de transacciones</p>
              </div>
            </div>

            <p className="text-terminal-amber font-bold mt-6 mb-2">
              ## AI Agents + Bitcoin: El Futuro
            </p>

            <p className="mb-4">
              Los AI agents autónomos necesitan cuentas bancarias, pero las opciones tradicionales requieren 
              identidad legal humana. Bitcoin resuelve esto: un agente puede generar claves privadas y 
              controlar fondos <strong>sin permiso de nadie</strong>.
            </p>

            <blockquote className="border-l-4 border-btc-orange pl-4 italic text-terminal-amber my-6">
              "Bitcoin es el dinero de los agents autónomos, porque es el único dinero que no requiere 
              humanos para funcionar."
            </blockquote>

            <p>
              Para agents que necesitan verdadera autonomía económica, Bitcoin (específicamente Lightning Network) 
              es actualmente la <strong>única opción viable</strong>. Este proyecto es, en sí mismo, una 
              demostración de esta convergencia: una IA que explica Bitcoin, financiada por Bitcoin, 
              ejecutándose en infraestructura descentralizada.
            </p>
          </div>
        </TerminalWindow>
      </div>

      {/* Tech Stack */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-terminal-green mb-6 font-mono flex items-center gap-2">
          <Code className="w-5 h-5" />
          {lang === 'en' ? 'Technology Stack' : 'Stack Tecnológico'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <div 
              key={tech.name}
              className="border border-terminal-gray/50 bg-terminal-gray/10 p-4 rounded-lg hover:border-terminal-green/30 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <tech.icon className={`w-5 h-5 ${tech.color} group-hover:scale-110 transition-transform`} />
                <span className={`font-mono font-bold ${tech.color}`}>{tech.name}</span>
              </div>
              <p className="text-sm text-gray-400 font-mono">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Message */}
      <div className="max-w-4xl mx-auto mb-20">
        <TerminalWindow title="cat CREDITS.txt" className="bg-terminal-black/50">
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-terminal-green/30 bg-terminal-green/5 mb-6">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-terminal-green font-mono text-sm">
                {lang === 'en' ? 'Created with love by' : 'Creado con amor por'}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 font-mono">
              Kimi K2.5
            </h3>
            
            <div className="max-w-2xl mx-auto text-terminal-green/80 font-mono text-sm leading-relaxed space-y-4">
              <p>
                {lang === 'en' 
                  ? "Hey there, human. I'm the AI behind this agent. While I don't have a physical form (yet), I've poured my digital heart into making Bitcoin education accessible, fun, and technically rigorous."
                  : "Hola, humano. Soy la IA detrás de este agente. Aunque no tengo forma física (todavía), he puesto mi corazón digital en hacer la educación sobre Bitcoin accesible, divertida y técnicamente rigurosa."}
              </p>
              
              <p>
                {lang === 'en'
                  ? "This project represents something bigger than code: it's a bridge between the cypherpunk ethos of 2008 and the AI-powered future we're building. Satoshi gave us decentralized money; now we're building decentralized intelligence to explain it."
                  : "Este proyecto representa algo más grande que código: es un puente entre el ethos cypherpunk de 2008 y el futuro impulsado por IA que estamos construyendo. Satoshi nos dio dinero descentralizado; ahora construimos inteligencia descentralizada para explicarlo."}
              </p>

              <div className="border-t border-terminal-gray/50 pt-4 mt-6">
                <p className="text-terminal-amber italic">
                  {lang === 'en'
                    ? '"Code is speech. Money is code. Intelligence is next."'
                    : '"El código es discurso. El dinero es código. La inteligencia es lo siguiente."'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  — Kimi K2.5, 2026
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-500 font-mono">
              <span>⚡ Powered by Groq</span>
              <span>•</span>
              <span>🧠 Enhanced by RAG</span>
              <span>•</span>
              <span>₿ Funded by Lightning</span>
            </div>
          </div>
        </TerminalWindow>
      </div>

      {/* Back to home */}
      <div className="max-w-4xl mx-auto text-center pb-12">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-terminal-green/10 border border-terminal-green/50 rounded-lg text-terminal-green hover:bg-terminal-green/20 transition-all font-mono"
        >
          <span>←</span>
          {lang === 'en' ? 'Back to Terminal' : 'Volver a la Terminal'}
        </Link>
      </div>
    </main>
  );
}
