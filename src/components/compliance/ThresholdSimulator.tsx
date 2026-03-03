'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  lang: 'en' | 'es';
}

export function ThresholdSimulator({ lang }: Props) {
  const [amount, setAmount] = useState('');
  const THRESHOLD = 160000;

  const amountNum = parseFloat(amount) || 0;
  const needsReport = amountNum > THRESHOLD;
  const percentage = Math.min((amountNum / THRESHOLD) * 100, 100);

  const t = {
    es: {
      title: 'Simulador de Umbrales UIF',
      subtitle: '¿Tu operación requiere reporte?',
      inputLabel: 'Monto en MXN',
      inputPlaceholder: 'Ej: 150000',
      threshold: 'Umbral de reporte: $160,000 MXN',
      result: {
        safe: '✅ No requiere reporte especial',
        warning: '⚠️ ¡Requiere reporte ante la UIF!',
      },
      explanation: 'Las operaciones mayores a ~$160,000 MXN (aprox. 8,000 USD) deben reportarse a la Unidad de Inteligencia Financiera según LFPIORPI.',
    },
    en: {
      title: 'UIF Threshold Simulator',
      subtitle: 'Does your operation require reporting?',
      inputLabel: 'Amount in MXN',
      inputPlaceholder: 'Ex: 150000',
      threshold: 'Reporting threshold: $160,000 MXN',
      result: {
        safe: '✅ No special reporting required',
        warning: '⚠️ Must report to Financial Intelligence Unit!',
      },
      explanation: 'Operations over ~$160,000 MXN (approx. 8,000 USD) must be reported to the UIF according to LFPIORPI.',
    },
  }[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-[var(--cyber-purple)]" />
        <h2 className="text-xl font-bold">{t.title}</h2>
      </div>
      
      <p className="text-[var(--text-muted)] mb-6">{t.subtitle}</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            {t.inputLabel}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="input-cypher pl-8 text-lg font-mono"
            />
          </div>
          <p className="text-xs text-[var(--text-faint)] mt-2">{t.threshold}</p>
        </div>

        <div className="flex flex-col justify-center">
          {amountNum > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-4 rounded-xl border ${
                needsReport
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-[var(--matrix-green)]/10 border-[var(--matrix-green)]/30 text-[var(--matrix-green)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {needsReport ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span className="font-bold">
                  {needsReport ? t.result.warning : t.result.safe}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-[var(--deep-space)] rounded-full h-2 mt-3">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    needsReport ? 'bg-red-500' : 'bg-[var(--matrix-green)]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs mt-2 opacity-80">
                {percentage.toFixed(0)}% del umbral
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)] mt-6 pt-4 border-t border-[var(--nebula-gray)]">
        💡 {t.explanation}
      </p>
    </motion.div>
  );
}
