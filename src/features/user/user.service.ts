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
        //? Remove cart, wishlist and purchases
        const user = await this.getUserByAuthHeader(authorizationHeader, {cart: true, wishlist: true, purchases: {where: {NOT: {status: PurchaseStatus.CANCELLED}}}})
        return user
    }

    async getOne(id: string) {
        const user = await this.prisma.user.findUnique({where: {id}})
        if(!user) throw new NotFoundException('User not found')
        const userDto: UserDto = new UserDto(user.id, user.email, user.username, user.image, user.role, user.phone)
        return userDto
    }
    async update(authorizationHeader: string, dto: UpdateUserDto) {
        const user = await this.getUserByAuthHeader(authorizationHeader, {password: true})
        return await this.prisma.user.update({where: {id: user.id}, data: {
            email: dto.email,
            username: dto.username,
            password: dto.password === dto.newPassword || !dto.newPassword ? user.password : await hash(dto.newPassword),
            phone: dto.phone
        }, select: {
            id: true, email: true, username: true, phone: true,
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
        await this.prisma.user.update({where: {id: user.id}, data: {cart: {
            [isAlreadyInCart ? 'disconnect' : 'connect'] : {
                id
            }
        }}})
    }

    async toggleWishlist(id: string, authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader, {wishlist: true})
        const isProductExist = await this.prisma.product.findUnique({where: {id}})
        if(!isProductExist) throw new BadRequestException('Product not found')
        const isAlreadyInWishlist = user.wishlist.some(product => product.id === id)
        await this.prisma.user.update({where: {id: user.id}, data: {wishlist: {
            [isAlreadyInWishlist ? 'disconnect' : 'connect'] : {
                id
            }
        }}})
    }

    async uploadImage(authorizationHeader: string, image: Express.Multer.File) {
        if(!image) throw new BadRequestException('Image not received')
        const user = await this.getUserByAuthHeader(authorizationHeader)
        const uploadedImage =  await this.imagesService.uploadImage(image, user.id, 'users')
        const userWithImage = await this.prisma.user.update({where: {id: user.id}, data: {image: uploadedImage}})
        return userWithImage
    }

    async getUserByAuthHeader(authorizationHeader: string, selectObject: Prisma.UserSelect = {}) {
        if(!authorizationHeader) throw new UnauthorizedException('Access denied')
        const accessToken = authorizationHeader.split(' ')[1]
        const payload = this.jwt.decode(accessToken)
        const uid = payload['id']
        const user = await this.prisma.user.findUnique({where: {id: uid}, select: {...userSelectObject, ...selectObject},})
        if(!user) throw new NotFoundException('User not found')
        return user
    }

    async deleteImage(authorizationHeader: string) {
        const user = await this.getUserByAuthHeader(authorizationHeader)
        if(!user.image) throw new BadRequestException('User doesnt have an image')
        await this.imagesService.deleteImage(user.image, 'users')
        await this.prisma.user.update({where: {id: user.id}, data: {image: null}})
    }
}
