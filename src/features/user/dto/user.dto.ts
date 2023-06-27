import { UserRole } from "@prisma/client"

export class UserDto {
    constructor(id: string, email: string, username: string, image: string, role: UserRole, phone?: string) {
        this.id = id
        this.email = email
        this.username = username
        this.image = image
        this.role = role
        this.phone = phone
    }
    id: string
    email: string
    username: string
    image: string
    role: UserRole
    phone?: string
}