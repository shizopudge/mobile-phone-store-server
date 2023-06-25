import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/utils/prisma.service';
import { ManufacturerDto } from './dto/manufacturer.dto';

@Injectable()
export class ManufacturerService {
    constructor(private prisma: PrismaService) {}

    async create(dto: ManufacturerDto) {
        const isManufacturerExist = await this.prisma.manufacturer.findUnique({where: {name: dto.name}})
        if(isManufacturerExist) throw new BadRequestException('Manufacturer is already exist, please select it when creating a product')
        const manufacturer = await this.prisma.manufacturer.create({data: dto})
        return manufacturer
    }

    async getMany(page: number, limit: number, name: string) {
        if(page === 1) {
            const manufacturers = await this.prisma.manufacturer.findMany({take: limit, where: {name: {contains: name}}, include: {_count: {select:{models: true}}}})
            const allManufacturersCount = await this.prisma.manufacturer.count({where: {name: {contains: name}}})
            const allPagesCount = Math.ceil(allManufacturersCount / limit)
            return {currentPage: page, countOnPage: manufacturers.length, allPagesCount, allManufacturersCount,  manufacturers}
        }
        const skip = (page - 1) * limit
        const manufacturers = await this.prisma.manufacturer.findMany({skip, take: limit, where: {name: {contains: name}}, include: {_count: {select:{models: true}}}})
        const allManufacturersCount = await this.prisma.manufacturer.count({where: {name: {contains: name}}})
        const allPagesCount = Math.ceil(allManufacturersCount / limit)
        return {currentPage: page, countOnPage: manufacturers.length, allPagesCount, allManufacturersCount,  manufacturers}
    }
}
