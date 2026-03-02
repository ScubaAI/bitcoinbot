import { prisma } from '@/lib/prisma';
import { calculateFiscalReport, getPeriodRange } from './calculator';
import { logAuditEvent } from './logger';
import type { FiscalReportData, ReportType } from '@/types/compliance';

// ============================================
// REPORT GENERATOR
// ============================================

interface GenerateReportOptions {
  type: ReportType;
  period: string;
  generatedBy?: string;
  notes?: string;
}

/**
 * Genera un reporte fiscal y lo guarda en la base de datos
 */
export async function generateFiscalReport(options: GenerateReportOptions) {
  const { type, period, generatedBy, notes } = options;
  
  // Check if report already exists
  const existing = await prisma.fiscalReport.findFirst({
    where: {
      reportType: type,
      reportPeriod: period,
    },
  });
  
  if (existing) {
    throw new Error(`Report already exists for ${type} ${period}`);
  }
  
  // Calculate report data
  const data = await calculateFiscalReport(type, period);
  
  // Create report record
  const report = await prisma.fiscalReport.create({
    data: {
      reportType: type,
      reportPeriod: period,
      totalSats: data.totalSats,
      totalBTC: data.totalBTC,
      totalMXN: data.totalMXN,
      totalUSD: data.totalUSD,
      transactionCount: data.transactionCount,
      generatedBy,
      notes,
    },
  });
  
  // Log event
  await logAuditEvent({
    eventType: 'report_generated',
    eventCategory: 'report',
    description: `Generated ${type} report for ${period}`,
    metadata: {
      reportId: report.id,
      totalSats: data.totalSats,
      totalMXN: data.totalMXN,
    },
    actorType: generatedBy ? 'admin' : 'system',
    actorId: generatedBy,
  });
  
  return { report, data };
}

/**
 * Genera el contenido CSV del reporte
 */
export function generateReportCSV(data: FiscalReportData): string {
  const headers = [
    'Fecha',
    'Sats',
    'MXN',
    'Transacciones',
  ];
  
  const rows = data.dailyBreakdown.map(day => [
    day.date,
    day.sats.toString(),
    day.mxn.toFixed(2),
    day.count.toString(),
  ]);
  
  // Totals row
  rows.push([]);
  rows.push(['TOTALES', data.totalSats.toString(), data.totalMXN.toFixed(2), data.transactionCount.toString()]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * Formatea período para mostrar
 */
export function formatPeriod(period: string, type: ReportType): string {
  switch (type) {
    case 'daily':
      return period; // "2024-01-15"
    case 'weekly':
      return `Semana ${period}`; // "2024-W05"
    case 'monthly':
      const [year, month] = period.split('-');
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return `${months[parseInt(month) - 1]} ${year}`;
    case 'quarterly':
      return `Q${period.split('-Q')[1]} ${period.split('-Q')[0]}`;
    case 'annual':
      return `Año ${period}`;
    default:
      return period;
  }
}
