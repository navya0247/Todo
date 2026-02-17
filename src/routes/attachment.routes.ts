import express from 'express';
import { getAttachment } from '../controllers/attachment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/:id', protect, getAttachment);

export default router;
