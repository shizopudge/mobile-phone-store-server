import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import { PurchaseStatus } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class PurchaseService {
    constructor(private prisma: PrismaService, private userService: UserService) {}

    async create(authorizationHeader: string, id: string) {
        const user = await this.userService.getUserByAuthHeader(authorizationHeader)
        const product = await this.prisma.product.findUnique({where: {id}})
        if(!product) throw new NotFoundException('Product not found')
        return await this.prisma.purchase.create({data: {userId: user.id, productId: product.id}})
    }

    async getOne(id: string) {
        const purchase = await this.prisma.purchase.findUnique({where: {id}, include: {user: {select: {id: true, email: true, username: true, image: true, phone: true}}, product: true}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        return purchase
    }
    
    async getMany(page: number, limit: number, query: string, sort: string, status?: PurchaseStatus) {
        if(status) {
            if(status !== PurchaseStatus.PENDING && status != PurchaseStatus.PAID && status != PurchaseStatus.SHIPPED && status != PurchaseStatus.DELIVERED && status != PurchaseStatus.CANCELLED) throw new BadRequestException('Incorrect status')
        }
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const purchases = await this.prisma.purchase.findMany({skip: skip, take: limit, orderBy: {updatedAt: sort === 'desc' ? 'desc' : 'asc'}, where: {status: status, OR: [{id: {contains: query.toLowerCase()}}, {product: {title: {contains: query}}}]}})
        const purchasesCount = await this.prisma.purchase.count({where: {status: status, OR: [{id: {contains: query.toLowerCase()}}, {product: {title: {contains: query}}},]}})
        const pagesCount = Math.ceil(purchasesCount / limit)
        return {currentPage: page, countOnPage: purchases.length, pagesCount, purchasesCount,  purchases}
    }

    async patch(id: string, status: PurchaseStatus) {
        if(status !== PurchaseStatus.PENDING && status !== PurchaseStatus.PAID && status !== PurchaseStatus.SHIPPED && status !== PurchaseStatus.DELIVERED && status != PurchaseStatus.CANCELLED) throw new BadRequestException('Incorrect status')
        const purchase = await this.prisma.purchase.findUnique({where: {id}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        return await this.prisma.purchase.update({where: {id}, data: {status: status}})
    }

    async delete(id: string) {
        const purchase = await this.prisma.purchase.findUnique({where: {id}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        await this.prisma.purchase.delete({where: {id}}) 
    }
}
