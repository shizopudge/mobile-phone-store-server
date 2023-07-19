import { Product, PurchaseStatus } from "@prisma/client";

export class PurchaseReturnDto {
    constructor(id: string, createdAt: Date, updatedAt: Date, status: PurchaseStatus, cost: string, paymentUrl: string, currency: string, userId: string, products: Product[], description?: string) {
        this.id =id
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.status = status
        this.cost = cost,
        this.paymentUrl = paymentUrl,
        this.currency = currency,
        this.description = description,
        this.userId = userId
        this.products = products
    }

    id: string
    createdAt: Date
    updatedAt: Date
    status: PurchaseStatus
    cost: string
    paymentUrl: string
    currency: string
    description?: string
    userId: string
    products: Product[]
}