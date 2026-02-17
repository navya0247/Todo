import Audit, { AuditAction } from '../models/audit.model';
import mongoose from 'mongoose';

export const logAudit = async (
    ticketId: mongoose.Types.ObjectId | string,
    actorId: mongoose.Types.ObjectId | string,
    action: AuditAction,
    details?: string,
    metadata?: any
) => {
    try {
        await Audit.create({
            ticket: ticketId,
            actor: actorId,
            action,
            details,
            metadata,
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Non-blocking error logging - don't fail the request just because audit failed? 
        // Or strictly fail? Usually best-effort or queue. For this app, logging error is enough.
    }
};
