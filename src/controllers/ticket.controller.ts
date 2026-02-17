import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Ticket, { TicketStatus, ITicket } from '../models/ticket.model';
import Attachment from '../models/attachment.model';
import { AppError } from '../middleware/error.middleware';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/audit.model';

export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { title, type, category, subcategory, priority, description, deviceType, operatingSystem, location } = req.body;
        const files = req.files as Express.Multer.File[];

        const attachmentIds: any[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const attachment = await Attachment.create({
                    filename: file.originalname,
                    contentType: file.mimetype,
                    data: file.buffer,
                });
                attachmentIds.push(attachment._id);
            }
        }

        const ticket = await Ticket.create({
            title,
            type,
            category,
            subcategory,
            priority,
            description,
            requester: req.user._id,
            attachments: attachmentIds,
            deviceType,
            operatingSystem,
            location,
        }) as unknown as ITicket;

        // Update attachments with ticket reference
        if (attachmentIds.length > 0) {
            await Attachment.updateMany(
                { _id: { $in: attachmentIds } },
                { $set: { ticket: ticket._id } }
            );
        }

        await logAudit(ticket._id, req.user._id, AuditAction.Created, 'Ticket created');

        res.status(201).json({
            success: true,
            data: ticket,
            message: 'Ticket created successfully',
        });
    } catch (error) {
        console.error("Create Ticket Controller Error:", error);
        next(error);
    }
};

export const getMyTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { search, status, category, priority, type, sort } = req.query;

        let query: any = { requester: userId };

        // Search logic (Ticket ID or Title)
        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            let idQuery = null;
            if (mongoose.Types.ObjectId.isValid(search as string)) {
                idQuery = { _id: search };
            }

            if (idQuery) {
                query.$or = [
                    { title: searchRegex },
                    idQuery
                ];
            } else {
                query.title = searchRegex;
            }
        }

        // Filters
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (type) query.type = type;

        // Sorting
        let sortOption: any = { createdAt: -1 }; // Default youngest first
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'priority') {
            sortOption = { priority: -1, createdAt: -1 }; // Rough sort
        }

        const tickets = await Ticket.find(query)
            .populate('requester', 'firstName lastName email')
            .populate('assignee', 'firstName lastName email')
            .populate('attachments', 'filename contentType')
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        const total = await Ticket.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getTicketById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('requester', 'firstName lastName email')
            .populate('assignee', 'firstName lastName email')
            .populate('attachments', 'filename contentType');

        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        // Role check: Only owner or agent can view
        if (req.user.role === 'Requester' && ticket.requester._id.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized to access this ticket', 403));
        }

        res.status(200).json({
            success: true,
            data: ticket,
        });
    } catch (error) {
        next(error);
    }
};

// ...existing code...

export const updateTicketStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, resolutionSummary } = req.body; // resolutionSummary required for Completion

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        // Only Agent can update status
        // Or Requester? No, Requester cannot change status.
        if (req.user.role !== 'Agent') {
            return next(new AppError('Not authorized to update ticket status', 403));
        }

        // Validate transitions
        // Created -> Assigned (auto) -> Started -> Completed
        // Blocked/On-hold allowed from anywhere?

        // Check if assignee is set before starting?
        if (status === TicketStatus.Started && !ticket.assignee) {
            return next(new AppError('Ticket must be assigned before starting', 400));
        }

        if (status === TicketStatus.Completed && !resolutionSummary) {
            return next(new AppError('Resolution summary is required to complete the ticket', 400));
        }

        const oldStatus = ticket.status;
        // Update status
        ticket.status = status;
        if (resolutionSummary) {
            ticket.resolutionSummary = resolutionSummary;
        }

        await ticket.save();
        await logAudit(ticket._id, req.user._id, AuditAction.StatusChanged, `Status changed from ${oldStatus} to ${status}`);

        res.status(200).json({
            success: true,
            data: ticket,
            message: 'Ticket status updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const assignTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { assigneeId, description } = req.body; // Can be self if empty or specific

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        if (req.user.role !== 'Agent') {
            return next(new AppError('Not authorized to assign tickets', 403));
        }

        const isUnassigning = assigneeId === null || assigneeId === '';

        if (isUnassigning) {
            if (!description) {
                return next(new AppError('Description is required to unassign a ticket', 400));
            }
            ticket.assignee = undefined; // Unset
            ticket.status = TicketStatus.Created;

            await ticket.save();
            await logAudit(ticket._id, req.user._id, AuditAction.Unassigned, `Unassigned. Reason: ${description}`);

            return res.status(200).json({
                success: true,
                data: ticket,
                message: 'Ticket unassigned successfully'
            });
        }

        // Assign to self if no ID provided or explicit ID
        const newAssigneeId = assigneeId || req.user._id;
        ticket.assignee = newAssigneeId;
        ticket.status = TicketStatus.Assigned; // Auto update status

        await ticket.save();
        await logAudit(ticket._id, req.user._id, AuditAction.Assigned, `Assigned to ${newAssigneeId}`);

        res.status(200).json({
            success: true,
            data: ticket,
            message: 'Ticket assigned successfully'
        });

    } catch (error) {
        next(error);
    }
};

// ...existing code...

export const getUnassignedTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { search, status, category, priority, type, sort } = req.query;

        let query: any = { assignee: null, status: { $ne: TicketStatus.Completed } };

        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            let idQuery = null;
            if (mongoose.Types.ObjectId.isValid(search as string)) {
                idQuery = { _id: search };
            }

            // Requester name search included? 'Search (ID/title/requester)'
            // Requester is ObjectId ref. Cannot search by name directly in simple find unless aggregated or two-step query.
            // For now just ID/Title.
            if (idQuery) {
                query.$or = [
                    { title: searchRegex },
                    idQuery
                ];
            } else {
                query.title = searchRegex;
            }
        }

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (type) query.type = type;

        let sortOption: any = { createdAt: 1 }; // Oldest first default for queue
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'priority') sortOption = { priorityLevel: -1, createdAt: 1 }; // Highest priority first, then oldest first within same priority

        const tickets = await Ticket.find(query)
            .populate('requester', 'firstName lastName email')
            .populate('attachments', 'filename contentType')
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        const total = await Ticket.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getAssignedToMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { search, status, category, priority, type, sort } = req.query;

        let query: any = { assignee: userId };

        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            // ID/Title search
            if (mongoose.Types.ObjectId.isValid(search as string)) {
                query.$or = [{ title: searchRegex }, { _id: search }];
            } else {
                query.title = searchRegex;
            }
        }

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (type) query.type = type;

        let sortOption: any = { priority: -1, updatedAt: -1 }; // Priority then updated interaction
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };

        const tickets = await Ticket.find(query)
            .populate('requester', 'firstName lastName email')
            .populate('attachments', 'filename contentType')
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        const total = await Ticket.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getAllTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Only Agents can access all tickets
        if (req.user.role !== 'Agent') {
            return next(new AppError('Not authorized to access all tickets', 403));
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { search, status, category, priority, type, sort, assignedToMe } = req.query;

        let query: any = {};

        if (assignedToMe === 'true') {
            query.assignee = req.user._id;
        }

        // Search logic
        if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            if (mongoose.Types.ObjectId.isValid(search as string)) {
                query.$or = [{ title: searchRegex }, { _id: search }];
            } else {
                query.title = searchRegex;
            }
        }

        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (type) query.type = type;

        let sortOption: any = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'priority') sortOption = { priorityLevel: -1, createdAt: -1 }; // Critical > High...

        const tickets = await Ticket.find(query)
            .populate('requester', 'firstName lastName email')
            .populate('assignee', 'firstName lastName email')
            .populate('attachments', 'filename contentType')
            .skip(skip)
            .limit(limit)
            .sort(sortOption);

        const total = await Ticket.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};
