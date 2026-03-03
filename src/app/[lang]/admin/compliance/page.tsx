// src/app/[lang]/compliance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, TrendingUp, AlertTriangle, Check, Calendar, 
  Download, Filter, Search, RefreshCw, Calculator, BookOpen
} from 'lucide-react';
import { LegalEducationCard } from '@/components/compliance/LegalEducationCard';
import { ThresholdSimulator } from '@/components/compliance/ThresholdSimulator';

// ============================================
// 🎨 COMPONENTES REUTILIZABLES
// ============================================

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  description?: string;
  lang: 'en' | 'es';
}

function StatCard({ title, value, icon, color, description, lang }: StatCardProps) {
  const colors = {
    green: 'text-[var(--matrix-green)]',
    blue: 'text-[var(--neon-cyan)]',
    purple: 'text-[var(--cyber-purple)]',
    orange: 'text-[var(--btc-orange)]',
    red: 'text-red-400',
  };

  const glowColors = {
    green: 'var(--matrix-green-glow)',
    blue: 'var(--neon-cyan-glow)',
    purple: 'var(--cyber-purple-glow)',
    orange: 'var(--btc-orange-glow)',
    red: 'rgba(248, 113, 113, 0.5)',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card group relative"
    >
      <div className={`flex items-center gap-2 mb-2 ${colors[color]}`}>
        {icon}
        <span className="text-sm text-[var(--text-muted)]">{title}</span>
      </div>
      <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{value}</p>
      
      {description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                      opacity-0 group-hover:opacity-100 transition-opacity
                      bg-[var(--deep-space)] border border-[var(--btc-orange)]/30 
                      text-xs text-[var(--text-secondary)] p-3 rounded-xl w-56 text-center
                      shadow-[0_0_20px_var(--btc-orange-glow)] z-20 pointer-events-none">
          {description}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// 🏛️ MAIN DASHBOARD COMPONENT
// ============================================

interface ComplianceDashboardProps {
  params: { lang: 'en' | 'es' };
}

export default function ComplianceDashboard({ params }: ComplianceDashboardProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSats: 154200000,
    totalMXN: 128450,
    transactionCount: 23,
    pendingReports: 2,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    // Integración con tu API existente
    try {
      const res = await fetch('/api/compliance/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setStats(data.stats);
      }
    } catch (error) {
      console.log('Using demo data');
      // Demo data para visualización
      setTransactions([
        { id: 1, timestamp: Date.now(), amountSats: 5000000, amountMXN: 4150, source: 'Lightning Tips', status: 'confirmed' },
        { id: 2, timestamp: Date.now() - 86400000, amountSats: 250000000, amountMXN: 207500, source: 'Work Payment', status: 'confirmed' },
        { id: 3, timestamp: Date.now() - 172800000, amountSats: 100000, amountMXN: 83, source: 'Faucet', status: 'confirmed' },
      ]);
    }
  };

  const generateReport = async (type: string, period: string) => {
    // Integración con tu reporter.ts existente
    await fetch('/api/compliance/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, period }),
    });
  };

  const needsReport = (amountMXN: number) => amountMXN > 160000;

  const t = {
    es: {
      title: 'Centro de Cumplimiento Fiscal',
      subtitle: 'Transparencia y educación para tu soberanía financiera',
      stats: {
        received: 'Total Recibido',
        mxnValue: 'Valor MXN',
        transactions: 'Transacciones',
        pending: 'Pendientes de Reporte',
      },
      reports: {
        title: 'Generar Reportes',
        monthly: 'Mensual',
        quarterly: 'Trimestral',
        annual: 'Anual',
        export: 'Exportar CSV',
        help: '📘 Los reportes mensuales ayudan con tu declaración provisional. Los trimestrales y anuales son útiles para la declaración anual y cumplimiento UIF.',
      },
      table: {
        title: 'Historial de Transacciones',
        search: 'Buscar...',
        date: 'Fecha',
        amount: 'Monto (sats)',
        mxn: 'MXN',
        source: 'Fuente',
        status: 'Estado',
        compliance: 'Cumplimiento',
        actions: 'Acciones',
        needsReport: 'Requiere reporte',
        confirmed: 'Confirmada',
        pending: 'Pendiente',
      },
      disclaimer: 'Esta herramienta es educativa. No constituye asesoría legal o fiscal. Consulta con un profesional para tu situación específica.',
    },
    en: {
      title: 'Tax Compliance Center',
      subtitle: 'Transparency and education for your financial sovereignty',
      stats: {
        received: 'Total Received',
        mxnValue: 'MXN Value',
        transactions: 'Transactions',
        pending: 'Pending Reports',
      },
      reports: {
        title: 'Generate Reports',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        annual: 'Annual',
        export: 'Export CSV',
        help: '📘 Monthly reports help with your provisional declaration. Quarterly and annual reports are useful for annual tax filing and UIF compliance.',
      },
      table: {
        title: 'Transaction History',
        search: 'Search...',
        date: 'Date',
        amount: 'Amount (sats)',
        mxn: 'MXN',
        source: 'Source',
        status: 'Status',
        compliance: 'Compliance',
        actions: 'Actions',
        needsReport: 'Report required',
        confirmed: 'Confirmed',
        pending: 'Pending',
      },
      disclaimer: 'This tool is educational. It does not constitute legal or tax advice. Consult a professional for your specific situation.',
    },
  }[params.lang];

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[var(--void-black)] text-[var(--text-primary)] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ============================================
            🎓 SECCIÓN 1: HEADER + EDUCACIÓN LEGAL
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-mono bg-gradient-to-r from-[var(--btc-orange)] to-[var(--kawaii-pink)] bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-[var(--text-muted)] mt-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={fetchComplianceData}
              className="btn-cyber flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* 🎓 CARD EDUCATIVA LEGAL */}
          <LegalEducationCard lang={params.lang} />
        </motion.div>

        {/* ============================================
            📊 SECCIÓN 2: STATS CON TOOLTIPS
            ============================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title={t.stats.received}
            value={`${(stats.totalSats / 1000000).toFixed(2)}M sats`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
            description={params.lang === 'es' 
              ? 'Suma de todas las entradas. Si supera ciertos umbrales, podría requerir reporte ante la UIF.'
              : 'Sum of all incoming transactions. If it exceeds certain thresholds, UIF reporting may be required.'}
            lang={params.lang}
          />
          <StatCard
            title={t.stats.mxnValue}
            value={`$${stats.totalMXN.toLocaleString()}`}
            icon={<FileText className="w-5 h-5" />}
            color="blue"
            description={params.lang === 'es'
              ? 'Valor estimado en pesos mexicanos al tipo de cambio actual.'
              : 'Estimated value in Mexican pesos at current exchange rate.'}
            lang={params.lang}
          />
          <StatCard
            title={t.stats.transactions}
            value={stats.transactionCount.toString()}
            icon={<Check className="w-5 h-5" />}
            color="purple"
            description={params.lang === 'es'
              ? 'Número total de operaciones registradas en el período.'
              : 'Total number of operations recorded in the period.'}
            lang={params.lang}
          />
          <StatCard
            title={t.stats.pending}
            value={stats.pendingReports.toString()}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="orange"
            description={params.lang === 'es'
              ? 'Transacciones que superan el umbral de $160,000 MXN y requieren reporte.'
              : 'Transactions exceeding the $160,000 MXN threshold requiring reporting.'}
            lang={params.lang}
          />
        </div>

        {/* ============================================
            🧮 SECCIÓN 3: SIMULADOR DE UMBRALES (NUEVO)
            ============================================ */}
        <ThresholdSimulator lang={params.lang} />

        {/* ============================================
            📋 SECCIÓN 4: GENERADOR DE REPORTES
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card mb-8"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--btc-orange)]" />
            {t.reports.title}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => generateReport('monthly', getCurrentPeriod())}
              className="btn-bitcoin flex flex-col items-center gap-2 py-6"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">{t.reports.monthly}</span>
            </button>
            <button
              onClick={() => generateReport('quarterly', getCurrentQuarter())}
              className="btn-cyber flex flex-col items-center gap-2 py-6"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">{t.reports.quarterly}</span>
            </button>
            <button
              onClick={() => generateReport('annual', getCurrentYear())}
              className="bg-[var(--cyber-purple)] hover:bg-[var(--cyber-purple-light)] text-white font-bold rounded-xl py-6 flex flex-col items-center gap-2 transition-all shadow-[0_0_20px_var(--cyber-purple-glow)]"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">{t.reports.annual}</span>
            </button>
            <button className="bg-[var(--matrix-green)]/20 border border-[var(--matrix-green)] text-[var(--matrix-green)] hover:bg-[var(--matrix-green)]/30 font-bold rounded-xl py-6 flex flex-col items-center gap-2 transition-all">
              <Download className="w-6 h-6" />
              <span className="text-sm">{t.reports.export}</span>
            </button>
          </div>

          <div className="mt-6 text-sm text-[var(--text-muted)] border-t border-[var(--nebula-gray)] pt-4">
            <p>{t.reports.help}</p>
          </div>
        </motion.div>

        {/* ============================================
            📊 SECCIÓN 5: TABLA DE TRANSACCIONES
            ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--btc-orange)]" />
              {t.table.title}
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder={t.table.search}
                className="input-cypher flex-1 sm:w-64"
              />
              <button className="p-3 bg-[var(--cosmic-gray)] rounded-xl hover:bg-[var(--nebula-gray)] transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[var(--text-muted)] text-sm border-b border-[var(--nebula-gray)]">
                  <th className="pb-3 font-mono">{t.table.date}</th>
                  <th className="pb-3 font-mono">{t.table.amount}</th>
                  <th className="pb-3 font-mono">{t.table.mxn}</th>
                  <th className="pb-3">{t.table.source}</th>
                  <th className="pb-3">{t.table.status}</th>
                  <th className="pb-3">{t.table.compliance}</th>
                  <th className="pb-3">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-[var(--nebula-gray)]/50 hover:bg-[var(--cosmic-gray)]/30 transition-colors">
                    <td className="py-4 font-mono text-sm text-[var(--text-muted)]">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-mono text-[var(--btc-orange)]">
                      {tx.amountSats.toLocaleString()}
                    </td>
                    <td className="py-4 font-mono">
                      ${Number(tx.amountMXN).toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-[var(--deep-space)] rounded-full text-xs border border-[var(--nebula-gray)]">
                        {tx.source}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'confirmed' 
                          ? 'bg-[var(--matrix-green)]/20 text-[var(--matrix-green)] border border-[var(--matrix-green)]/30'
                          : 'bg-[var(--btc-orange)]/20 text-[var(--btc-orange)] border border-[var(--btc-orange)]/30'
                      }`}>
                        {tx.status === 'confirmed' ? t.table.confirmed : t.table.pending}
                      </span>
                    </td>
                    <td className="py-4">
                      {needsReport(tx.amountMXN) ? (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/30 animate-pulse flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          {t.table.needsReport}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-[var(--matrix-green)]/10 text-[var(--matrix-green)]/60 rounded-full text-xs">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <button className="text-[var(--text-muted)] hover:text-[var(--btc-orange)] transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ============================================
            ⚠️ DISCLAIMER FINAL
            ============================================ */}
        <div className="mt-8 text-xs text-center text-[var(--text-faint)] border-t border-[var(--nebula-gray)] pt-4">
          <p>{t.disclaimer}</p>
        </div>

      </div>
    </main>
  );
}

// ============================================
// 🔧 HELPERS
// ============================================

function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentQuarter() {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

function getCurrentYear() {
  return String(new Date().getFullYear());
}