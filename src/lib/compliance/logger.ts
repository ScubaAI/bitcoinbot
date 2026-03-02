import { prisma } from '@/lib/prisma';
import type { AuditEventType, AuditEventCategory } from '@/types/compliance';
import type { Prisma } from '@prisma/client';

// ============================================
// AUDIT LOGGER
// ============================================

interface LogEventParams {
  eventType: AuditEventType;
  eventCategory: AuditEventCategory;
  description: string;
  transactionId?: string;
  previousValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  actorType?: 'system' | 'admin' | 'webhook';
  actorId?: string;
  actorIP?: string;
}

/**
 * Registra un evento en el log de auditoría
 */
export async function logAuditEvent(params: LogEventParams) {
  try {
    const log = await prisma.complianceAuditLog.create({
      data: {
        transactionId: params.transactionId,
        eventType: params.eventType,
        eventCategory: params.eventCategory,
        description: params.description,
        previousValue: params.previousValue ?? undefined,
        newValue: params.newValue ?? undefined,
        metadata: params.metadata ?? undefined,
        actorType: params.actorType ?? 'system',
        actorId: params.actorId,
        actorIP: params.actorIP,
      },
    });

    console.log(`📋 [COMPLIANCE] ${params.eventType}: ${params.description}`);
    
    return log;
  } catch (error) {
    console.error('💥 [COMPLIANCE] Error logging audit event:', error);
    throw error;
  }
}

/**
 * Helper para log de transacciones
 */
export async function logTransactionEvent(
  transactionId: string,
  eventType: 'created' | 'status_change' | 'manual_entry',
  description: string,
  metadata?: Prisma.InputJsonValue
) {
  return logAuditEvent({
    transactionId,
    eventType: `transaction_${eventType}` as AuditEventType,
    eventCategory: 'transaction',
    description,
    metadata,
    actorType: 'system',
  });
}
