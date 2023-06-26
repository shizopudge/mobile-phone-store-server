import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ManufacturerDto } from './dto/manufacturer.dto';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';

@Injectable()
export class ManufacturerService {
    constructor(private prisma: PrismaService, private imagesService: ImagesService) {}

    async create(dto: ManufacturerDto) {
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {name: dto.name.toUpperCase()}})
        if(isManufacturerExist) throw new BadRequestException('Manufacturer is already exist, please select it when creating a product')
        const manufacturer = await this.prisma.manufacturer.create({data: {name: dto.name.toUpperCase()}})
        return manufacturer
    }

    async getMany(page: number, limit: number, query: string) {
        if(page === 0) page = 1
        if(page === 1) {
            const manufacturers = await this.prisma.manufacturer.findMany({take: limit, where: {name: {contains: query}}, include: {_count: {select:{models: true}}}})
            const manufacturersCount = await this.prisma.manufacturer.count({where: {name: {contains: query}}})
            const pagesCount = Math.ceil(manufacturersCount / limit)
            return {currentPage: page, countOnPage: manufacturers.length, pagesCount, manufacturersCount,  manufacturers}
        }
        const skip = (page - 1) * limit
        const manufacturers = await this.prisma.manufacturer.findMany({skip, take: limit, where: {name: {contains: query}}, include: {_count: {select:{models: true}}}})
        const manufacturersCount = await this.prisma.manufacturer.count({where: {name: {contains: query}}})
        const pagesCount = Math.ceil(manufacturersCount / limit)
        return {currentPage: page, countOnPage: manufacturers.length, pagesCount, manufacturersCount,  manufacturers}
    }

    async update(id: string, dto: ManufacturerDto) {
        const manufacturer = await this.prisma.manufacturer.findUnique({where: {id}})
        if(!manufacturer) throw new NotFoundException('Manufacturer not found')
        return await this.prisma.manufacturer.update({where: {id}, data: {name: dto.name.toUpperCase()}})
    }

    async delete(id: string) {
        const manufacturer = await this.prisma.manufacturer.findUnique({where: {id}})
        if(!manufacturer) throw new NotFoundException('Manufacturer not found')
        if(manufacturer.image) await this.imagesService.deleteImage(manufacturer.image, 'manufacturers')
        await this.prisma.manufacturer.delete({where: {id}})
    }

    async uploadImage(id: string, image: Express.Multer.File) {
        if(!image) throw new BadRequestException('Image not received')
        const manufacturer = await this.prisma.manufacturer.findUnique({where: {id}})
        if(!manufacturer) throw new NotFoundException('Manufacturer not found')
        const uploadedImage =  await this.imagesService.uploadImage(image, manufacturer.id, 'manufacturers')
        const manufacturerWithImage = await this.prisma.manufacturer.update({where: {id: manufacturer.id}, data: {image: uploadedImage}})
        return manufacturerWithImage
    }

    async deleteImage(id: string) {
        const manufacturer = await this.prisma.manufacturer.findUnique({where: {id}})
        if(!manufacturer) throw new NotFoundException('Manufacturer not found')
        if(!manufacturer.image) throw new BadRequestException('Manufacturer doesnt have an image')
        await this.imagesService.deleteImage(manufacturer.image, 'manufacturers')
        await this.prisma.manufacturer.update({where: {id}, data: {image: null}})
    }
}
