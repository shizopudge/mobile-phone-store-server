import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegistrationDto } from '../auth/dto/registration.dto';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';
import { Prisma, PurchaseStatus } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ImagesService } from 'src/core/service/image.service';
import { PrismaService } from 'src/core/service/prisma.service';
import { userSelectObject } from './select/user-select.object';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private imagesService: ImagesService) {}

    async create(dto: RegistrationDto) {
      const userByEmail = await this.prisma.user.findUnique({where: {email: dto.email}})
      if(userByEmail) throw new BadRequestException('User with the same email is already exist')
      const userByUsername = await this.prisma.user.findUnique({where: {username: dto.username}})
      if(userByUsername) throw new BadRequestException('User with the same username is already exist')
      const user = await this.prisma.user.create({data: {
            email: dto.email,
            username: dto.username,
            phone: dto.phone,
            password: await hash(dto.password),
        }})
      return user
    }

    async getCurrentUser(authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader)
        return user
    }

    async getCurrentUserCart(authorizationHeader: string, page: number, limit: number, query: string, sort: string, withDiscount: boolean, newArrival: boolean, minCost: number, maxCost: number) {
        const id = this.getCurrentUserId(authorizationHeader)
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const res = await this.prisma.user.findUnique({where: {id}, select: {cart: {skip: skip, take: limit, orderBy: {cost: sort === 'asc' ? 'asc' : 'desc'}, where: {title: {contains: query},  discount: withDiscount === true ? {not: null} : undefined, createdAt: newArrival ? {gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}: undefined, cost: {gte: minCost ? minCost: undefined, lte: maxCost ? maxCost : undefined},}, include: {model: {include: {manufacturer: true, products: true}}}}}});
        let productCount = (await this.prisma.user.findUnique({where: {id}, include: {_count: {select: {cart: true}}}}))._count.cart;
        if(!productCount || isNaN(productCount)) productCount = 0
        const pageCount = Math.ceil(productCount / limit)
        return {info: {currentPage: page ?? 1, countOnPage: res.cart.length ?? 0, pageCount, itemCount: productCount ?? 0}, products: res.cart};
    }

    async getCurrentUserWishlist(authorizationHeader: string, page: number, limit: number, query: string, sort: string, withDiscount: boolean, newArrival: boolean, minCost: number, maxCost: number) {
        const id = this.getCurrentUserId(authorizationHeader)
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const res = await this.prisma.user.findUnique({where: {id}, select: {wishlist: {skip: skip, take: limit, orderBy: {cost: sort === 'asc' ? 'asc' : 'desc'}, where: {title: {contains: query},  discount: withDiscount === true ? {not: null} : undefined, createdAt: newArrival ? {gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}: undefined, cost: {gte: minCost ? minCost: undefined, lte: maxCost ? maxCost : undefined},}, include: {model: {include: {manufacturer: true, products: true}}}}}});
        let productCount = (await this.prisma.user.findUnique({where: {id}, include: {_count: {select: {wishlist: true}}}}))._count.wishlist;
        if(!productCount || isNaN(productCount)) productCount = 0
        const pageCount = Math.ceil(productCount / limit)
        return {info: {currentPage: page ?? 1, countOnPage: res.wishlist.length ?? 0, pageCount, itemCount: productCount ?? 0}, products: res.wishlist};
    }

    async getOne(id: string) {
        const user = await this.prisma.user.findUnique({where: {id}})
        if(!user) throw new NotFoundException('User not found')
        const userDto: UserDto = new UserDto(user.id, user.email, user.username, user.image, user.role, user.phone)
        return userDto
    }

    async getUserPurchases(authorizationHeader: string, page: number, limit: number, query: string, sort: string, status?: PurchaseStatus) {
        if(status) {
            if(status !== PurchaseStatus.PENDING && status != PurchaseStatus.PAID && status != PurchaseStatus.SHIPPED && status != PurchaseStatus.DELIVERED && status != PurchaseStatus.CANCELLED) throw new BadRequestException('Incorrect status')
        }
        const user = await this.getUserByAuthHeader(authorizationHeader)
        if(page === 0) page = 1
        const skip = (page - 1) * limit
        const purchases = await this.prisma.purchase.findMany({skip, take: limit, orderBy: {updatedAt: sort == 'desc' ? 'desc' : 'asc'}, where: {status: status, userId: user.id, id: {contains: query}}})
        let purchasesCount = await this.prisma.purchase.count({where: {status: status, userId: user.id, id: {contains: query}}})
        if(!purchasesCount || isNaN(purchasesCount)) purchasesCount = 0
        const pageCount = Math.ceil(purchasesCount / limit)
        return {info: {currentPage: page ?? 1, countOnPage: purchases.length ?? 0, pageCount, itemCount: purchasesCount ?? 0},  purchases}
    }

    async update(authorizationHeader: string, dto: UpdateUserDto) {
        const user = await this.getUserByAuthHeader(authorizationHeader, {password: true,})
        if (user.email !== dto.email) {
            const userByEmail = await this.prisma.user.findUnique({where: {email: dto.email}})
            if(userByEmail) throw new BadRequestException('User with the same email is already exist')
        }
        if (user.username !== dto.username) {
            const userByUsername = await this.prisma.user.findUnique({where: {username: dto.username}})
            if(userByUsername) throw new BadRequestException('User with the same username is already exist')
        }
        if (user.password === dto.newPassword) throw new BadRequestException('Your new password is the same as the old one')
        return await this.prisma.user.update({where: {id: user.id}, data: {
            email: dto.email,
            username: dto.username,
            password: dto.password === dto.newPassword || !dto.newPassword ? user.password : await hash(dto.newPassword),
            phone: dto.phone
        }, select: {
            ...userSelectObject, cart: true, wishlist: true, purchases: {where: {NOT: {status: PurchaseStatus.CANCELLED}}}
        }})
    }

    async delete(authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader, {password: true})
        if(user.image) await this.imagesService.deleteImage(user.image, 'users')
        await this.prisma.user.delete({where: {id: user.id}})
    }

    async updateRefreshToken(id: string, refreshToken: string) {
        const hashedRefreshToken = await hash(refreshToken)
        await this.prisma.user.update({where: {id}, data: {refreshToken: hashedRefreshToken}})
    }

    async removeRefreshToken(id: string) {
        await this.prisma.user.update({where: {id}, data: {refreshToken: null}})
    }

    async toggleCart(id: string, authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader, {cart: true})
        const isProductExist = await this.prisma.product.findUnique({where: {id}})
        if(!isProductExist) throw new BadRequestException('Product not found')
        const isAlreadyInCart = user.cart.some(product => product.id === id)
        const updatedUser = await this.prisma.user.update({where: {id: user.id}, data: {cart: {
            [isAlreadyInCart ? 'disconnect' : 'connect'] : {
                id
            }
        }}, include: {cart: {include: {model: {include: {manufacturer: true, products: true}}}}}})
        const updatedCart = updatedUser.cart;
        return {products: updatedCart};
    }

    async toggleWishlist(id: string, authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader, {wishlist: true})
        const isProductExist = await this.prisma.product.findUnique({where: {id}})
        if(!isProductExist) throw new BadRequestException('Product not found')
        const isAlreadyInWishlist = user.wishlist.some(product => product.id === id)
        const updatedUser = await this.prisma.user.update({where: {id: user.id}, data: {wishlist: {
            [isAlreadyInWishlist ? 'disconnect' : 'connect'] : {
                id
            }
        }}, include: {wishlist: {include: {model: {include: { manufacturer: true, products: true}}}}}})
        const updatedWishlist = updatedUser.wishlist;
        return {products: updatedWishlist};
    }

    async uploadImage(authorizationHeader: string, image: Express.Multer.File) {
        if(!image) throw new BadRequestException('Image not received')
        const user = await this.getUserByAuthHeader(authorizationHeader)
        if(user.image) await this.imagesService.deleteImage(user.image, 'users')
        const uploadedImage =  await this.imagesService.uploadImage(image, user.id, 'users')
        const userWithImage = await this.prisma.user.update({where: {id: user.id}, data: {image: uploadedImage}, select: {...userSelectObject}})
        return userWithImage
    }

    async getUserByAuthHeader(authorizationHeader: string, selectObject: Prisma.UserSelect = {}) {
        if(!authorizationHeader) throw new UnauthorizedException('Access denied')
        const accessToken = authorizationHeader.split(' ')[1]
        const payload = this.jwt.decode(accessToken)
        const uid = payload['id']
        const user = await this.prisma.user.findUnique({where: {id: uid}, select: {...userSelectObject, ...selectObject}})
        if(!user) throw new NotFoundException('User not found')
        return user
    }

    async deleteImage(authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader)
        if(!user.image) throw new BadRequestException('User doesnt have an image')
        await this.imagesService.deleteImage(user.image, 'users')
        await this.prisma.user.update({where: {id: user.id}, data: {image: null}})
    }

    getCurrentUserId(authorizationHeader: string) {
        if(!authorizationHeader) throw new UnauthorizedException('Access denied')
        const accessToken = authorizationHeader.split(' ')[1]
        const payload = this.jwt.decode(accessToken)
        const uid = payload['id'];
        return uid;
    }
}
