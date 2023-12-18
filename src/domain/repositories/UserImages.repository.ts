export interface IUserImagesRepository {
  uploadImage(image: any, key: string): Promise<any>;
  deleteImage(key: string): Promise<any>; 
}