import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { ModelService } from '../model/model.service';
import { slugify } from 'src/core/utils/slugify';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/service/prisma.service';
import { ImagesService } from 'src/core/service/image.service';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService, private modelService: ModelService, private jwt: JwtService, private imagesService: ImagesService) {}

    async create(dto: ProductDto) {
        const model = await this.modelService.getOne(dto.modelId)
        const title = `${model.manufacturer.name} ${model.name}, ${dto.color.toUpperCase()}, ${dto.storage}`
        const isProductExist = await this.prisma.product.findUnique({where: {title}})
        if(isProductExist) throw new BadRequestException('Product with the same title is already exist')
        const slug = slugify(`${model.manufacturer.name} ${model.name} ${dto.color} ${dto.storage}`)
        const product = await this.prisma.product.create({data: {
            title,
            slug,
            inStockCount: dto.inStockCount,
            cost: dto.cost,
            color: dto.color,
            colorCode: dto.colorCode,
            storage: dto.storage,
            discount: dto.discount,
            modelId: dto.modelId,
        }})
        return product
    }

    async getOne(id: string) {
        const product = await this.prisma.product.findUnique({where: {id}, include: {model: {include: {manufacturer: true, products: true}}}})
        if(!product) throw new NotFoundException('Product not found')
        return product
    }

    async getMany(page: number, limit: number, query: string, sort: string, withDiscount: boolean, newArrival: boolean, minCost: number, maxCost: number) {
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const products = await this.prisma.product.findMany({skip, take: limit, orderBy: {cost: sort === 'asc' ? 'asc' : 'desc'}, where: {title: {contains: query},  discount: withDiscount === true ? {not: null} : undefined, createdAt: newArrival ? {gte: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}: undefined, cost: {gte: minCost ? minCost: undefined, lte: maxCost ? maxCost : undefined},}, include: {model: {include: {manufacturer: true, products: true}}}})
        const productCount = await this.prisma.product.count({where: {title: {contains: query}}})
        const pageCount = Math.ceil(productCount / limit)
        return {info: {currentPage: page, countOnPage: products.length, pageCount, itemCount: productCount},  products}
    }

    async update(id: string, dto: ProductDto) {
        const product = await this.prisma.product.findUnique({where: {id}})
        if(!product) throw new NotFoundException('Product not found')
        const model = await this.modelService.getOne(dto.modelId)
        const title = `${model.manufacturer.name} ${model.name}, ${dto.color.toUpperCase()}, ${dto.storage}`
        const slug = slugify(`${model.manufacturer.name} ${model.name} ${dto.color} ${dto.storage}`)
        return await this.prisma.product.update({where: {id}, data: {
            title,
            slug,
            inStockCount: dto.inStockCount,
            cost: dto.cost,
            color: dto.color,
            colorCode: dto.colorCode,
            storage: dto.storage,
            discount: dto.discount,
            modelId: dto.modelId,
        }})
    }

    async delete(id: string) {
        const product = await this.prisma.product.findUnique({where: {id}})
        if(!product) throw new NotFoundException('Product not found')
        if(product.images.length === 1) await this.imagesService.deleteImage(product.images[0], 'products')
        if(product.images.length > 1) await this.imagesService.deleteImages(product.images, 'products')
        await this.prisma.product.delete({where: {id}})
    }

    async uploadImages(id: string, images: Express.Multer.File[]) {
        if(!images) throw new BadRequestException('Images not received')
        const product = await this.prisma.product.findUnique({where: {id}})
        if(!product) throw new NotFoundException('Product not found')
        if(product.images.length + images.length > 10) {
            throw new BadRequestException('Cant upload more than 10 images')
        }
        const uploadedImages =  await this.imagesService.uploadImages(images, product.id, 'products')
        const productWithImages = await this.prisma.product.update({where: {id}, data: {images: [...product.images, ...uploadedImages]}})
        return productWithImages
    }

    async deleteImages(id: string, imagesLinks: string[]) {
        if(!imagesLinks) throw new BadRequestException('Images links not received')
        if(imagesLinks.length === 0) throw new BadRequestException('Images links not received')
        const product = await this.prisma.product.findUnique({where: {id}})
        if(!product) throw new NotFoundException('Product not found')
        if(!product.images) throw new BadRequestException('Product doesnt have an images')
        if(imagesLinks.length === 1) await this.imagesService.deleteImage(imagesLinks[0], 'products')
        if(imagesLinks.length > 1) await this.imagesService.deleteImages(imagesLinks, 'products')
        const filteredImagesLinks = product.images.filter(imageLink => !imagesLinks.includes(imageLink))
        await this.prisma.product.update({where: {id}, data: {images: filteredImagesLinks}})
    }
}
