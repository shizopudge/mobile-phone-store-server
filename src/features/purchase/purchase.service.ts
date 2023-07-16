import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import { PurchaseStatus, Product } from '@prisma/client';
import { UserService } from '../user/user.service';
import { ICreatePayment } from '@a2seven/yoo-checkout';
import { PurchaseReturnDto } from './dto/purchase-return.dto';
import { uuid } from 'short-uuid';
import { checkout } from 'src/core/utils/checkout';

@Injectable()
export class PurchaseService {
    constructor(private prisma: PrismaService, private userService: UserService) {}

    async create(authorizationHeader: string, productIds: string[]) {
        const user = await this.userService.getUserByAuthHeader(authorizationHeader)
        const products: Product[] = await this._findProducts(productIds)
        let cost = 0;
        products.forEach(product => {
            if (product.discount) {
                cost += product.cost - (product.cost / 100 * product.discount)
            } else {
                cost += product.cost
            }
        })
        const payment = await checkout.createPayment({
            amount: {
                value: `${cost * 90}`,
                currency: 'RUB'
            },
            payment_method_data: {
                type: 'bank_card'
            },
            confirmation: {
                type: 'redirect',
                return_url: 'https://www.youtube.com/'
            },
            description: "The order amount is displayed in rubles",
            
        }, uuid());
        const purchase = await this.prisma.purchase.create({data: {userId: user.id, paymentId: payment.id}})
        const purchaseItems = []
        products.forEach(product => purchaseItems.push({productId: product.id, purchaseId: purchase.id}))
        await this.prisma.purchaseItem.createMany({data: purchaseItems})
        const finalPurchase = await this.prisma.purchase.findUnique({where: {id: purchase.id}, include: {purchaseItems: {include: {product: {include: {model: {include: {manufacturer: true, products: true}}}}}}}})
        const purchaseDto = new PurchaseReturnDto(finalPurchase.id, finalPurchase.createdAt, finalPurchase.updatedAt, finalPurchase.status, finalPurchase.userId);
        const purchasedProducts: Product[] = []
        finalPurchase.purchaseItems.forEach(purchaseItem => purchasedProducts.push(purchaseItem.product))
        return {purchase: purchaseDto, payment, products: purchasedProducts }
    }

    async getOne(id: string) {
        const purchase = await this.prisma.purchase.findUnique({where: {id}, include: {purchaseItems: {include: {product: {include: {model: {include: {manufacturer: true, products: true}}}}}}}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        const purchaseDto = new PurchaseReturnDto(purchase.id, purchase.createdAt, purchase.updatedAt, purchase.status, purchase.userId);
        const purchasedProducts: Product[] = []
        purchase.purchaseItems.forEach(purchaseItem => purchasedProducts.push(purchaseItem.product))
        return {purchase: purchaseDto, products: purchasedProducts}
    }
    
    async getMany(page: number, limit: number, query: string, sort: string, status?: PurchaseStatus) {
        if(status) {
            if(status !== PurchaseStatus.PENDING && status != PurchaseStatus.PAID && status != PurchaseStatus.SHIPPED && status != PurchaseStatus.DELIVERED && status != PurchaseStatus.CANCELLED) throw new BadRequestException('Incorrect status')
        }
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const purchases = await this.prisma.purchase.findMany({skip, take: limit, orderBy: {updatedAt: sort == 'desc' ? 'desc' : 'asc'}, where: {status: status, OR: [{id: {contains: query}}, {userId: {contains: query}}]}})
        let purchasesCount = await this.prisma.purchase.count({where: {status: status, OR: [{id: {contains: query}}, {userId: {contains: query}}]}})
        if(!purchasesCount || isNaN(purchasesCount)) purchasesCount = 0
        const pageCount = Math.ceil(purchasesCount / limit)
        return {info: {currentPage: page ?? 1, countOnPage: purchases.length ?? 0, pageCount, itemCount: purchasesCount ?? 0},  purchases}
    }

    async updateStatus(id: string, status: PurchaseStatus) {
        if(status !== PurchaseStatus.PENDING && status !== PurchaseStatus.PAID && status !== PurchaseStatus.SHIPPED && status !== PurchaseStatus.DELIVERED && status != PurchaseStatus.CANCELLED) throw new BadRequestException('Incorrect status')
        const purchase = await this.prisma.purchase.findUnique({where: {id}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        return await this.prisma.purchase.update({where: {id}, data: {status: status}})
    }

    async update(id: string, productIds: string[]) {
        const purchase = await this.prisma.purchase.findUnique({where: {id}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        const products: Product[] = await this._findProducts(productIds)
        const purchaseItems = []
        products.forEach(product => purchaseItems.push({productId: product.id, purchaseId: purchase.id}))
        await this.prisma.purchaseItem.deleteMany({where: {purchaseId: id}})
        await this.prisma.purchaseItem.createMany({data: purchaseItems})
        const finalPurchase = await this.prisma.purchase.findUnique({where: {id: purchase.id}, include: {purchaseItems: {include: {product: {include: {model: {include: {manufacturer: true, products: true}}}}}}}})
        const purchaseDto = new PurchaseReturnDto(finalPurchase.id, finalPurchase.createdAt, finalPurchase.updatedAt, finalPurchase.status, finalPurchase.userId);
        const purchasedProducts: Product[] = []
        finalPurchase.purchaseItems.forEach(purchaseItem => purchasedProducts.push(purchaseItem.product))
        return {purchase: purchaseDto, products: purchasedProducts}
    }

    async delete(id: string) {
        const purchase = await this.prisma.purchase.findUnique({where: {id}})
        if(!purchase) throw new NotFoundException('Purchase not found')
        await this.prisma.purchase.delete({where: {id}}) 
    }

    async _findProducts(productIds: string[]) {
        const products: Product[] = []
        for await (const productId of productIds) {
            const product = await this.prisma.product.findUnique({where: {id: productId}})
            if(!product) throw new NotFoundException('Product not found')
            products.push(product)
        }
        return products
    }
}
