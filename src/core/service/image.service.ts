import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as path from "path";
import * as fs from 'fs';
import * as short from 'short-uuid'

@Injectable()
export class ImagesService {

    async uploadImage(image: Express.Multer.File, id: string, folder: string): Promise<string> {
        try {
            const shortId = short.generate()
            const imageName = `${id}-${shortId}.jpg`;
            const imagePath = path.resolve(__dirname, '..', '..', '..', 'static', folder)
            if(!fs.existsSync(imagePath)){
                fs.mkdirSync(imagePath, {recursive: true});
            }
            fs.writeFileSync(path.join(imagePath, imageName), image.buffer)
            return imageName
        } catch (e) {
            throw new InternalServerErrorException('Error occurred while image is uploading');
        }
    }

    async uploadImages(images: Array<Express.Multer.File>, id: string, folder: string): Promise<string[]> {
        try {
            const imagesNames: string[] = []
            for(let i = 0; i < images.length; i++) {
                const shortId = short.generate()
                const imageName = `${id}-${shortId}.jpg`
                const imagePath = path.resolve('..', __dirname, '..', '..', '..', 'static', folder)
                if(!fs.existsSync(imagePath)){
                    fs.mkdirSync(imagePath, {recursive: true})
                }
                fs.writeFileSync(path.join(imagePath, imageName), images[i].buffer)
                imagesNames.push(imageName)
            }
            return imagesNames
        } catch (e) {
            throw new InternalServerErrorException('Error occurred while image is uploading')
        }
    }

    async deleteImage(imageLink: string, folder: string) {
        try {
            const filePath = path.resolve(__dirname, '..', '..', '..', 'static', folder, imageLink)
            if(fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }         
        } catch (error) {
            throw new InternalServerErrorException('Error occurred while image is deleting')
        }  
    }

    async deleteImages(imageLinks: string[], folder: string) {
        try {
            imageLinks.forEach(imageLink => {
                const filePath = path.resolve(__dirname, '..', '..', '..', 'static', folder, imageLink)
                if(fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            })   
        } catch (error) {
            throw new InternalServerErrorException('Error occurred while images is deleting')
        }  
    }

}