import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error.middleware';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return next(new AppError('User already exists', 400));
        }

        // Default role is Requester. Agents are added manually to DB as per requirement.

        const user: any = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'Requester',
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                },
                message: 'User registered successfully',
            });
        } else {
            return next(new AppError('Invalid user data', 400));
        }
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user: any = await User.findOne({ email });

        // Validate password
        // "for email and password incorrect same error should be shown for privacy purpose"
        if (!user || !(await user.matchPassword(password))) {
            return next(new AppError('Invalid email or password', 401));
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
            message: 'User logged in successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        next(error);
    }
}
