'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Check, ExternalLink, Shield } from 'lucide-react';

interface Props {
  lang: 'en' | 'es';
}

export function LegalEducationCard({ lang }: Props) {
  const content = {
    es: {
      title: 'Marco Legal en México',
      summary: 'Los activos digitales están regulados y debes mantener trazabilidad, especialmente en operaciones de alto valor.',
      points: [
        'Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI)',
        'Disposiciones de la CNBV para Tecnologías Financieras (Ley FinTech)',
        'Obligación de reportar operaciones superiores a ~$160,000 MXN ante la UIF',
        'Plataformas deben realizar KYC y mantener registros por 10 años',
        'SAT considera criptomonedas como activos virtuales sujetos a impuestos',
      ],
      note: 'Esta herramienta es educativa. Consulta a un especialista fiscal para tu caso particular.',
      cta: 'Conoce más en CNBV',
    },
    en: {
      title: 'Legal Framework in Mexico',
      summary: 'Digital assets are regulated, and you must maintain traceability, especially for high-value operations.',
      points: [
        'Federal Law for Prevention of Operations with Illicit Funds (LFPIORPI)',
        'CNBV Provisions for Financial Technologies (FinTech Law)',
        'Obligation to report operations above ~$160,000 MXN to UIF',
        'Platforms must perform KYC and keep records for 10 years',
        'SAT considers cryptocurrencies as virtual assets subject to taxes',
      ],
      note: 'This tool is educational. Consult a tax specialist for your particular case.',
      cta: 'Learn more at CNBV',
    },
  };

  const t = content[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-l-4 border-l-[var(--btc-orange)]"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[var(--btc-orange)]/10 rounded-xl">
          <Shield className="w-6 h-6 text-[var(--btc-orange)]" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[var(--btc-orange)] mb-2 flex items-center gap-2">
            {t.title}
            <span className="text-xs px-2 py-1 bg-[var(--btc-orange)]/20 rounded-full text-[var(--btc-orange)]">
              EDUCATIVO
            </span>
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">{t.summary}</p>
          
          <ul className="space-y-2 mb-4">
            {t.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <Check className="w-4 h-4 text-[var(--matrix-green)] flex-shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-[var(--nebula-gray)]">
            <p className="text-xs text-[var(--text-faint)] italic flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {t.note}
            </p>
            <a
              href="https://www.gob.mx/cnbv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--btc-orange)] hover:text-[var(--btc-orange-light)] flex items-center gap-1 transition-colors"
            >
              {t.cta} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
