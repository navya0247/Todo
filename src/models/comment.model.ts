import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    ticket: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    isInternal: boolean;
    body: string;
    attachments: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        ticket: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isInternal: {
            type: Boolean,
            default: false,
        },
        body: {
            type: String,
            required: true,
        },
        attachments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Attachment',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;
