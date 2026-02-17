import mongoose, { Document, Schema } from 'mongoose';

export enum AuditAction {
    Created = 'Created',
    Assigned = 'Assigned',
    Unassigned = 'Unassigned',
    StatusChanged = 'Status Changed',
    Commented = 'Commented',
    AttachmentAdded = 'Attachment Added',
    ConfigChange = 'Config Change'
}

export interface IAudit extends Document {
    ticket: mongoose.Types.ObjectId;
    actor: mongoose.Types.ObjectId;
    action: AuditAction;
    details?: string; // E.g., "Status changed from Created to Assigned", "Unassigned: reason..."
    metadata?: any; // Store from/to values if needed
    createdAt: Date;
}

const auditSchema = new Schema<IAudit>(
    {
        ticket: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
        },
        actor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: Object.values(AuditAction),
            required: true,
        },
        details: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Append-only usually implies just creation time matters
    }
);

const Audit = mongoose.model<IAudit>('Audit', auditSchema);
export default Audit;
