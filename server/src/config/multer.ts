import multer from 'multer';
import parth from 'path';
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        destination: parth.resolve(__dirname, '..', '..', 'uploads'),
        filename(request, file, callback) {
            const hash = crypto.randomBytes(6).toString('hex');

            const filename = `${hash}-${file.originalname}`;

            callback(null, filename);
        }
    }),
}