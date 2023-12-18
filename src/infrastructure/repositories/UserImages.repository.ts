import { DeleteObjectCommand, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "../../application/core/config";
import { IUserImagesRepository } from "../../domain/repositories/UserImages.repository";


export class UserImagesRepository implements IUserImagesRepository {

  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: config.AWS_S3.REGION,
      credentials: {
        accessKeyId: config.AWS_S3.ACCESS_KEY_ID ,
        secretAccessKey: config.AWS_S3.SECRET_ACCESS_KEY
      }
    });
  }

  async uploadImage(image: any, key: string) {
    const params = {
      Bucket: config.AWS_S3.BUCKET_NAME,
      Key: key,
      Body: image,
    };
    await this.s3Client.send(new PutObjectCommand(params));
  }

  async deleteImage(key: string) {
    const params = {
      Bucket: config.AWS_S3.BUCKET_NAME,
      Key: key,
    };
    await this.s3Client.send(new DeleteObjectCommand(params));
  }
}