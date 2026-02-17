import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import Ticket from './models/ticket.model';

dotenv.config({ path: './config.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/help-desk');
        console.log('MongoDB Connected');

        // Clear existing data? Maybe not for production but for dev yes.
        // await User.deleteMany({});
        // await Ticket.deleteMany({});

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });
        if (!adminExists) {
            await User.create({
                firstName: 'System',
                lastName: 'Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: 'Admin'
            });
            console.log('Admin user created: admin@example.com / password123');
        }

        const agentExists = await User.findOne({ email: 'agent@example.com' });
        if (!agentExists) {
            await User.create({
                firstName: 'Support',
                lastName: 'Agent',
                email: 'agent@example.com',
                password: 'password123',
                role: 'Agent'
            });
            console.log('Agent user created: agent@example.com / password123');
        }

        const requesterExists = await User.findOne({ email: 'user@example.com' });
        if (!requesterExists) {
            await User.create({
                firstName: 'John',
                lastName: 'Doe',
                email: 'user@example.com',
                password: 'password123',
                role: 'Requester'
            });
            console.log('Requester user created: user@example.com / password123');
        }

        // Create seeds for tickets
        const createdRequester = await User.findOne({ email: 'user@example.com' });
        const createdAgent = await User.findOne({ email: 'agent@example.com' });

        if (createdRequester && createdAgent) {
            const ticketCount = await Ticket.countDocuments();
            if (ticketCount === 0) {
                await Ticket.create([
                    {
                        title: 'Laptop Screen Flicker',
                        type: 'Incident',
                        category: 'Hardware',
                        subcategory: 'Laptop',
                        priority: 'High',
                        description: 'My laptop screen keeps flickering intermittently.',
                        requester: createdRequester._id,
                        status: 'Created',
                        deviceType: 'Dell XPS 15',
                        operatingSystem: 'Windows 11',
                        location: 'New York'
                    },
                    {
                        title: 'Need VPN Access',
                        type: 'Service Request',
                        category: 'Network/VPN',
                        subcategory: 'VPN',
                        priority: 'Low',
                        description: 'I need VPN access for remote work.',
                        requester: createdRequester._id,
                        status: 'Assigned',
                        assignee: createdAgent._id
                    }
                ]);
                console.log('Dummy tickets created');
            }
        }

        console.log('Seed completed');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
