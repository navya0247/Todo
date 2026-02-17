import Joi from 'joi';

export const registerSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(), // Add complexity rules if needed
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
    }),
    role: Joi.string().valid('Requester', 'Agent').default('Requester'), // Optional, defaults to Requester
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});
// ...existing code...

export const createTicketSchema = Joi.object({
    title: Joi.string().required().min(5),
    type: Joi.string().valid('Incident', 'Service Request').required(),
    category: Joi.string().valid(
        'Hardware',
        'Software',
        'Network/VPN',
        'Email/Collaboration',
        'Access & Permissions',
        'Policy Request',
        'Software Development Request',
        'Knowledge Base Request',
        'General Question',
        'Other'
    ).required(),
    subcategory: Joi.string().required(),
    priority: Joi.string().valid('Low', 'High', 'Critical').required(),
    description: Joi.string().required().min(10),
    deviceType: Joi.string().allow('', null),
    operatingSystem: Joi.string().allow('', null),
    location: Joi.string().allow('', null),
    attachments: Joi.any() // Multer handles files
});

export const updateStatusSchema = Joi.object({
    status: Joi.string().valid('Created', 'Assigned', 'Started', 'Completed', 'On-hold').required(),
    resolutionSummary: Joi.string().when('status', {
        is: 'Completed',
        then: Joi.required(),
        otherwise: Joi.allow('', null)
    })
});

export const assignSchema = Joi.object({
    assigneeId: Joi.string().allow(null, '').optional(),
    description: Joi.string().when('assigneeId', {
        is: Joi.valid(null, ''),
        then: Joi.required(),
        otherwise: Joi.allow('', null).optional()
    })
});

export const commentSchema = Joi.object({
    body: Joi.string().required(),
    isInternal: Joi.boolean().default(false),
    attachments: Joi.any()
});
