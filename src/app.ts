import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import ticketRoutes from './routes/ticket.routes';
import attachmentRoutes from './routes/attachment.routes';
import agentRoutes from './routes/agent.routes';

dotenv.config({ path: './config.env' });

connectDB();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/agent', agentRoutes);

app.use(errorHandler);

export default app;
