import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Ticket from '../models/ticket.model';
import Audit from '../models/audit.model';
import { AppError } from '../middleware/error.middleware';

export const getTicketHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        // Access control
        if (req.user.role === 'Requester' && ticket.requester.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized to view this ticket history', 403));
        }

        const history = await Audit.find({ ticket: id })
            .populate('actor', 'firstName lastName role')
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        next(error);
    }
};
