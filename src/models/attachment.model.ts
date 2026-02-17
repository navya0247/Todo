import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment extends Document {
    filename: string;
    contentType: string;
    data: Buffer;
    ticket?: mongoose.Types.ObjectId;
    comment?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
    {
        filename: {
            type: String,
            required: true,
        },
        contentType: {
            type: String,
            required: true,
        },
        data: {
            type: Buffer,
            required: true,
        },
        ticket: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
    },
    {
        timestamps: true,
    }
);

const Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema);
export default Attachment;
