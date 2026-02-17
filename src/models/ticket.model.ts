import mongoose, { Document, Schema } from 'mongoose';

export enum TicketStatus {
    Created = 'Created',
    Assigned = 'Assigned',
    Started = 'Started',
    Completed = 'Completed',
    OnHold = 'On-hold',
}

export enum TicketType {
    Incident = 'Incident',
    ServiceRequest = 'Service Request',
}

export enum TicketPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

export enum TicketCategory {
    Hardware = 'Hardware',
    Software = 'Software',
    NetworkVPN = 'Network/VPN',
    EmailCollaboration = 'Email/Collaboration',
    AccessPermissions = 'Access & Permissions',
    PolicyRequest = 'Policy Request',
    SoftwareDevelopmentRequest = 'Software Development Request',
    KnowledgeBaseRequest = 'Knowledge Base Request',
    GeneralQuestion = 'General Question',
    Other = 'Other',
}

export interface ITicket extends Document {
    title: string;
    type: TicketType;
    category: TicketCategory;
    subcategory: string;
    priority: TicketPriority;
    priorityLevel: number; // For sorting: 0=Low, 1=Medium, 2=High, 3=Critical
    description: string;
    status: TicketStatus;
    requester: mongoose.Types.ObjectId;
    assignee?: mongoose.Types.ObjectId;
    attachments: mongoose.Types.ObjectId[];
    resolutionSummary?: string;
    deviceType?: string; // Optional per category
    operatingSystem?: string; // Optional per category
    location?: string; // Optional per category
    createdAt: Date;
    updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: Object.values(TicketType),
            required: true,
        },
        category: {
            type: String,
            enum: Object.values(TicketCategory),
            required: true,
        },
        subcategory: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            enum: Object.values(TicketPriority),
            required: true,
        },
        priorityLevel: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(TicketStatus),
            default: TicketStatus.Created,
        },
        requester: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignee: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        attachments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Attachment',
            },
        ],
        resolutionSummary: {
            type: String,
        },
        deviceType: String,
        operatingSystem: String,
        location: String,
    },
    {
        timestamps: true,
    }
);

ticketSchema.pre('save', function (this: ITicket) {
    if (this.isModified('priority')) {
        const weights = {
            [TicketPriority.Low]: 0,
            [TicketPriority.Medium]: 1,
            [TicketPriority.High]: 2,
            [TicketPriority.Critical]: 3,
        };
        this.priorityLevel = weights[this.priority] || 0;
    }
});

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
export default Ticket;
