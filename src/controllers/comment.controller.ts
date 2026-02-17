import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Comment from '../models/comment.model';
import Ticket from '../models/ticket.model';
import Attachment from '../models/attachment.model';
import { AppError } from '../middleware/error.middleware';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/audit.model';

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { ticketId } = req.params;
        const { body, isInternal } = req.body;
        const files = req.files as Express.Multer.File[];

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        // Authorization check
        if (req.user.role === 'Requester') {
            if (ticket.requester.toString() !== req.user._id.toString()) {
                return next(new AppError('Not authorized to comment on this ticket', 403));
            }
            if (isInternal === 'true' || isInternal === true) { // Requester cannot add internal notes
                return next(new AppError('Requesters cannot add internal notes', 403));
            }
        }

        const attachmentIds: any[] = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const attachment = await Attachment.create({
                    filename: file.originalname,
                    contentType: file.mimetype,
                    data: file.buffer,
                    ticket: ticket._id,
                });
                attachmentIds.push(attachment._id);
            }
        }

        const comment = await Comment.create({
            ticket: ticket._id,
            author: req.user._id,
            isInternal: isInternal === 'true' || isInternal === true,
            body,
            attachments: attachmentIds,
        });

        // Update attachments with comment reference
        if (attachmentIds.length > 0) {
            await Attachment.updateMany(
                { _id: { $in: attachmentIds } },
                { $set: { comment: comment._id } }
            );
        }

        res.status(201).json({
            success: true,
            data: comment,
            message: 'Comment added successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { ticketId } = req.params;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        // Check access
        if (req.user.role === 'Requester' && ticket.requester.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized to view comments for this ticket', 403));
        }

        let query: any = { ticket: ticketId };
        if (req.user.role === 'Requester') {
            query.isInternal = false; // Filter out internal notes for requester
        }

        const comments = await Comment.find(query)
            .populate('author', 'firstName lastName role')
            .populate('attachments', 'filename contentType')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: comments,
        });
    } catch (error) {
        next(error);
    }
};
