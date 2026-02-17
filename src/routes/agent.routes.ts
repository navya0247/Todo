import express from 'express';
import { getUnassignedTickets, getAssignedToMe } from '../controllers/ticket.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(authorize('Agent')); // All routes here require Agent role

router.get('/tickets/unassigned', getUnassignedTickets);
router.get('/tickets/assigned-to-me', getAssignedToMe);

export default router;
