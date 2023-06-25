import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/utils/prisma.service';
import { ModelDto } from './dto/model.dto';

@Injectable()
export class ModelService {
    constructor(private prisma: PrismaService) {}

    async getMany(page: number, limit: number, name: string, manufacturerId: number) {
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {id: manufacturerId}})
        if(!isManufacturerExist) throw new BadRequestException('Manufacturer does not exist')
        if(page === 1) {
            const models = await this.prisma.model.findMany({take: limit, select: {id: true, name: true, products: true, manufacturer: true}, where: {name: {contains: name}, manufacturerId: {equals: manufacturerId}}})
            const allModelsCount = await this.prisma.model.count({where: {name: {contains: name}, manufacturerId: {equals: manufacturerId}}})
            const allPagesCount = Math.ceil(allModelsCount / limit)
            return {currentPage: page, countOnPage: models.length, allPagesCount,  allModelsCount, models}
        }
        const skip = (page - 1) * limit
        const models = await this.prisma.model.findMany({skip, take: limit, select: {id: true, name: true, products: true, manufacturer: true}, where: {name: {contains: name}, manufacturerId: {equals: manufacturerId}}})
        const allModelsCount = await this.prisma.model.count({where: {name: {contains: name}, manufacturerId: {equals: manufacturerId}}})
        const allPagesCount = Math.ceil(allModelsCount / limit)
        return {currentPage: page, countOnPage: models.length, allPagesCount,  allModelsCount, models}
    }

    async getOne(id: number) {
        const model = await this.prisma.model.findUnique({where: {id}, select: {id: true, name: true, products: true, manufacturer: true},})
        if(!model) throw new NotFoundException('Model not found')
        return model
    }

    async create(dto: ModelDto) {
        const isModelExist = await this.prisma.model.findUnique({where: {name: dto.name}})
        if(isModelExist) throw new BadRequestException('Model with the same name is already exist, please select it when creating a product')
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {id: dto.manufacturerId}})
        if(!isManufacturerExist) throw new BadRequestException('Manufacturer does not exist')
        const model = await this.prisma.model.create({data: {name: dto.name.toUpperCase(), manufacturerId: dto.manufacturerId}})
        return model
    }

    async delete(id: number) {
        const model = await this.prisma.model.findUnique({where: {id}})
        if(!model) throw new NotFoundException('Model not found')
        await this.prisma.model.delete({where: {id}})
    }

    async patch(id: number, dto: ModelDto) {
        const model = await this.prisma.model.findUnique({where: {id}})
        if(!model) throw new NotFoundException('Model not found')
        if(model.name === dto.name) throw new BadRequestException('Nothing to change')
        await this.prisma.model.update({where: {id}, data: {name: dto.name.toUpperCase()}})
    }
}
