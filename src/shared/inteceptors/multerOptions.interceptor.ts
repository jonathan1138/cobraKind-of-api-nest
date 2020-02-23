import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { HttpException, HttpStatus, Param } from '@nestjs/common';
import * as config from 'config';

// Multer configuration
export const multerConfig = {
    dest: config.get('UPLOADS.PATH'),
};

// Multer upload options
export const multerOptions = {
    // Enable file size limits
    limits: {
        fileSize: +process.env.MAX_FILE_SIZE,
    },
    // Check the mimetypes to allow for upload
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|csv)$/)) {
            // if (file.mimetype.match(/\/(csv)$/)) {
            // Allow storage of file
            cb(null, true);
        } else {
            // Reject file
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },
    // Storage properties
    storage: diskStorage({
        // Destination storage path details
        destination: (req: any, file: any, cb: any) => {
            let uploadPath: string;
            const paramPath = Object.values(req.params)[0];
            switch (paramPath) {
                case 'categories':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                case 'markets':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                case 'tags':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                case 'exchanges':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                case 'parts':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                case 'subItems':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                case 'posts':
                    uploadPath = multerConfig.dest + '/' + paramPath;
                    break;
                default:
                    uploadPath = multerConfig.dest + '/' + 'orphans';
            }
            // Create folder if doesn't exist
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        // File modification details
        filename: (req: any, file: any, cb: any) => {
            // Calling the callback passing the random name generated with the original extension name
            // cb(null, `${uuid()}${extname(file.originalname)}`);
            cb(null, `${file.originalname}`);
        },
    }),
};
