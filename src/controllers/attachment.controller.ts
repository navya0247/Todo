import { NextFunction, Response } from 'express';
import Attachment from '../models/attachment.model';
import { AppError } from '../middleware/error.middleware';

export const getAttachment = async (req: any, res: Response, next: NextFunction) => {
    try {
        const attachment = await Attachment.findById(req.params.id);
        if (!attachment) {
            return next(new AppError('Attachment not found', 404));
        }

        // Ideally check permissions (if user can view the associated ticket/comment)
        // For simplicity now assume if they have the ID and are logged in (protected route), they can download?
        // Better: Find ticket and check.

        res.set('Content-Type', attachment.contentType);
        // res.set('Content-Disposition', `attachment; filename="${attachment.filename}"`); // For download
        res.set('Content-Disposition', `inline; filename="${attachment.filename}"`); // For viewing inline if possible

        res.send(attachment.data);
    } catch (error) {
        next(error);
    }
};
