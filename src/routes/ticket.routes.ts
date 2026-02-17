import express from 'express';
import { createTicket, getMyTickets, getTicketById, assignTicket, updateTicketStatus, getUnassignedTickets, getAllTickets, getAssignedToMe } from '../controllers/ticket.controller';
import { addComment, getComments } from '../controllers/comment.controller';
import { getTicketHistory } from '../controllers/audit.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTicketSchema, updateStatusSchema, assignSchema, commentSchema } from '../utils/validation.schemas';

const router = express.Router();

router.use(protect); // Protect all ticket routes

// Specific routes first
router.route('/unassigned')
    .get(authorize('Agent'), getUnassignedTickets);

router.route('/my')
    .get(getMyTickets);

router.route('/assigned-to-me')
    .get(authorize('Agent'), getAssignedToMe);

// General collection routes
router.route('/')
    .post(upload.array('attachments', 5), validate(createTicketSchema), createTicket)
    .get(authorize('Agent'), getAllTickets);

// Nested resource routes
// Comments routes
router.route('/:ticketId/comments')
    .post(upload.array('attachments', 5), validate(commentSchema), addComment)
    .get(getComments);

// Parameterized routes (ID based) - MUST be last
router.route('/:id/history')
    .get(getTicketHistory);

router.route('/:id/assign')
    .put(authorize('Agent'), validate(assignSchema), assignTicket);

router.route('/:id/status')
    .put(authorize('Agent'), validate(updateStatusSchema), updateTicketStatus);

router.route('/:id')
    .get(getTicketById);

export default router;
