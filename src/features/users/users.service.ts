import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegistrationDto } from '../auth/dto/registration.dto';
import { hash } from 'argon2';
import { PrismaService } from 'src/core/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private jwt: JwtService,) {}

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

    async getOne(id: number) {
        const user = await this.getOneById(id)
        if(!user) throw new NotFoundException('User not found')
        const userDto: UserDto = new UserDto(user.id, user.email, user.username, user.image, user.role, user.phone)
        return userDto
    }

    async delete(authorizationHeader: string) {
        if(!authorizationHeader) throw new UnauthorizedException('Access denied')
        const refreshToken = authorizationHeader.split(' ')[1]
        const payload = this.jwt.decode(refreshToken)
        const uid = payload['id']
        const user = await this.getOneById(uid)
        if(!user) throw new NotFoundException('User not found')
        await this.prisma.user.delete({where: {id: user.id}})
    }

    async getOneByEmail(email: string) {
        const user = await this.prisma.user.findUnique({where: {email}})
        return user
    }

    async getOneById(id: number) {
        const user = await this.prisma.user.findUnique({where: {id}})
        return user
    }

    async updateRefreshToken(id: number, refreshToken: string) {
        const hashedRefreshToken = await hash(refreshToken)
        await this.prisma.user.update({where: {id}, data: {refreshToken: hashedRefreshToken}})
    }

    async removeRefreshToken(id: number) {
        await this.prisma.user.update({where: {id}, data: {refreshToken: null}})
    }
}
