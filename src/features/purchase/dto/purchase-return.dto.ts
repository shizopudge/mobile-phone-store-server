import { PurchaseStatus } from "@prisma/client";

export class PurchaseReturnDto {
    constructor(id: string, createdAt: Date, updatedAt: Date, status: PurchaseStatus, userId: string) {
        this.id =id,
        this.createdAt = createdAt,
        this.updatedAt = updatedAt,
        this.status = status,
        this.userId = userId
    }

    id: string
    createdAt: Date
    updatedAt: Date
    status: PurchaseStatus
    userId: string
}