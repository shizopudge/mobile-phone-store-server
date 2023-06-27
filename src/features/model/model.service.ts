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
        const model = await this.prisma.model.create({data: {
            name: dto.name.toUpperCase(), 
            pixelDensity: dto.pixelDensity,
            screenRefreshRate: dto.screenRefreshRate,
            screenDiagonal: dto.screenDiagonal,
            weight: dto.weight,
            screenResolution: dto.screenResolution,
            operatingSystem: dto.operatingSystem,
            displayType: dto.displayType,
            manufacturerId: dto.manufacturerId}})
        return model
    }

    async getMany(page: number, limit: number, query: string, manufacturerId: string) {
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {id: manufacturerId}})
        if(!isManufacturerExist) throw new BadRequestException('Manufacturer does not exist')
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const models = await this.prisma.model.findMany({skip, take: limit, select: {id: true, name: true, products: true, manufacturer: true}, where: {name: {contains: query}, manufacturerId: {equals: manufacturerId}}})
        const modelsCount = await this.prisma.model.count({where: {name: {contains: query}, manufacturerId: {equals: manufacturerId}}})
        const pagesCount = Math.ceil(modelsCount / limit)
        return {currentPage: page, countOnPage: models.length, pagesCount,  modelsCount, models}
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
            pixelDensity: dto.pixelDensity,
            screenRefreshRate: dto.screenRefreshRate,
            screenDiagonal: dto.screenDiagonal,
            weight: dto.weight,
            screenResolution: dto.screenResolution,
            operatingSystem: dto.operatingSystem,
            displayType: dto.displayType,
            manufacturerId: dto.manufacturerId}})
    }
}
