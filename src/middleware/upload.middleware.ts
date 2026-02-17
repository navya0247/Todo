import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

// Set up storage engine
const storage = multer.memoryStorage(); // Or diskStorage if you prefer to save to disk

// Check file type
function checkFileType(file: Express.Multer.File, cb: FileFilterCallback) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images and PDFs only!'));
    }
}

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // Default 10MB

const upload = multer({
    storage: storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

export default upload;
