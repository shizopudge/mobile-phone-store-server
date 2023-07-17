import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service';
import { PurchaseStatus, Product } from '@prisma/client';
import { UserService } from '../user/user.service';
import { PurchaseReturnDto } from './dto/purchase-return.dto';
import { uuid } from 'short-uuid';
import { checkout } from 'src/core/utils/checkout';

@Injectable()
export class PurchaseService {
    constructor(private prisma: PrismaService, private userService: UserService) {}

    async create(authorizationHeader: string, ids: string[]) {
        let productIds : string[] = [];
        if(productIds.length <= 1) {
             productIds = [ids.toString()]
        } else {
            productIds = [...ids]
        }
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
                return_url: 'http://localhost:50510/#/'
            },
            description: "The order amount is displayed in rubles.",
            
        }, uuid());
        const purchase = await this.prisma.purchase.create({data: {id: payment.id, userId: user.id}})
        const purchaseItems = []
        products.forEach(product => purchaseItems.push({productId: product.id, purchaseId: purchase.id}))
        await this.prisma.purchaseItem.createMany({data: purchaseItems})
        const finalPurchase = await this.prisma.purchase.findUnique({where: {id: purchase.id}, include: {purchaseItems: {include: {product: {include: {model: {include: {manufacturer: true, products: true}}}}}}}})
        const purchaseDto = new PurchaseReturnDto(finalPurchase.id, finalPurchase.createdAt, finalPurchase.updatedAt, finalPurchase.status, finalPurchase.userId);
        const purchasedProducts: Product[] = []
        finalPurchase.purchaseItems.forEach(purchaseItem => purchasedProducts.push(purchaseItem.product))
        for await (const product of purchasedProducts) {
            await this.prisma.product.update({where: {id: product.id}, data: {inStockCount: {decrement: 1}}})
        }
        this._waitingForPayment(payment.id)
        return {purchase: purchaseDto, payment: {id: payment.id, cost: payment.amount.value, currency: payment.amount.currency, description: payment.description, url: payment.confirmation.confirmation_url }, products: purchasedProducts }
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

    _waitingForPayment(paymentId: string) {
        let checkCount = 0;
        const interval = setInterval(async () => {
             const payment = await checkout.getPayment(paymentId)
             checkCount +=1
             if(payment.status == 'waiting_for_capture') {
                    await checkout.capturePayment(paymentId, payment, paymentId)
                    console.log(`User entered data. Status: ${payment.status}, Check Count: ${checkCount}, Created at: ${payment.created_at}`)
             } else if (payment.status == 'succeeded') {
                clearInterval(interval)
                await this.updateStatus(paymentId, PurchaseStatus.PAID)
                console.log(`User paid. Status: ${payment.status}, Check Count: ${checkCount}, Created at: ${payment.created_at}`)
             } else if (checkCount >= 50) {
                clearInterval(interval)
                const finalPurchase = await this.prisma.purchase.findUnique({where: {id: paymentId}, include: {purchaseItems: {include: {product: {include: {model: {include: {manufacturer: true, products: true}}}}}}}})
                const purchasedProducts: Product[] = []
                finalPurchase.purchaseItems.forEach(purchaseItem => purchasedProducts.push(purchaseItem.product))
                for await (const product of purchasedProducts) {
                    await this.prisma.product.update({where: {id: product.id}, data: {inStockCount: {increment: 1}}})
                }
                await this.prisma.purchase.delete({where: {id: paymentId}})
                console.log(`Payment cancelled. Status: ${payment.status}, Check Count: ${checkCount}, Created at: ${payment.created_at}`)
             }
             console.log(`Payment checked ${payment.status}, Check Count: ${checkCount}, Created at: ${payment.created_at}`)
         }, 5000)
     }
}
