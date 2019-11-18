import { Injectable, UnsupportedMediaTypeException, NotAcceptableException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as config from 'config';
import { v4 } from 'uuid';
import { ImgFolder } from '../enums/upload-img-folder.enum';

@Injectable()
export class S3UploadService {

  private AWS_S3_BUCKET_NAME = config.get('AWS.S3_BUCKET_NAME');
  private s3 = new AWS.S3();
  private AWS_PATH = 'https://cobrakindimagebucket.s3.amazonaws.com/';

  constructor() {
    AWS.config.update({
      accessKeyId: config.get('AWS.ACCESS_KEY_ID'),
      secretAccessKey: config.get('AWS.SECRET_ACCESS_KEY'),
    });
  }

 async uploadImage(file: any, folder: ImgFolder): Promise<string> {
  if (!file) {
    throw new NotAcceptableException();
  } else {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      throw new UnsupportedMediaTypeException('Not a valid Image Type!');
    } else {
      const fileExtension = file.originalname.substr(file.originalname.lastIndexOf('.') + 1);
      const randomId = v4();
      const fileName = folder + randomId + '.' + fileExtension;
      const params = {
          Body: file.buffer,
          Bucket: this.AWS_S3_BUCKET_NAME,
          Key: fileName,
        };
      try {
          const data = await this.s3
            .putObject(params)
            .promise();
          return fileName;
        } catch (err) {
          return err;
        }
      }
    }
  }

  async uploadImageBatch(images: object[], folder: ImgFolder): Promise<string[]> {
    const s3ImageArray = [];
    if (!Array.isArray(images) || images.length < 1) {
      throw new Error('You are trying to upload an empty file.');
    }
    const uploadPromises = images.map(async (image, index: number) => {
      const imageUrl = await this.uploadImage(image, folder);
      s3ImageArray.push(imageUrl);
    });
    await Promise.all(uploadPromises);
    return s3ImageArray;
  }
}
