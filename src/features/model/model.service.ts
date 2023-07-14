import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ModelDto } from './dto/model.dto';
import { PrismaService } from 'src/core/service/prisma.service';

@Injectable()
export class ModelService {
    constructor(private prisma: PrismaService) {}

    async create(dto: ModelDto) {
        const isModelExist = await this.prisma.model.findUnique({where: {name: dto.name.toUpperCase()}})
        if(isModelExist) throw new BadRequestException('Model with the same name is already exist, please select it when creating a product')
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {id: dto.manufacturerId}})
        if(!isManufacturerExist) throw new BadRequestException('Manufacturer does not exist')
        return await this.prisma.model.create({data: {
            name: dto.name.toUpperCase(), 
            description: dto.description,
            pixelDensity: +dto.pixelDensity,
            screenRefreshRate: +dto.screenRefreshRate,
            screenDiagonal: +dto.screenDiagonal,
            weight: +dto.weight,
            screenResolution: dto.screenResolution,
            operatingSystem: dto.operatingSystem,
            displayType: dto.displayType,
            manufacturerId: dto.manufacturerId}, include: {products: {include: {model: {include: {products: true, manufacturer: true}}}}, manufacturer: true}})
    }

    async getMany(page: number, limit: number, query: string, manufacturerId: string) {
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {id: manufacturerId}})
        if(!isManufacturerExist) throw new BadRequestException('Manufacturer does not exist')
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const models = await this.prisma.model.findMany({skip, take: limit, where: {name: {contains: query}, manufacturerId: {equals: manufacturerId}}, include: {products: {include: {model: {include: {products: true, manufacturer: true}}}}, manufacturer: true}})
        let modelsCount = await this.prisma.model.count({where: {name: {contains: query}, manufacturerId: {equals: manufacturerId}}})
        if(!modelsCount || isNaN(modelsCount)) modelsCount = 0
        const pageCount = Math.ceil(modelsCount / limit)
        return {info: {currentPage: page ?? 1, countOnPage: models.length ?? 0, pageCount, itemCount: modelsCount ?? 0},  models}
    }

    async getOne(id: string) {
        const model = await this.prisma.model.findUnique({where: {id}, select: {id: true, name: true, products: true, manufacturer: true},})
        if(!model) throw new NotFoundException('Model not found')
        return model
    }

    async delete(id: string) {
        const model = await this.prisma.model.findUnique({where: {id}})
        if(!model) throw new NotFoundException('Model not found')
        await this.prisma.model.delete({where: {id}})
    }

    async update(id: string, dto: ModelDto) {
        const model = await this.prisma.model.findUnique({where: {id}})
        if(!model) throw new NotFoundException('Model not found')
        return await this.prisma.model.update({where: {id}, data: {
            name: dto.name.toUpperCase(), 
            description: dto.description,
            pixelDensity: +dto.pixelDensity,
            screenRefreshRate: +dto.screenRefreshRate,
            screenDiagonal: +dto.screenDiagonal,
            weight: +dto.weight,
            screenResolution: dto.screenResolution,
            operatingSystem: dto.operatingSystem,
            displayType: dto.displayType,
            manufacturerId: dto.manufacturerId}, include: {products: {include: {model: {include: {products: true, manufacturer: true}}}}, manufacturer: true}})
    }
}
