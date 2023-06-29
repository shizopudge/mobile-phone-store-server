import { Product, Purchase, UserRole } from "@prisma/client";

export class AuthorizedUserDto {
    constructor(id: string, email: string, username: string, image: string, phone: string, role: UserRole, cart: Product[], wishlist: Product[], purchases: Purchase[]) {
        this.id = id,
        this.email = email,
        this.username = username,
        this.image = image,
        this.phone = phone,
        this.role = role,
        this.cart = cart,
        this.wishlist = wishlist,
        this.purchases = purchases
    }
    id: string
    email: string 
    username: string 
    image: string
    phone: string 
    role: UserRole
    cart: Product[] 
    wishlist: Product[]
    purchases: Purchase[]
}