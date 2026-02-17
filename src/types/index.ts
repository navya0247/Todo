export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Requester' | 'Agent' | 'Admin';
    token?: string;
}

export enum TicketStatus {
    Created = 'Created',
    Assigned = 'Assigned',
    Started = 'Started',
    Completed = 'Completed',
    OnHold = 'On-hold',
}

export enum TicketPriority {
    Low = 'Low',
    High = 'High',
    Critical = 'Critical',
}

export enum TicketType {
    Incident = 'Incident',
    ServiceRequest = 'Service Request',
}

export enum TicketCategory {
    Hardware = 'Hardware',
    Software = 'Software',
    NetworkVPN = 'Network/VPN',
    EmailCollaboration = 'Email/Collaboration',
    AccessPermissions = 'Access & Permissions',
    Other = 'Other',
}

export interface Attachment {
    _id: string;
    filename: string;
    contentType: string;
}

export interface Ticket {
    _id: string;
    title: string;
    type: TicketType;
    category: TicketCategory;
    subcategory: string;
    priority: TicketPriority;
    description: string;
    status: TicketStatus;
    requester: User;
    assignee?: User;
    attachments: Attachment[];
    resolutionSummary?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    ticket: string;
    author: User;
    isInternal: boolean;
    body: string;
    attachments: Attachment[];
    createdAt: string;
}
